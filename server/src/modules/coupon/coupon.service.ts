import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, DeepPartial, MoreThan, LessThanOrEqual, In } from 'typeorm';
import { Coupon, CouponType } from './entities/coupon.entity';
import { UserCoupon, UserCouponStatus } from './entities/user-coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { QueryCouponDto } from './dto/query-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(UserCoupon)
    private readonly userCouponRepository: Repository<UserCoupon>,
    private readonly dataSource: DataSource,
  ) {}

  // ========== 用户端 ==========

  /**
   * 可领取的优惠券列表（已启用 + 有库存 + 在有效期内）
   */
  async findAvailable(userId: number, query: QueryCouponDto) {
    const { type, page = 1, limit = 20 } = query;
    const now = new Date();

    const qb = this.couponRepository
      .createQueryBuilder('coupon')
      .where('coupon.isActive = :isActive', { isActive: true })
      .andWhere('coupon.remainingQuantity > :qty', { qty: 0 })
      .andWhere(
        '(coupon.startDate IS NULL OR coupon.startDate <= :now)',
        { now },
      )
      .andWhere('(coupon.endDate IS NULL OR coupon.endDate >= :now)', { now });

    if (type) {
      qb.andWhere('coupon.type = :type', { type });
    }

    qb.orderBy('coupon.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [list, total] = await qb.getManyAndCount();

    // 查询每个券当前用户已领张数
    const claimedCounts = await this.userCouponRepository
      .createQueryBuilder('uc')
      .select('uc.coupon_id', 'couponId')
      .addSelect('COUNT(uc.id)', 'count')
      .where('uc.user_id = :userId', { userId })
      .andWhere('uc.coupon_id IN (:...ids)', {
        ids: list.map((c) => c.id),
      })
      .groupBy('uc.coupon_id')
      .getRawMany();

    const countMap = new Map(
      claimedCounts.map((r) => [r.couponId, Number(r.count)]),
    );

    const enriched = list.map((coupon) => ({
      ...coupon,
      userClaimedCount: countMap.get(coupon.id) || 0,
      canClaim:
        (countMap.get(coupon.id) || 0) < coupon.perUserLimit,
    }));

    return {
      list: enriched,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 我的优惠券列表（不再执行批量 UPDATE，改为查询时计算过期状态）
   */
  async findMyCoupons(userId: number, status?: UserCouponStatus) {
    const now = new Date();

    // 查询用户优惠券（由于移除了 eager:true，显式加载 coupon 关联）
    const userCoupons = await this.userCouponRepository.find({
      where: {
        user: { id: userId },
        ...(status ? { status } : {}),
      },
      relations: { coupon: true },
      order: { createdAt: 'DESC' },
    });

    // 在应用层计算过期状态（不再写入数据库）
    return userCoupons.map((uc) => {
      const isExpired =
        uc.status === UserCouponStatus.Unused &&
        uc.coupon?.endDate &&
        uc.coupon.endDate < now;

      return {
        ...uc,
        _isExpired: isExpired, // 前端可根据此字段提示"已过期"
      };
    });
  }

  /**
   * 领取优惠券（事务保护，防止并发超领）
   */
  async claim(userId: number, couponId: number): Promise<UserCoupon> {
    return this.dataSource.transaction(async (manager) => {
      // 事务内用悲观写锁读取优惠券，防并发超领
      const coupon = await manager.findOne(Coupon, {
        where: { id: couponId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!coupon) {
        throw new NotFoundException('优惠券不存在');
      }

      // 校验券是否可用
      if (!coupon.isActive) {
        throw new BadRequestException('该优惠券已下架');
      }

      if (coupon.remainingQuantity <= 0) {
        throw new BadRequestException('该优惠券已被领完');
      }

      const now = new Date();
      if (coupon.startDate && coupon.startDate > now) {
        throw new BadRequestException('该优惠券尚未到领取时间');
      }
      if (coupon.endDate && coupon.endDate < now) {
        throw new BadRequestException('该优惠券已过期');
      }

      // 事务内校验每人限领（锁定后的最新数据）
      const claimedCount = await manager.count(UserCoupon, {
        where: { user: { id: userId }, coupon: { id: couponId } },
      });
      if (claimedCount >= coupon.perUserLimit) {
        throw new BadRequestException(
          `该优惠券每人限领 ${coupon.perUserLimit} 张，您已领取 ${claimedCount} 张`,
        );
      }

      // 原子操作：扣减库存 + 创建领用记录
      await manager.decrement(
        Coupon,
        { id: couponId },
        'remainingQuantity',
        1,
      );

      const userCoupon = manager.create(UserCoupon, {
        user: { id: userId },
        coupon: { id: couponId },
        status: UserCouponStatus.Unused,
      });

      const saved = await manager.save(userCoupon);

      // 重新加载带关联的数据并返回
      return manager.findOneOrFail(UserCoupon, {
        where: { id: saved.id },
        relations: { coupon: true },
      });
    });
  }

  /**
   * 校验并计算优惠金额（下单时调用）
   * 返回 { discount, userCoupon }
   */
  async validateAndUse(
    userId: number,
    userCouponId: number,
    totalAmount: number,
  ): Promise<{ discount: number; userCoupon: UserCoupon }> {
    const userCoupon = await this.userCouponRepository.findOne({
      where: { id: userCouponId, user: { id: userId } },
      relations: { coupon: true },
    });

    if (!userCoupon) {
      throw new NotFoundException('优惠券记录不存在');
    }

    if (userCoupon.status !== UserCouponStatus.Unused) {
      throw new BadRequestException('该优惠券已使用或已过期');
    }

    const coupon = userCoupon.coupon;

    // 检查是否过期
    const now = new Date();
    if (coupon.endDate && coupon.endDate < now) {
      userCoupon.status = UserCouponStatus.Expired;
      await this.userCouponRepository.save(userCoupon);
      throw new BadRequestException('该优惠券已过期');
    }

    // 校验最低消费（totalAmount 为 0 时仅做存在性校验，不做门槛检查）
    if (totalAmount > 0 && totalAmount < coupon.minAmount) {
      throw new BadRequestException(
        `未达到优惠券使用门槛（满 ¥${coupon.minAmount} 可用，当前 ¥${totalAmount}）`,
      );
    }

    // 计算优惠金额
    let discount = 0;
    if (coupon.type === CouponType.Fixed) {
      discount = Number(coupon.discountValue);
    } else {
      // 折扣券：折扣金额 = 总金额 * (1 - 折扣率)，不超过 maxDiscount
      discount = Number(
        (totalAmount * (1 - coupon.discountValue)).toFixed(2),
      );
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    }

    // 优惠金额不能超过订单总额
    if (discount > totalAmount) {
      discount = totalAmount;
    }

    return { discount, userCoupon };
  }

  // ========== 管理端 ==========

  async adminFindAll(query: QueryCouponDto) {
    const { type, page = 1, limit = 20 } = query;

    const where: Record<string, unknown> = {};
    if (type) where.type = type;

    const [list, total] = await this.couponRepository.findAndCount({
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

  async adminFindOne(id: number): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('优惠券不存在');
    return coupon;
  }

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const data: DeepPartial<Coupon> = {
      name: dto.name,
      type: dto.type,
      minAmount: Number(dto.minAmount),
      discountValue: Number(dto.discountValue),
      maxDiscount: dto.maxDiscount ? Number(dto.maxDiscount) : undefined,
      totalQuantity: Number(dto.totalQuantity),
      remainingQuantity: Number(dto.totalQuantity),
      perUserLimit: dto.perUserLimit ? Number(dto.perUserLimit) : undefined,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      isActive: dto.isActive ?? true,
    };
    const coupon = this.couponRepository.create(data);
    return this.couponRepository.save(coupon);
  }

  async update(id: number, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.adminFindOne(id);

    // 显式检查 type 是否变更（undefined 表示未传）
    if (dto.type !== undefined && dto.type !== coupon.type) {
      throw new BadRequestException('优惠券类型不可修改');
    }

    const data: Record<string, unknown> = { ...dto };
    if (dto.startDate !== undefined) {
      data.startDate = dto.startDate ? new Date(dto.startDate) : null;
    }
    if (dto.endDate !== undefined) {
      data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }
    // 如果 totalQuantity 被更新，同步更新 remainingQuantity
    if (dto.totalQuantity !== undefined) {
      const delta = dto.totalQuantity - coupon.totalQuantity;
      const newRemaining = coupon.remainingQuantity + delta;
      data.remainingQuantity = newRemaining < 0 ? 0 : newRemaining;
    }

    Object.assign(coupon, data);
    return this.couponRepository.save(coupon);
  }

  async remove(id: number): Promise<void> {
    const coupon = await this.adminFindOne(id);
    await this.couponRepository.remove(coupon);
  }
}
