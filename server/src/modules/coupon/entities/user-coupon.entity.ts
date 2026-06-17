import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../user/entities/user.entity';
import { Coupon } from './coupon.entity';
import { Order } from '../../order/entities/order.entity';

/** 用户优惠券状态 */
export enum UserCouponStatus {
  Unused = 'unused',
  Used = 'used',
  Expired = 'expired',
}

/**
 * 用户领用的优惠券
 */
@Entity('user_coupons')
export class UserCoupon extends BaseEntity {
  @Column({ type: 'enum', enum: UserCouponStatus, default: UserCouponStatus.Unused, comment: '状态' })
  status: UserCouponStatus;

  @Column({ type: 'datetime', nullable: true, comment: '使用时间' })
  usedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Coupon, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @ManyToOne(() => Order, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
