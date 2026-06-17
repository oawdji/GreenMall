import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere, FindOptionsRelations } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { CartItem } from './entities/cart-item.entity';
import { UserCoupon, UserCouponStatus } from '../coupon/entities/user-coupon.entity';
import { CartService } from './cart.service';
import { CouponService } from '../coupon/coupon.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';

/**
 * 生成订单编号：YYYYMMDDHHmmss + 6 位随机数
 */
function generateOrderNo(): string {
  const now = new Date();
  const y = now.getFullYear().toString();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const rand = Math.floor(100000 + Math.random() * 900000).toString();
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
   * 创建订单 — 从购物车已选中商品结算（事务保护）
   */
  async create(userId: number, dto: CreateOrderDto): Promise<Order> {
    const { receiverName, receiverPhone, receiverAddress, remark, userCouponId } = dto;

    // 1. 获取已选中购物车项
    const cartItems = await this.cartService.findSelectedByUser(userId);
    if (cartItems.length === 0) {
      throw new BadRequestException('没有已选中的商品，请先勾选需要结算的商品');
    }

    // 2. 校验库存并计算总金额
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
      const product = cartItem.product;

      if (product.status !== 'on') {
        throw new BadRequestException(`商品「${product.name}」已下架，请从购物车移除`);
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

    // 3. 优惠券校验与计算
    let couponDiscount = 0;
    let couponToUse: UserCoupon | null = null;

    if (userCouponId) {
      const result = await this.couponService.validateAndUse(
        userId,
        userCouponId,
        totalAmount,
      );
      couponDiscount = result.discount;
      couponToUse = result.userCoupon;
    }

    const payAmount = Number((totalAmount - couponDiscount).toFixed(2));

    // 4. 生成订单编号
    const orderNo = generateOrderNo();

    // 5. 创建订单实体
    // TypeORM create() 搭配嵌套 relations 时类型推断有限，需类型断言
    const order = this.orderRepository.create({
      orderNo,
      status: OrderStatus.PendingPayment,
      totalAmount,
      freight: 0,
      couponDiscount,
      payAmount,
      receiverName,
      receiverPhone,
      receiverAddress,
      remark: remark ?? null,
      user: { id: userId },
      userCoupon: couponToUse ? { id: couponToUse.id } : null,
      items: orderItemsData.map((item) => ({
        productName: item.productName,
        productImage: item.productImage,
        price: item.price,
        quantity: item.quantity,
        amount: item.amount,
        product: { id: item.productId },
      })),
    } as unknown as Order);

    // 6. 事务内：保存订单 → 扣减库存 → 标记优惠券已用 → 清空购物车
    const cartItemIds = cartItems.map((ci) => ci.id);
    const savedOrder = await this.dataSource.transaction(async (manager) => {
      const saved = await manager.save(order);

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

      // 标记优惠券已使用
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

      if (cartItemIds.length > 0) {
        await manager.delete(CartItem, cartItemIds);
      }

      return saved;
    });

    // 7. 返回完整订单详情
    return this.findOne(savedOrder.id);
  }

  /**
   * 用户 — 查询自己的订单列表（分页 + 状态筛选）
   */
  async findByUser(userId: number, query: QueryOrderDto) {
    const { status, page = 1, limit = 20 } = query;

    const where: Record<string, unknown> = { user: { id: userId } };
    if (status) {
      where.status = status;
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

    order.status = OrderStatus.Paid;
    return this.orderRepository.save(order);
  }

  /**
   * 用户 — 取消订单（仅 pending_payment 状态可取消，恢复库存）
   */
  async cancel(id: number, userId: number): Promise<Order> {
    // 加载嵌套关系（items.product）以恢复库存
    const order = await this.findOne(id, userId, { items: { product: true } });

    if (order.status !== OrderStatus.PendingPayment) {
      throw new BadRequestException('当前订单状态不允许取消');
    }

    // 恢复库存
    for (const item of order.items) {
      if (item.product) {
        await this.productRepository.increment(
          { id: item.product.id },
          'stock',
          item.quantity,
        );
        await this.productRepository.decrement(
          { id: item.product.id },
          'salesCount',
          item.quantity,
        );
      }
    }

    order.status = OrderStatus.Cancelled;
    return this.orderRepository.save(order);
  }

  // ===== 管理端 =====

  /**
   * 管理员 — 所有订单列表（分页 + 状态筛选）
   */
  async adminFindAll(query: QueryOrderDto) {
    const { status, page = 1, limit = 20 } = query;

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
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
   * 管理员 — 订单详情（含用户信息）
   */
  async adminFindOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { user: true },
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

    order.status = OrderStatus.Shipped;
    return this.orderRepository.save(order);
  }

  /**
   * 管理员 — 完成订单（shipped → completed）
   */
  async complete(id: number): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.Shipped) {
      throw new BadRequestException('仅已发货状态的订单可以完成');
    }

    order.status = OrderStatus.Completed;
    return this.orderRepository.save(order);
  }

  /**
   * 管理员 — 手动修改订单状态
   */
  async updateStatus(id: number, status: string): Promise<Order> {
    const order = await this.findOne(id);

    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status as OrderStatus)) {
      throw new BadRequestException(
        `订单状态无效，支持的值：${validStatuses.join(' / ')}`,
      );
    }

    order.status = status as OrderStatus;
    return this.orderRepository.save(order);
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
      relations: extraRelations,
    });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    return order;
  }
}
