import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { CouponModule } from './modules/coupon/coupon.module';

@Module({
  imports: [
    // ===== 业务模块 =====
    AuthModule,
    UserModule,
    CategoryModule,
    ProductModule,
    OrderModule,
    FavoriteModule,
    CouponModule,

    // ===== 环境变量配置（全局可用） =====
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ===== 数据库连接（TypeORM + MySQL） =====
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 3306),
        username: configService.get<string>('DATABASE_USERNAME', 'root'),
        password: configService.get<string>('DATABASE_PASSWORD', 'root'),
        database: configService.get<string>('DATABASE_NAME', 'greenmall'),
        autoLoadEntities: true,
        synchronize: true, // 开发环境自动同步表结构，生产环境请改为 false
        logging: true,
        timezone: '+08:00',
      }),
    }),

    // ===== 静态文件服务（上传的图片访问） =====
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
