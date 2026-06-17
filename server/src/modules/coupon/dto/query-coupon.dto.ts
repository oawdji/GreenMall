import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 优惠券查询 DTO
 */
export class QueryCouponDto {
  @IsOptional()
  @IsString({ message: '状态必须是字符串' })
  status?: string;

  @IsOptional()
  @IsString({ message: '类型必须是字符串' })
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码至少为 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页条数必须是整数' })
  @Min(1, { message: '每页至少 1 条' })
  @Max(100, { message: '每页最多 100 条' })
  limit?: number = 20;
}
