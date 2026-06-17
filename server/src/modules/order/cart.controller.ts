import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * 购物车控制器
 * 所有接口均需登录 — 操作当前用户的购物车
 */
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * 获取当前用户的购物车列表
   * GET /api/cart
   */
  @Get()
  async findAll(@Req() req: { user: { id: number } }) {
    return this.cartService.findByUser(req.user.id);
  }

  /**
   * 添加商品到购物车
   * POST /api/cart
   */
  @Post()
  async add(
    @Req() req: { user: { id: number } },
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.add(req.user.id, dto);
  }

  /**
   * 更新购物车项（数量 / 选中状态）
   * PATCH /api/cart/:id
   */
  @Patch(':id')
  async update(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.update(id, req.user.id, dto);
  }

  /**
   * 删除购物车项
   * DELETE /api/cart/:id
   */
  @Delete(':id')
  async remove(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.cartService.remove(id, req.user.id);
    return { message: '删除成功' };
  }

  /**
   * 清空当前用户的购物车
   * DELETE /api/cart
   */
  @Delete()
  async clear(@Req() req: { user: { id: number } }) {
    await this.cartService.clear(req.user.id);
    return { message: '清空成功' };
  }
}
