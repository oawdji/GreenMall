import { IsInt, Min, Max, IsString, IsOptional, MaxLength, IsArray, ArrayMaxSize } from 'class-validator';

/**
 * 发表评价 DTO
 */
export class CreateReviewDto {
  @IsInt({ message: '商品 ID 必须是整数' })
  productId: number;

  @IsOptional()
  @IsInt({ message: '订单 ID 必须是整数' })
  orderId?: number;

  @IsInt({ message: '评分必须是整数' })
  @Min(1, { message: '评分最低 1 星' })
  @Max(5, { message: '评分最高 5 星' })
  rating: number;

  @IsOptional()
  @IsString({ message: '评价内容必须是字符串' })
  @MaxLength(1000, { message: '评价内容最多 1000 个字符' })
  content?: string;

  @IsOptional()
  @IsArray({ message: '图片必须是数组' })
  @ArrayMaxSize(9, { message: '最多上传 9 张图片' })
  images?: string[];
}
