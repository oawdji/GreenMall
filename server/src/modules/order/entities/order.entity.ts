import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../user/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { UserCoupon } from '../../coupon/entities/user-coupon.entity';

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  PendingPayment = 'pending_payment',
  Paid = 'paid',
  Shipped = 'shipped',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

/**
 * 订单实体
 */
@Entity('orders')
export class Order extends BaseEntity {
  @Column({ length: 30, unique: true, comment: '订单编号' })
  orderNo: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PendingPayment,
    comment: '订单状态',
  })
  status: OrderStatus;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '商品总金额（元）',
  })
  totalAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '运费（元）',
  })
  freight: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '优惠券减免（元），预留',
  })
  couponDiscount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '实付金额 = 总金额 + 运费 - 优惠减免',
  })
  payAmount: number;

  @Column({ length: 50, comment: '收货人姓名' })
  receiverName: string;

  @Column({ length: 20, comment: '收货人电话' })
  receiverPhone: string;

  @Column({ length: 200, comment: '收货地址' })
  receiverAddress: string;

  @Column({ type: 'text', nullable: true, comment: '订单备注' })
  remark: string;

  /**
   * 下单用户
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * 订单明细（一对多，级联保存 + 自动加载）
   */
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
  })
  items: OrderItem[];

  /**
   * 使用的优惠券（多对一，可为空）
   */
  @ManyToOne(() => UserCoupon, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_coupon_id' })
  userCoupon: UserCoupon;
}
