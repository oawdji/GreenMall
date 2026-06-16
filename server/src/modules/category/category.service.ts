import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 获取分类树（完整树形结构）
   */
  async findTrees(): Promise<Category[]> {
    return this.dataSource.manager.getTreeRepository(Category).findTrees();
  }

  /**
   * 获取扁平分类列表
   */
  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      order: { sort: 'ASC' },
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

    const category = this.categoryRepository.create(data as Partial<Category>);

    if (parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: parentId },
      });
      if (!parent) {
        throw new BadRequestException('父分类不存在');
      }
      category.parent = parent;
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
        // 移除父分类
        category.parent = null as unknown as Category;
      } else {
        if (parentId === id) {
          throw new BadRequestException('不能将分类设置为自己的子分类');
        }
        const parent = await this.categoryRepository.findOne({
          where: { id: parentId },
        });
        if (!parent) {
          throw new BadRequestException('父分类不存在');
        }
        category.parent = parent;
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
    const descendants = await this.dataSource.manager
      .getTreeRepository(Category)
      .findDescendants(category);
    if (descendants.length > 1) {
      throw new BadRequestException('该分类下有子分类，无法删除');
    }

    await this.categoryRepository.remove(category);
  }
}
