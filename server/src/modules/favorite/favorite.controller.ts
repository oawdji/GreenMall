import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * 收藏控制器
 * 所有接口均需登录 — 操作当前用户的收藏
 */
@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  /**
   * 我的收藏列表
   * GET /api/favorites?page=1&limit=20
   */
  @Get()
  async findAll(
    @Req() req: { user: { id: number } },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.favoriteService.findByUser(req.user.id, page, limit);
  }

  /**
   * 检查是否已收藏某商品
   * GET /api/favorites/check/:productId
   */
  @Get('check/:productId')
  async check(
    @Req() req: { user: { id: number } },
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.favoriteService.check(req.user.id, productId);
  }

  /**
   * 添加收藏
   * POST /api/favorites
   */
  @Post()
  async add(
    @Req() req: { user: { id: number } },
    @Body() dto: AddFavoriteDto,
  ) {
    return this.favoriteService.add(req.user.id, dto);
  }

  /**
   * 取消收藏（按收藏记录 ID）
   * DELETE /api/favorites/:id
   */
  @Delete(':id')
  async remove(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.favoriteService.remove(id, req.user.id);
    return { message: '取消收藏成功' };
  }
}
