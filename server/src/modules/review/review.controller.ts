import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * 公开 — 商品评价列表
   * GET /api/reviews/product/:productId?page=1&limit=20
   */
  @Get('product/:productId')
  async findByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.reviewService.findByProduct(productId, page, limit);
  }

  /**
   * 发表评价（需登录 + 已购买）
   * POST /api/reviews
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: { user: { id: number } },
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.create(req.user.id, dto);
  }

  /**
   * 编辑自己的评价
   * PATCH /api/reviews/:id
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewService.update(id, req.user.id, dto);
  }

  /**
   * 删除自己的评价
   * DELETE /api/reviews/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.reviewService.remove(id, req.user.id);
    return { message: '删除成功' };
  }
}
