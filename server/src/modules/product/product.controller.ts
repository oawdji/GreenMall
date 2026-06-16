import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles, Role } from '../../common/roles.decorator';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * 公开 — 商品列表（分页 + 搜索 + 筛选）
   * GET /api/products?keyword=手机&categoryId=1&page=1&limit=20&sortBy=price&sortOrder=ASC
   */
  @Get()
  async findAll(@Query() query: QueryProductDto) {
    return this.productService.findAll(query);
  }

  /**
   * 公开 — 商品详情
   * GET /api/products/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  // ========== 管理员接口 ==========

  /**
   * 管理员 — 所有商品列表（含下架/草稿）
   * GET /api/products/admin/list
   */
  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async adminFindAll(@Query() query: QueryProductDto) {
    return this.productService.adminFindAll(query);
  }

  /**
   * 管理员 — 商品详情（含下架/草稿）
   * GET /api/products/admin/:id
   */
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async adminFindOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.adminFindOne(id);
  }

  /**
   * 管理员 — 创建商品
   * POST /api/products
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  /**
   * 管理员 — 更新商品
   * PUT /api/products/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(id, dto);
  }

  /**
   * 管理员 — 更新商品状态
   * PATCH /api/products/:id/status
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.productService.updateStatus(id, status);
  }

  /**
   * 管理员 — 删除商品
   * DELETE /api/products/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productService.remove(id);
    return { message: '删除成功' };
  }
}
