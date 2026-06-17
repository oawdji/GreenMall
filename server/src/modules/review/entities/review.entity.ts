import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';
import { Order } from '../../order/entities/order.entity';

/**
 * 评价实体
 * 购买后可评价，每人对每商品只能评价一次
 */
@Entity('reviews')
@Index(['user', 'product'], { unique: true })
export class Review extends BaseEntity {
  @Column({ type: 'tinyint', comment: '评分（1-5 星）' })
  rating: number;

  @Column({ type: 'text', nullable: true, comment: '评价内容' })
  content: string;

  @Column({ type: 'simple-json', nullable: true, comment: '图片 URL 数组，最多 9 张' })
  images: string[];

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Order, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
