import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { QueryCouponDto } from './dto/query-coupon.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles, Role } from '../../common/roles.decorator';

/**
 * 管理端优惠券控制器
 */
@Controller('admin/coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class AdminCouponController {
  constructor(private readonly couponService: CouponService) {}

  /**
   * 全部优惠券列表
   * GET /api/admin/coupons?type=fixed&page=1&limit=20
   */
  @Get()
  async findAll(@Query() query: QueryCouponDto) {
    return this.couponService.adminFindAll(query);
  }

  /**
   * 优惠券详情
   * GET /api/admin/coupons/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.couponService.adminFindOne(id);
  }

  /**
   * 创建优惠券
   * POST /api/admin/coupons
   */
  @Post()
  async create(@Body() dto: CreateCouponDto) {
    return this.couponService.create(dto);
  }

  /**
   * 更新优惠券
   * PUT /api/admin/coupons/:id
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.couponService.update(id, dto);
  }

  /**
   * 删除优惠券
   * DELETE /api/admin/coupons/:id
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.couponService.remove(id);
    return { message: '删除成功' };
  }
}
