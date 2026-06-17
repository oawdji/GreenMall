import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../product/entities/product.entity';
import { User } from '../user/entities/user.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * 获取当前用户的购物车列表
   */
  async findByUser(userId: number): Promise<CartItem[]> {
    return this.cartItemRepository.find({
      where: { user: { id: userId } },
      relations: { product: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 添加商品到购物车
   * — 已存在则增加数量，不存在则新建
   */
  async add(userId: number, dto: AddCartItemDto): Promise<CartItem> {
    const { productId, quantity = 1 } = dto;

    // 校验商品存在且已上架
    const product = await this.productRepository.findOne({
      where: { id: productId, status: 'on' },
    });
    if (!product) {
      throw new NotFoundException('商品不存在或已下架');
    }

    // 检查是否已在购物车中
    const existing = await this.cartItemRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
      relations: { product: true },
    });

    if (existing) {
      existing.quantity += quantity;
      return this.cartItemRepository.save(existing);
    }

    const cartItem = this.cartItemRepository.create({
      user: { id: userId } as User,
      product: { id: productId } as Product,
      quantity,
    });

    const saved = await this.cartItemRepository.save(cartItem);

    // 回查带关联数据
    const result = await this.cartItemRepository.findOne({
      where: { id: saved.id },
      relations: { product: true },
    });
    return result!;
  }

  /**
   * 更新购物车项（数量 / 选中状态）
   */
  async update(
    id: number,
    userId: number,
    dto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const cartItem = await this.findOneOrFail(id, userId);

    if (dto.quantity !== undefined) {
      cartItem.quantity = dto.quantity;
    }
    if (dto.selected !== undefined) {
      cartItem.selected = dto.selected;
    }

    return this.cartItemRepository.save(cartItem);
  }

  /**
   * 删除购物车项
   */
  async remove(id: number, userId: number): Promise<void> {
    const cartItem = await this.findOneOrFail(id, userId);
    await this.cartItemRepository.remove(cartItem);
  }

  /**
   * 清空当前用户的购物车
   */
  async clear(userId: number): Promise<void> {
    await this.cartItemRepository.delete({ user: { id: userId } });
  }

  /**
   * 获取用户已选中的购物车项（下单时使用）
   */
  async findSelectedByUser(userId: number): Promise<CartItem[]> {
    return this.cartItemRepository.find({
      where: { user: { id: userId }, selected: true },
      relations: { product: true },
    });
  }

  /**
   * 删除指定购物车项（下单后清理使用）
   */
  async removeByIds(ids: number[]): Promise<void> {
    if (ids.length > 0) {
      await this.cartItemRepository.delete(ids);
    }
  }

  // ===== 私有辅助 =====

  /**
   * 查找购物车项并校验所有权，找不到则抛异常
   */
  private async findOneOrFail(
    id: number,
    userId: number,
  ): Promise<CartItem> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id, user: { id: userId } },
      relations: { product: true },
    });
    if (!cartItem) {
      throw new NotFoundException('购物车项不存在');
    }
    return cartItem;
  }
}
