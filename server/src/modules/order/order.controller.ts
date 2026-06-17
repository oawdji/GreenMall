import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * 用户端订单控制器
 * 所有接口需登录 — 仅操作当前用户的订单
 */
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * 创建订单（从购物车结算）
   * POST /api/orders
   */
  @Post()
  async create(
    @Req() req: { user: { id: number } },
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.create(req.user.id, dto);
  }

  /**
   * 我的订单列表（分页 + 状态筛选）
   * GET /api/orders?status=paid&page=1&limit=20
   */
  @Get()
  async findAll(
    @Req() req: { user: { id: number } },
    @Query() query: QueryOrderDto,
  ) {
    return this.orderService.findByUser(req.user.id, query);
  }

  /**
   * 我的订单详情
   * GET /api/orders/:id
   */
  @Get(':id')
  async findOne(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.findOne(id, req.user.id);
  }

  /**
   * 模拟支付
   * PATCH /api/orders/:id/pay
   */
  @Patch(':id/pay')
  async pay(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.pay(id, req.user.id);
  }

  /**
   * 取消订单（仅待支付状态可取消）
   * PATCH /api/orders/:id/cancel
   */
  @Patch(':id/cancel')
  async cancel(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.cancel(id, req.user.id);
  }
}
