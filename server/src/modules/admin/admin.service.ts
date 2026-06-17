import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Product } from '../product/entities/product.entity';
import { Order, OrderStatus } from '../order/entities/order.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /**
   * 仪表盘数据 — 核心指标 + 最近订单
   */
  async dashboard() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 并行查询所有统计数据
    const [
      totalUsers,
      totalProducts,
      onProducts,
      totalOrders,
      pendingOrders,
      paidOrders,
      shippedOrders,
      completedOrders,
      cancelledOrders,
      todayOrders,
      recentOrders,
    ] = await Promise.all([
      this.userRepository.count(),

      this.productRepository.count(),

      this.productRepository.count({ where: { status: 'on' } }),

      this.orderRepository.count(),

      this.orderRepository.count({ where: { status: OrderStatus.PendingPayment } }),

      this.orderRepository.count({ where: { status: OrderStatus.Paid } }),

      this.orderRepository.count({ where: { status: OrderStatus.Shipped } }),

      this.orderRepository.count({ where: { status: OrderStatus.Completed } }),

      this.orderRepository.count({ where: { status: OrderStatus.Cancelled } }),

      this.orderRepository.count({
        where: { createdAt: Between(todayStart, now) },
      }),

      this.orderRepository.find({
        relations: { user: true },
        order: { createdAt: 'DESC' },
        take: 10,
      }),
    ]);

    // 总收入（已支付 + 已发货 + 已完成）
    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.payAmount), 0)', 'revenue')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.Paid, OrderStatus.Shipped, OrderStatus.Completed],
      })
      .getRawOne();

    // 今日收入
    const todayRevenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.payAmount), 0)', 'revenue')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.Paid, OrderStatus.Shipped, OrderStatus.Completed],
      })
      .andWhere('order.createdAt >= :todayStart', { todayStart })
      .getRawOne();

    const orderStatusCount = {
      pending_payment: pendingOrders,
      paid: paidOrders,
      shipped: shippedOrders,
      completed: completedOrders,
      cancelled: cancelledOrders,
    };

    return {
      stats: {
        totalUsers,
        totalProducts,
        onProducts,
        offProducts: totalProducts - onProducts,
        totalOrders,
        ...orderStatusCount,
        totalRevenue: Number(revenueResult?.revenue) || 0,
        todayOrders,
        todayRevenue: Number(todayRevenueResult?.revenue) || 0,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        totalAmount: order.totalAmount,
        payAmount: order.payAmount,
        createdAt: order.createdAt,
        user: {
          id: order.user.id,
          username: order.user.username,
        },
      })),
    };
  }
}
