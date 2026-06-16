import { Entity, Column, ManyToOne, OneToMany, Tree, TreeParent, TreeChildren } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/**
 * 商品分类实体
 * 支持树形结构（无限级分类），如：电子产品 > 手机 > iPhone
 */
@Entity('categories')
@Tree('materialized-path')
export class Category extends BaseEntity {
  @Column({ length: 50, comment: '分类名称' })
  name: string;

  @Column({ length: 100, nullable: true, comment: '分类图标' })
  icon: string;

  @Column({ length: 500, nullable: true, comment: '分类图片' })
  image: string;

  @Column({ type: 'int', default: 0, comment: '排序值（越小越靠前）' })
  sort: number;

  @Column({ default: true, comment: '是否启用' })
  isActive: boolean;

  @Column({ type: 'text', nullable: true, comment: '分类描述' })
  description: string;

  /**
   * 父分类（自引用）
   * materialized-path 模式下自动维护 parentId 列
   */
  @TreeParent()
  parent: Category;

  /**
   * 子分类（自引用）
   */
  @TreeChildren()
  children: Category[];

  // 预留：后续与商品模块关联
  // @OneToMany(() => Product, (product) => product.category)
  // products: Product[];
}
