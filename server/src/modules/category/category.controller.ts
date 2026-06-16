import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles, Role } from '../../common/roles.decorator';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * 获取分类树（公开接口）
   * GET /api/categories/tree
   */
  @Get('tree')
  async getTree() {
    return this.categoryService.findTrees();
  }

  /**
   * 获取所有分类列表（公开接口）
   * GET /api/categories
   */
  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  /**
   * 查询单个分类详情（公开接口）
   * GET /api/categories/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  /**
   * 创建分类（管理员）
   * POST /api/categories
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  /**
   * 更新分类（管理员）
   * PUT /api/categories/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, dto);
  }

  /**
   * 删除分类（管理员）
   * DELETE /api/categories/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.categoryService.remove(id);
    return { message: '删除成功' };
  }
}
