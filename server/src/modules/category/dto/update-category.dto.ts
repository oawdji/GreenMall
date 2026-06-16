import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

/**
 * 更新分类 DTO
 * 所有字段可选，只更新传入的字段
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
