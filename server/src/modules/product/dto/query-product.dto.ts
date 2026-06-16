import { IsOptional, IsString, IsInt, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 商品查询 DTO
 */
export class QueryProductDto {
  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  keyword?: string;

  @IsOptional()
  @IsInt({ message: '分类 ID 必须是整数' })
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  sortBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'], { message: '排序方向必须是 ASC 或 DESC' })
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码从 1 开始' })
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页至少 1 条' })
  @Max(100, { message: '每页最多 100 条' })
  @Type(() => Number)
  limit?: number;
}
