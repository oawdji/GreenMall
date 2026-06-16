import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsBoolean,
  IsIn,
  IsArray,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 商品图片 DTO
 */
export class ProductImageDto {
  @IsString({ message: '图片 URL 必须是字符串' })
  url: string;

  @IsOptional()
  @IsInt({ message: '排序值必须是整数' })
  @Min(0, { message: '排序值不能小于 0' })
  sort?: number;
}

/**
 * 创建商品 DTO
 */
export class CreateProductDto {
  @IsString({ message: '商品名称必须是字符串' })
  @MaxLength(100, { message: '商品名称最多 100 个字符' })
  name: string;

  @IsOptional()
  @IsString({ message: '商品描述必须是字符串' })
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: '价格必须是数字，最多两位小数' })
  @Min(0.01, { message: '价格必须大于 0' })
  @Type(() => Number)
  price: number;

  @IsInt({ message: '库存必须是整数' })
  @Min(0, { message: '库存不能小于 0' })
  @Type(() => Number)
  stock: number;

  @IsOptional()
  @IsString({ message: '封面图必须是字符串' })
  coverImage?: string;

  @IsOptional()
  @IsIn(['draft', 'on', 'off'], { message: '状态值无效，支持的值：draft / on / off' })
  status?: string;

  @IsOptional()
  @IsBoolean({ message: 'isFeatured 必须是布尔值' })
  isFeatured?: boolean;

  @IsOptional()
  @IsInt({ message: '分类 ID 必须是整数' })
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsArray({ message: '图片列表必须是数组' })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];
}
