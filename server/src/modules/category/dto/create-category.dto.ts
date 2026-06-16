import { IsString, IsOptional, IsInt, IsBoolean, Min, MaxLength } from 'class-validator';

/**
 * 创建分类 DTO
 */
export class CreateCategoryDto {
  @IsString({ message: '分类名称必须是字符串' })
  @MaxLength(50, { message: '分类名称最多 50 个字符' })
  name: string;

  @IsOptional()
  @IsString({ message: '图标必须是字符串' })
  icon?: string;

  @IsOptional()
  @IsString({ message: '分类图片必须是字符串' })
  image?: string;

  @IsOptional()
  @IsInt({ message: '排序值必须是整数' })
  @Min(0, { message: '排序值不能小于 0' })
  sort?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive 必须是布尔值' })
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsInt({ message: '父分类 ID 必须是整数' })
  parentId?: number;
}
