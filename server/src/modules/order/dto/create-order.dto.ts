import { IsString, MaxLength, IsOptional } from 'class-validator';

/**
 * 创建订单 DTO（从购物车结算）
 */
export class CreateOrderDto {
  @IsString({ message: '收货人姓名不能为空' })
  @MaxLength(50, { message: '收货人姓名最多 50 个字符' })
  receiverName: string;

  @IsString({ message: '收货人电话不能为空' })
  @MaxLength(20, { message: '收货人电话最多 20 个字符' })
  receiverPhone: string;

  @IsString({ message: '收货地址不能为空' })
  @MaxLength(200, { message: '收货地址最多 200 个字符' })
  receiverAddress: string;

  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  @MaxLength(500, { message: '备注最多 500 个字符' })
  remark?: string;
}
