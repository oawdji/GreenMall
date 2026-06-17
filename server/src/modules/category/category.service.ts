import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: TreeRepository<Category>,
  ) {}

  /**
   * 获取分类树（完整树形结构）
   */
  async findTrees(): Promise<Category[]> {
    return this.categoryRepository.findTrees();
  }

  /**
   * 公开 — 获取已启用的分类列表
   */
  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      order: { sort: 'ASC' },
    });
  }

  /**
   * 管理员 — 获取全部分类（含禁用）
   */
  async adminFindAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { sort: 'ASC' },
      relations: { parent: true },
    });
  }

  /**
   * 查询单个分类
   */
  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: { parent: true, children: true },
    });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    return category;
  }

  /**
   * 创建分类
   */
  async create(dto: CreateCategoryDto): Promise<Category> {
    const { parentId, ...data } = dto;

    const category = this.categoryRepository.create(data);

    if (parentId != null && parentId > 0) {
      category.parent = await this.findParentById(parentId);
    }

    return this.categoryRepository.save(category);
  }

  /**
   * 更新分类
   */
  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    const { parentId, ...data } = dto;

    Object.assign(category, data);

    if (parentId !== undefined) {
      if (parentId === null || parentId === 0) {
        // @TreeParent 允许 null，取消父分类关联
        category.parent = null!;
      } else {
        if (parentId === id) {
          throw new BadRequestException(
            '不能将分类设置为自己的子分类',
          );
        }
        category.parent = await this.findParentById(parentId);
      }
    }

    return this.categoryRepository.save(category);
  }

  /**
   * 删除分类
   */
  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);

    // 检查是否有子分类
    const descendants = await this.categoryRepository.findDescendants(category);
    if (descendants.length > 1) {
      throw new BadRequestException('该分类下有子分类，无法删除');
    }

    await this.categoryRepository.remove(category);
  }

  // ===== 私有辅助方法 =====

  /**
   * 根据 ID 查找父分类，找不到则抛异常
   */
  private async findParentById(parentId: number): Promise<Category> {
    const parent = await this.categoryRepository.findOne({
      where: { id: parentId },
    });
    if (!parent) {
      throw new BadRequestException('父分类不存在');
    }
    return parent;
  }
}
