import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { CouponType } from '../entities/coupon.entity';

/**
 * 创建优惠券 DTO（管理员）
 */
export class CreateCouponDto {
  @IsString({ message: '优惠券名称不能为空' })
  @MaxLength(50, { message: '名称最多 50 个字符' })
  name: string;

  @IsEnum(CouponType, { message: '类型必须是 fixed（满减）或 percent（折扣）' })
  type: CouponType;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: '最低消费金额必须是数字' })
  @Min(0, { message: '最低消费金额不能为负数' })
  minAmount: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: '优惠值必须是数字' })
  @Min(0.01, { message: '优惠值必须大于 0' })
  discountValue: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: '最高优惠金额必须是数字' })
  @Min(0, { message: '最高优惠金额不能为负数' })
  maxDiscount?: number;

  @IsInt({ message: '发放总量必须是整数' })
  @Min(1, { message: '发放总量至少为 1' })
  totalQuantity: number;

  @IsOptional()
  @IsInt({ message: '每人限领张数必须是整数' })
  @Min(1, { message: '每人限领张数至少为 1' })
  perUserLimit?: number;

  @IsOptional()
  @IsString({ message: '开始日期必须是字符串' })
  startDate?: string;

  @IsOptional()
  @IsString({ message: '结束日期必须是字符串' })
  endDate?: string;

  @IsOptional()
  @IsBoolean({ message: '是否启用必须是布尔值' })
  isActive?: boolean;
}
