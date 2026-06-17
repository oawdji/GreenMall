import { PartialType } from '@nestjs/mapped-types';
import { CreateCouponDto } from './create-coupon.dto';

/**
 * 更新优惠券 DTO（管理员）
 * 所有字段可选
 */
export class UpdateCouponDto extends PartialType(CreateCouponDto) {}
