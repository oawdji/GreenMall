import { IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 订单查询 DTO（分页 + 状态筛选）
 */
export class QueryOrderDto {
  @IsOptional()
  @IsIn(['pending_payment', 'paid', 'shipped', 'completed', 'cancelled'], {
    message: '订单状态值无效',
  })
  status?: string;

  @IsOptional()
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码最小为 1' })
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt({ message: '每页条数必须是整数' })
  @Min(1, { message: '每页条数最小为 1' })
  @Max(100, { message: '每页最多 100 条' })
  @Type(() => Number)
  limit?: number;
}
