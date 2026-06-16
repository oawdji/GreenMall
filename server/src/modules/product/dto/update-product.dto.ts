import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

/**
 * 更新商品 DTO
 * 所有字段可选
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
