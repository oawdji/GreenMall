import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Category } from '../../category/entities/category.entity';
import { ProductImage } from './product-image.entity';
import { CartItem } from '../../order/entities/cart-item.entity';
import { OrderItem } from '../../order/entities/order-item.entity';
import { Favorite } from '../../favorite/entities/favorite.entity';

/**
 * 商品实体
 */
@Entity('products')
export class Product extends BaseEntity {
  @Column({ length: 100, comment: '商品名称' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '商品描述' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '价格（元）' })
  price: number;

  @Column({ type: 'int', default: 0, comment: '库存数量' })
  stock: number;

  @Column({ type: 'text', nullable: true, comment: '商品主图 URL' })
  coverImage: string;

  @Column({ default: 'draft', comment: '状态：draft 草稿 / on 上架 / off 下架' })
  status: string;

  @Column({ default: false, comment: '是否推荐/精选' })
  isFeatured: boolean;

  @Column({ type: 'int', default: 0, comment: '销量' })
  salesCount: number;

  @Column({ type: 'int', default: 0, comment: '浏览次数' })
  viewCount: number;

  /**
   * 所属分类
   */
  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  /**
   * 商品图片集（一对多）
   */
  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
    eager: true,
  })
  images: ProductImage[];

  // 关联
  @OneToMany(() => CartItem, (item) => item.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];

  @OneToMany(() => Favorite, (fav) => fav.product)
  favorites: Favorite[];
  //
  // @OneToMany(() => Review, (review) => review.product)
  // reviews: Review[];
}
