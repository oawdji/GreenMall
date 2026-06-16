import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Product } from './product.entity';

/**
 * 商品图片实体
 */
@Entity('product_images')
export class ProductImage extends BaseEntity {
  @Column({ length: 500, comment: '图片 URL' })
  url: string;

  @Column({ type: 'int', default: 0, comment: '排序值（越小越靠前）' })
  sort: number;

  /**
   * 所属商品
   */
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
