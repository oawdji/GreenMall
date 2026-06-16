import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from '../category/entities/category.entity';
import { CreateProductDto, ProductImageDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

/** 允许排序的字段白名单 */
const ALLOWED_SORT_FIELDS = ['createdAt', 'price', 'salesCount', 'viewCount', 'stock'] as const;

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * 公开 — 分页查询商品列表 + 搜索 + 筛选
   */
  async findAll(query: QueryProductDto) {
    return this.queryProducts(query, { status: 'on' });
  }

  /**
   * 管理员 — 所有商品列表（含下架/草稿）
   */
  async adminFindAll(query: QueryProductDto) {
    return this.queryProducts(query, {});
  }

  /**
   * 商品通用分页查询（内部方法）
   */
  private async queryProducts(
    query: QueryProductDto,
    extraWhere: FindOptionsWhere<Product>,
  ) {
    const {
      keyword,
      categoryId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = query;

    const where: FindOptionsWhere<Product>[] = [];
    const baseWhere: FindOptionsWhere<Product> = { ...extraWhere };

    // 按分类筛选
    if (categoryId) {
      baseWhere.category = { id: categoryId };
    }

    // 关键词搜索
    if (keyword) {
      where.push({ ...baseWhere, name: Like(`%${keyword}%`) });
      where.push({ ...baseWhere, description: Like(`%${keyword}%`) });
    } else {
      where.push(baseWhere);
    }

    // 排序字段白名单校验
    const sortField = (ALLOWED_SORT_FIELDS as readonly string[]).includes(sortBy)
      ? sortBy
      : 'createdAt';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const [list, total] = await this.productRepository.findAndCount({
      where,
      relations: { category: true },
      order: { [sortField]: order },
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
   * 公开 — 查询单个商品详情
   */
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, status: 'on' },
      relations: { category: true },
    });
    if (!product) {
      throw new NotFoundException('商品不存在或已下架');
    }

    // 增加浏览次数 — increment 后再手动 +1 保证返回最新值
    await this.productRepository.increment({ id }, 'viewCount', 1);
    product.viewCount += 1;

    return product;
  }

  /**
   * 管理员 — 查询单个商品（含下架/草稿）
   */
  async adminFindOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    return product;
  }

  /**
   * 创建商品
   */
  async create(dto: CreateProductDto): Promise<Product> {
    const { images, categoryId, ...data } = dto;

    const product = this.productRepository.create({
      ...data,
      status: data.status ?? 'draft',
    });

    // 处理分类关联
    this.setCategory(product, categoryId);

    // 处理图片
    if (images && images.length > 0) {
      product.images = this.buildImages(images);
    }

    return this.productRepository.save(product);
  }

  /**
   * 更新商品
   */
  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.adminFindOne(id);

    const { images, categoryId, ...data } = dto;

    Object.assign(product, data);

    // 处理分类关联
    if (categoryId !== undefined) {
      this.setCategory(product, categoryId);
    }

    // 如果传了图片列表，替换全部图片
    if (images !== undefined) {
      product.images = this.buildImages(images);
    }

    return this.productRepository.save(product);
  }

  /**
   * 删除商品
   */
  async remove(id: number): Promise<void> {
    const product = await this.adminFindOne(id);
    await this.productRepository.remove(product);
  }

  /**
   * 更新商品状态
   */
  async updateStatus(id: number, status: string): Promise<Product> {
    const product = await this.adminFindOne(id);

    if (!['draft', 'on', 'off'].includes(status)) {
      throw new NotFoundException('商品状态无效，支持的值：draft / on / off');
    }

    product.status = status;
    return this.productRepository.save(product);
  }

  // ===== 私有辅助方法 =====

  /**
   * 设置商品分类关联
   */
  private setCategory(product: Product, categoryId?: number | null): void {
    if (categoryId) {
      const category = new Category();
      category.id = categoryId;
      product.category = category;
    } else {
      product.category = null as unknown as Category;
    }
  }

  /**
   * 构建商品图片数据（TypeORM 级联保存时自动创建 ProductImage 实体）
   */
  private buildImages(images: ProductImageDto[]) {
    return images.map((img, index) => ({
      url: img.url,
      sort: img.sort ?? index,
    })) as ProductImage[];
  }
}
