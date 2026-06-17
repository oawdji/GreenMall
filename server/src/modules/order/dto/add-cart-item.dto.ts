import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 添加商品到购物车 DTO
 */
export class AddCartItemDto {
  @IsInt({ message: '商品 ID 必须是整数' })
  @Type(() => Number)
  productId: number;

  @IsOptional()
  @IsInt({ message: '数量必须是整数' })
  @Min(1, { message: '数量至少为 1' })
  @Type(() => Number)
  quantity?: number;
}
