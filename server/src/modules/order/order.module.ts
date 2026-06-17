import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { AdminOrderController } from './admin-order.controller';
import { CouponModule } from '../coupon/coupon.module';

/**
 * 订单/购物车模块
 *
 * 将 Cart 和 Order 放在同一个模块中，
 * 因为下单需要依赖购物车数据（高内聚）
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem, Order, OrderItem, Product]),
    CouponModule,
  ],
  controllers: [CartController, OrderController, AdminOrderController],
  providers: [CartService, OrderService],
  exports: [OrderService],
})
export class OrderModule {}
