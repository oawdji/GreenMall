import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { QueryCouponDto } from './dto/query-coupon.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserCouponStatus } from './entities/user-coupon.entity';

/**
 * 用户端优惠券控制器
 * 所有接口需登录
 */
@Controller('coupons')
@UseGuards(JwtAuthGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  /**
   * 可领取的优惠券列表
   * GET /api/coupons?type=fixed&page=1&limit=20
   */
  @Get()
  async findAvailable(
    @Req() req: { user: { id: number } },
    @Query() query: QueryCouponDto,
  ) {
    return this.couponService.findAvailable(req.user.id, query);
  }

  /**
   * 我的优惠券
   * GET /api/coupons/my?status=unused
   */
  @Get('my')
  async findMy(
    @Req() req: { user: { id: number } },
    @Query('status') status?: UserCouponStatus,
  ) {
    return this.couponService.findMyCoupons(req.user.id, status);
  }

  /**
   * 领取优惠券
   * POST /api/coupons/:id/claim
   */
  @Post(':id/claim')
  async claim(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.couponService.claim(req.user.id, id);
  }
}
