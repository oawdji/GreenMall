import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { QueryOrderDto } from './dto/query-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles, Role } from '../../common/roles.decorator';

/**
 * 管理端订单控制器
 * 所有接口需管理员权限
 */
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * 所有订单列表（分页 + 状态筛选）
   * GET /api/admin/orders?status=paid&page=1&limit=20
   */
  @Get()
  async findAll(@Query() query: QueryOrderDto) {
    return this.orderService.adminFindAll(query);
  }

  /**
   * 订单详情（含用户信息）
   * GET /api/admin/orders/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.adminFindOne(id);
  }

  /**
   * 发货（paid → shipped）
   * PATCH /api/admin/orders/:id/ship
   */
  @Patch(':id/ship')
  async ship(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.ship(id);
  }

  /**
   * 完成订单（shipped → completed）
   * PATCH /api/admin/orders/:id/complete
   */
  @Patch(':id/complete')
  async complete(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.complete(id);
  }

  /**
   * 手动修改订单状态
   * PATCH /api/admin/orders/:id/status
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.orderService.updateStatus(id, status);
  }
}
