import { IsInt, IsPositive } from 'class-validator';

/**
 * 添加收藏请求体
 */
export class AddFavoriteDto {
  @IsInt({ message: '商品 ID 必须是整数' })
  @IsPositive({ message: '商品 ID 必须为正数' })
  productId: number;
}
