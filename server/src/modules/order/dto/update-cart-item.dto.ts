import { IsInt, Min, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 更新购物车项 DTO
 */
export class UpdateCartItemDto {
  @IsOptional()
  @IsInt({ message: '数量必须是整数' })
  @Min(1, { message: '数量至少为 1' })
  @Type(() => Number)
  quantity?: number;

  @IsOptional()
  @IsBoolean({ message: 'selected 必须是布尔值' })
  @Type(() => Boolean)
  selected?: boolean;
}
