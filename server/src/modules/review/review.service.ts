import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Product } from '../product/entities/product.entity';
import { Order, OrderStatus } from '../order/entities/order.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

/** 允许评价的订单状态 */
const REVIEWABLE_STATUSES: OrderStatus[] = [
  OrderStatus.Paid,
  OrderStatus.Shipped,
  OrderStatus.Completed,
];

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /**
   * 公开 — 商品评价列表（分页 + 平均评分 + 评分分布）
   */
  async findByProduct(productId: number, page = 1, limit = 20) {
    // 验证商品存在
    const product = await this.productRepository.findOne({
      where: { id: productId, status: 'on' },
    });
    if (!product) {
      throw new NotFoundException('商品不存在或已下架');
    }

    const [list, total] = await this.reviewRepository.findAndCount({
      where: { product: { id: productId } },
      relations: { user: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 计算平均评分
    const avgResult = await this.reviewRepository
      .createQueryBuilder('review')
      .select('ROUND(AVG(review.rating), 1)', 'avgRating')
      .addSelect('COUNT(review.id)', 'totalCount')
      .where('review.product_id = :productId', { productId })
      .getRawOne();

    return {
      list: list.map((r) => ({
        id: r.id,
        rating: r.rating,
        content: r.content,
        images: r.images,
        createdAt: r.createdAt,
        user: {
          id: r.user.id,
          nickname: r.user.nickname,
          avatar: r.user.avatar,
        },
      })),
      avgRating: Number(avgResult?.avgRating) || 0,
      totalCount: Number(avgResult?.totalCount) || 0,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 发表评价 — 验证购买 + 防重复
   */
  async create(userId: number, dto: CreateReviewDto): Promise<Review> {
    const { productId, orderId, rating, content, images } = dto;

    // 校验商品存在且上架
    const product = await this.productRepository.findOne({
      where: { id: productId, status: 'on' },
    });
    if (!product) {
      throw new NotFoundException('商品不存在或已下架');
    }

    // 校验是否已评价过该商品
    const existing = await this.reviewRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });
    if (existing) {
      throw new BadRequestException('您已评价过该商品，可以前往编辑修改评价');
    }

    // 验证购买记录：用户有已支付/已发货/已完成的订单包含该商品
    const hasPurchased = await this.verifyPurchase(userId, productId);
    if (!hasPurchased) {
      throw new BadRequestException('购买后才能评价');
    }

    const review = this.reviewRepository.create({
      rating,
      content: content ?? null,
      images: images ?? null,
      user: { id: userId },
      product: { id: productId },
      order: orderId ? { id: orderId } : null,
    } as unknown as Review);

    const saved = await this.reviewRepository.save(review);
    return this.findOneOrFail(saved.id);
  }

  /**
   * 编辑评价 — 校验所有权
   */
  async update(id: number, userId: number, dto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOneOrFail(id);

    if (review.user.id !== userId) {
      throw new BadRequestException('只能编辑自己的评价');
    }

    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.content !== undefined) review.content = dto.content;
    if (dto.images !== undefined) review.images = dto.images;

    return this.reviewRepository.save(review);
  }

  /**
   * 删除评价 — 校验所有权
   */
  async remove(id: number, userId: number): Promise<void> {
    const review = await this.findOneOrFail(id);

    if (review.user.id !== userId) {
      throw new BadRequestException('只能删除自己的评价');
    }

    await this.reviewRepository.remove(review);
  }

  // ========== 管理端 ==========

  async adminFindAll(page = 1, limit = 20) {
    const [list, total] = await this.reviewRepository.findAndCount({
      relations: { user: true, product: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { list, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async adminRemove(id: number): Promise<void> {
    const review = await this.findOneOrFail(id);
    await this.reviewRepository.remove(review);
  }

  // ===== 私有辅助 =====

  private async findOneOrFail(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: { user: true, product: true },
    });
    if (!review) {
      throw new NotFoundException('评价不存在');
    }
    return review;
  }

  /**
   * 验证用户是否购买过该商品
   * 查询状态为 paid / shipped / completed 且明细包含该商品的订单
   */
  private async verifyPurchase(userId: number, productId: number): Promise<boolean> {
    const count = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .where('order.user_id = :userId', { userId })
      .andWhere('item.product_id = :productId', { productId })
      .andWhere('order.status IN (:...statuses)', { statuses: REVIEWABLE_STATUSES })
      .getCount();

    return count > 0;
  }
}
