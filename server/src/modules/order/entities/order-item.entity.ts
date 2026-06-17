import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Order } from './order.entity';
import { Product } from '../../product/entities/product.entity';

/**
 * 订单明细实体 — 商品快照
 *
 * 下单时将商品名称、图片、价格等信息写入快照，
 * 后续商品改名/变价/删除不会影响历史订单数据。
 */
@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column({ length: 100, comment: '快照：下单时的商品名称' })
  productName: string;

  @Column({ type: 'text', nullable: true, comment: '快照：下单时的商品主图 URL' })
  productImage: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '快照：下单时的商品单价（元）',
  })
  price: number;

  @Column({ type: 'int', comment: '购买数量' })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '小计 = 单价 × 数量',
  })
  amount: number;

  /**
   * 所属订单
   */
  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  /**
   * 关联商品（nullable — 商品被删除后仍保留订单记录）
   */
  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
