import { Entity, Column, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../../common/base.entity';
import { Role } from '../../../common/roles.decorator';
import { Order } from '../../order/entities/order.entity';
import { CartItem } from '../../order/entities/cart-item.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, length: 50, comment: '用户名' })
  username: string;

  @Column({ length: 100, comment: '密码哈希', select: false })
  password: string;

  @Column({ unique: true, length: 100, nullable: true, comment: '邮箱' })
  email: string;

  @Column({ length: 20, nullable: true, comment: '手机号' })
  phone: string;

  @Column({ length: 100, nullable: true, comment: '昵称' })
  nickname: string;

  @Column({ length: 500, nullable: true, comment: '头像 URL' })
  avatar: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.Customer,
    comment: '角色：customer 普通用户 / admin 管理员',
  })
  role: Role;

  @Column({ default: true, comment: '是否启用' })
  isActive: boolean;

  // 关联字段
  // @OneToMany(() => Address, (address) => address.user)
  // addresses: Address[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cartItems: CartItem[];

  // @OneToMany(() => Favorite, (favorite) => favorite.user)
  // favorites: Favorite[];
  //
  // @OneToMany(() => Review, (review) => review.user)
  // reviews: Review[];
}
