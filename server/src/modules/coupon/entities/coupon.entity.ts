import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { UserCoupon } from './user-coupon.entity';

/** 优惠券类型 */
export enum CouponType {
  Fixed = 'fixed',     // 满减券
  Percent = 'percent', // 折扣券
}

/**
 * 优惠券模板（管理员创建）
 */
@Entity('coupons')
export class Coupon extends BaseEntity {
  @Column({ length: 50, comment: '优惠券名称' })
  name: string;

  @Column({ type: 'enum', enum: CouponType, comment: '类型：fixed 满减 / percent 折扣' })
  type: CouponType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '最低消费金额（元），0 表示无门槛' })
  minAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: 'fixed → 减免金额 / percent → 折扣率（0.95 = 95折）' })
  discountValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: '折扣券最高优惠金额上限（满减券为 NULL）' })
  maxDiscount: number;

  @Column({ type: 'int', default: 0, comment: '发放总量' })
  totalQuantity: number;

  @Column({ type: 'int', default: 0, comment: '剩余数量' })
  remainingQuantity: number;

  @Column({ type: 'int', default: 1, comment: '每人限领张数' })
  perUserLimit: number;

  @Column({ type: 'datetime', nullable: true, comment: '有效期开始' })
  startDate: Date;

  @Column({ type: 'datetime', nullable: true, comment: '有效期结束' })
  endDate: Date;

  @Column({ default: true, comment: '是否启用' })
  isActive: boolean;

  @OneToMany(() => UserCoupon, (uc) => uc.coupon)
  userCoupons: UserCoupon[];
}
