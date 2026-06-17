import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';

/**
 * 购物车项实体
 *
 * 用户与商品的多对多中间表
 * 同一用户 + 同一商品 = 唯一记录（重复添加时合并数量）
 */
@Entity('cart_items')
@Index(['user', 'product'], { unique: true })
export class CartItem extends BaseEntity {
  @Column({ type: 'int', default: 1, comment: '购买数量' })
  quantity: number;

  @Column({ default: true, comment: '是否选中（用于结算）' })
  selected: boolean;

  /**
   * 所属用户
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * 关联商品
   */
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
