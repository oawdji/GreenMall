import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Product } from '../product/entities/product.entity';
import { AddFavoriteDto } from './dto/add-favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * 获取当前用户的收藏列表（分页 + 商品详情）
   */
  async findByUser(userId: number, page = 1, limit = 20) {
    const [list, total] = await this.favoriteRepository.findAndCount({
      where: { user: { id: userId } },
      relations: { product: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 添加收藏 — 校验商品上架 + 防止重复收藏
   */
  async add(userId: number, dto: AddFavoriteDto): Promise<Favorite> {
    const { productId } = dto;

    // 校验商品存在且已上架
    const product = await this.productRepository.findOne({
      where: { id: productId, status: 'on' },
    });
    if (!product) {
      throw new NotFoundException('商品不存在或已下架');
    }

    // 检查是否已收藏（唯一约束兜底，这里提前给出友好提示）
    const existing = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });
    if (existing) {
      throw new ConflictException('该商品已在收藏列表中');
    }

    const favorite = this.favoriteRepository.create({
      user: { id: userId },
      product: { id: productId },
    });

    const saved = await this.favoriteRepository.save(favorite);

    // 回查带关联数据
    const result = await this.favoriteRepository.findOne({
      where: { id: saved.id },
      relations: { product: true },
    });
    return result!;
  }

  /**
   * 取消收藏（按收藏记录 ID）— 校验所有权
   */
  async remove(id: number, userId: number): Promise<void> {
    const favorite = await this.findOneOrFail(id, userId);
    await this.favoriteRepository.remove(favorite);
  }

  /**
   * 检查当前用户是否已收藏某商品
   * 返回收藏状态 + 收藏记录 ID（方便前端直接取消收藏）
   */
  async check(userId: number, productId: number) {
    const favorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    return {
      favorited: !!favorite,
      favoriteId: favorite?.id ?? null,
    };
  }

  // ===== 私有辅助 =====

  /**
   * 查找收藏记录并校验所有权
   */
  private async findOneOrFail(id: number, userId: number): Promise<Favorite> {
    const favorite = await this.favoriteRepository.findOne({
      where: { id, user: { id: userId } },
      relations: { product: true },
    });
    if (!favorite) {
      throw new NotFoundException('收藏记录不存在');
    }
    return favorite;
  }
}
