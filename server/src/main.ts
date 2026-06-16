import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/transform.interceptor';
import { AllExceptionsFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // ===== CORS 跨域配置 =====
  const clientUrl = configService.get<string>('CLIENT_URL', 'http://localhost:3001');
  app.enableCors({
    origin: [clientUrl, 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ===== 全局管道 —— 请求参数校验 =====
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // 剥离非 DTO 定义的属性
      forbidNonWhitelisted: true, // 非白名单属性直接报错
      transform: true,         // 自动类型转换
      transformOptions: {
        enableImplicitConversion: true, // 隐式类型转换
      },
    }),
  );

  // ===== 全局拦截器 —— 统一响应格式 { code, message, data, timestamp } =====
  app.useGlobalInterceptors(new TransformInterceptor());

  // ===== 全局异常过滤器 —— 统一错误响应 =====
  app.useGlobalFilters(new AllExceptionsFilter());

  // ===== 全局路由前缀 =====
  app.setGlobalPrefix('api');

  // ===== 启动服务 =====
  const port = configService.get<number>('APP_PORT', 3000);
  const host = configService.get<string>('APP_HOST', '0.0.0.0');

  await app.listen(port, host);
  logger.log(`🚀 服务已启动: http://${host}:${port}`);
  logger.log(`📡 API 地址: http://${host}:${port}/api`);
  logger.log(`🌍 客户端地址: ${clientUrl}`);
}

bootstrap();
