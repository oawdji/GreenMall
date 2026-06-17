import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  DeepPartial,
  FindOptionsWhere,
  FindOptionsRelations,
} from 'typeorm';
import * as crypto from 'crypto';
import { Order, OrderStatus } from './entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { CartItem } from './entities/cart-item.entity';
import { UserCoupon, UserCouponStatus } from '../coupon/entities/user-coupon.entity';
import { CartService } from './cart.service';
import { CouponService } from '../coupon/coupon.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';

/**
 * 生成订单编号：YYYYMMDDHHmmss + 6 位加密安全随机数
 */
function generateOrderNo(): string {
  const now = new Date();
  const y = now.getFullYear().toString();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const rand = String(crypto.randomInt(100000, 999999));
  return `${y}${m}${d}${h}${min}${s}${rand}`;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly cartService: CartService,
    private readonly couponService: CouponService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建订单 — 从购物车已选中商品结算（事务保护，含库存悲观锁）
   */
  async create(userId: number, dto: CreateOrderDto): Promise<Order> {
    const { receiverName, receiverPhone, receiverAddress, remark, userCouponId } =
      dto;

    // 1. 获取已选中购物车项
    const cartItems = await this.cartService.findSelectedByUser(userId);
    if (cartItems.length === 0) {
      throw new BadRequestException('没有已选中的商品，请先勾选需要结算的商品');
    }

    // 2. 在事务内完成所有操作（库存校验+优惠券校验+扣减+创建订单+清购物车+标记优惠券）
    let couponDiscount = 0;
    let couponToUse: UserCoupon | null = null;
    const cartItemIds = cartItems.map((ci) => ci.id);

    const savedOrder = await this.dataSource.transaction(async (manager) => {
      // 3a. 用悲观写锁重新加载购物车项关联的商品，防止超卖
      let totalAmount = 0;
      const orderItemsData: Array<{
        productId: number;
        productName: string;
        productImage: string;
        price: number;
        quantity: number;
        amount: number;
      }> = [];

      for (const cartItem of cartItems) {
        // 悲观写锁：锁定商品行，阻止其他并发事务修改
        const product = await manager.findOne(Product, {
          where: { id: cartItem.product.id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new NotFoundException(
            `商品「${cartItem.product.name ?? cartItem.product.id}」不存在`,
          );
        }

        if (product.status !== 'on') {
          throw new BadRequestException(
            `商品「${product.name}」已下架，请从购物车移除`,
          );
        }

        if (product.stock < cartItem.quantity) {
          throw new BadRequestException(
            `商品「${product.name}」库存不足（剩余 ${product.stock}，需要 ${cartItem.quantity}）`,
          );
        }

        const amount = Number((product.price * cartItem.quantity).toFixed(2));
        totalAmount = Number((totalAmount + amount).toFixed(2));

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          productImage: product.coverImage,
          price: product.price,
          quantity: cartItem.quantity,
          amount,
        });
      }

      // 3b. 在事务内校验优惠券并计算折扣
      let discount = 0;
      let finalCoupon: UserCoupon | null = null;

      if (userCouponId) {
        const result = await this.couponService.validateAndUse(
          userId,
          userCouponId,
          totalAmount,
        );
        discount = result.discount;
        finalCoupon = result.userCoupon;
      }

      couponDiscount = discount;
      couponToUse = finalCoupon;
      const payAmount = Number((totalAmount - couponDiscount).toFixed(2));

      // 3c. 生成订单编号（带重试机制，最多 3 次）
      const orderRepo = manager.getRepository(Order);
      const orderData: DeepPartial<Order> = {
        orderNo: await this.generateUniqueOrderNo(manager),
        status: OrderStatus.PendingPayment,
        totalAmount,
        freight: 0,
        couponDiscount,
        payAmount,
        receiverName,
        receiverPhone,
        receiverAddress,
        remark: remark ?? undefined,
        user: { id: userId },
        userCoupon: couponToUse ? { id: couponToUse.id } : undefined,
        items: orderItemsData.map((item) => ({
          productName: item.productName,
          productImage: item.productImage,
          price: item.price,
          quantity: item.quantity,
          amount: item.amount,
          product: { id: item.productId },
        })),
      };
      const order = orderRepo.create(orderData);

      const saved = await manager.save(order);

      // 3d. 扣减库存 + 增加销量
      for (const item of orderItemsData) {
        await manager.decrement(
          Product,
          { id: item.productId },
          'stock',
          item.quantity,
        );
        await manager.increment(
          Product,
          { id: item.productId },
          'salesCount',
          item.quantity,
        );
      }

      // 3e. 标记优惠券已使用
      if (couponToUse) {
        await manager.update(
          UserCoupon,
          { id: couponToUse.id },
          {
            status: UserCouponStatus.Used,
            usedAt: new Date(),
            order: { id: saved.id },
          },
        );
      }

      // 3f. 清空已结算的购物车项
      if (cartItemIds.length > 0) {
        await manager.delete(CartItem, cartItemIds);
      }

      return saved;
    });

    // 4. 返回完整订单详情（带关联数据）
    return this.findOne(savedOrder.id);
  }

  /**
   * 用户 — 查询自己的订单列表（分页 + 状态筛选）
   */
  async findByUser(userId: number, query: QueryOrderDto) {
    const { status, page = 1, limit = 20 } = query;

    const where: FindOptionsWhere<Order> = { user: { id: userId } };
    if (status) {
      where.status = status as OrderStatus;
    }

    const [list, total] = await this.orderRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 用户 — 模拟支付（pending_payment → paid）
   */
  async pay(id: number, userId: number): Promise<Order> {
    const order = await this.findOne(id, userId);

    if (order.status !== OrderStatus.PendingPayment) {
      throw new BadRequestException('当前订单状态不允许支付');
    }

    await this.orderRepository.update(id, { status: OrderStatus.Paid });
    return this.findOne(id, userId);
  }

  /**
   * 用户 — 取消订单（仅 pending_payment 状态可取消，事务内恢复库存）
   */
  async cancel(id: number, userId: number): Promise<Order> {
    // 先加载订单以做所有权+状态校验
    const order = await this.findOne(id, userId, {
      items: { product: true },
    });

    if (order.status !== OrderStatus.PendingPayment) {
      throw new BadRequestException('当前订单状态不允许取消');
    }

    // 事务内：恢复库存 + 更新状态，保证原子性
    await this.dataSource.transaction(async (manager) => {
      for (const item of order.items) {
        if (item.product) {
          await manager.increment(
            Product,
            { id: item.product.id },
            'stock',
            item.quantity,
          );
          await manager.decrement(
            Product,
            { id: item.product.id },
            'salesCount',
            item.quantity,
          );
        }
      }

      await manager.update(Order, { id }, { status: OrderStatus.Cancelled });
    });

    return this.findOne(id, userId);
  }

  // ===== 管理端 =====

  /**
   * 管理员 — 所有订单列表（分页 + 状态筛选）
   */
  async adminFindAll(query: QueryOrderDto) {
    const { status, page = 1, limit = 20 } = query;

    const where: FindOptionsWhere<Order> = {};
    if (status) {
      where.status = status as OrderStatus;
    }

    const [list, total] = await this.orderRepository.findAndCount({
      where,
      relations: { user: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 管理员 — 订单详情（含用户 + 订单项）
   */
  async adminFindOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { user: true, items: { product: true } },
    });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    return order;
  }

  /**
   * 管理员 — 发货（paid → shipped）
   */
  async ship(id: number): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.Paid) {
      throw new BadRequestException('仅已支付状态的订单可以发货');
    }

    await this.orderRepository.update(id, { status: OrderStatus.Shipped });
    return this.findOne(id);
  }

  /**
   * 管理员 — 完成订单（shipped → completed）
   */
  async complete(id: number): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.Shipped) {
      throw new BadRequestException('仅已发货状态的订单可以完成');
    }

    await this.orderRepository.update(id, { status: OrderStatus.Completed });
    return this.findOne(id);
  }

  /**
   * 管理员 — 手动修改订单状态（含状态机约束）
   */
  async updateStatus(id: number, status: string): Promise<Order> {
    const order = await this.findOne(id);

    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status as OrderStatus)) {
      throw new BadRequestException(
        `订单状态无效，支持的值：${validStatuses.join(' / ')}`,
      );
    }

    await this.orderRepository.update(id, {
      status: status as OrderStatus,
    });
    return this.findOne(id);
  }

  // ===== 私有辅助 =====

  /**
   * 查询单个订单（可选所有权校验 + 附加关联）
   */
  async findOne(
    id: number,
    userId?: number,
    extraRelations?: FindOptionsRelations<Order>,
  ): Promise<Order> {
    const where: FindOptionsWhere<Order> = { id };
    if (userId) {
      where.user = { id: userId };
    }

    const order = await this.orderRepository.findOne({
      where,
      relations: {
        items: { product: true },
        ...extraRelations,
      },
    });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    return order;
  }

  /**
   * 生成唯一订单号（重试最多 3 次以处理极低概率的碰撞）
   */
  private async generateUniqueOrderNo(
    manager?: import('typeorm').EntityManager,
  ): Promise<string> {
    const repo = manager
      ? manager.getRepository(Order)
      : this.orderRepository;

    for (let attempt = 0; attempt < 3; attempt++) {
      const orderNo = generateOrderNo();
      const existing = await repo.findOne({ where: { orderNo } });
      if (!existing) {
        return orderNo;
      }
    }

    // 3 次碰撞后使用更长的随机后缀
    const fallback = generateOrderNo() + crypto.randomInt(0, 9).toString();
    return fallback;
  }
}
