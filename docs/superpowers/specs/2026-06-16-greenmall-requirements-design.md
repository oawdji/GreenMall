# GreenMall 2.0 电商平台 — 需求设计文档

> 创建日期：2026-06-16  
> 项目定位：毕设/作品集

---

## 1. 项目概述

GreenMall 2.0 是一个完整的前后端分离电商平台，面向消费者提供商品浏览、购物车、下单购买功能，面向管理员提供商品、订单、用户、优惠券等后台管理功能。

**技术栈**

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Nuxt 3 (Vue 3 + Vite + TypeScript + Tailwind CSS) | 混合渲染（SSR/ISR/CSR 按页面选择） |
| 后端 | NestJS (TypeScript + TypeORM) | 模块化架构，统一响应格式 |
| 数据库 | MySQL 8.0 | 关系型数据库 |
| 部署 | Docker Compose | 容器化编排 |

**关键决策**
- 图片存储：本地磁盘 `/uploads`
- 支付：模拟支付（API 直接修改订单状态）
- 搜索：SQL LIKE 模糊查询
- 货币：人民币 CNY（¥），后端 DECIMAL(10,2)
- 设计风格：清新简约（参考网易严选/无印良品）

---

## 2. 功能模块

### 2.1 前台商城

#### 首页
- 顶部导航栏：Logo、搜索框、分类菜单、购物车图标、用户头像/登录入口
- 轮播 Banner：3-5 张活动/新品推广图
- 分类快捷入口：图标网格形式展示一级分类
- 热销排行模块：按销量排序展示
- 新品上架模块：按上架时间排序展示
- 个性化推荐：基于用户浏览记录的推荐
- 页脚

#### 商品模块
- 商品列表页：分页加载、按分类筛选、价格排序、关键词搜索（LIKE 模糊匹配）
- 商品详情页：主图切换（缩略图列表）、商品信息（名称/价格/库存/描述）、加入购物车、收藏

#### 购物车与订单
- 购物车：添加商品、修改数量、删除、全选/取消、价格汇总
- 结算页：选择收货地址、选择优惠券、确认订单金额
- 下单流程：校验库存 → 计算金额 → 扣减库存 → 标记用券 → 清空购物车 → 生成订单
- 模拟支付：点击支付后 API 修改订单状态为 `paid`
- 订单列表：按状态筛选、分页
- 订单详情：订单信息、商品列表、状态时间线

#### 用户中心
- 个人信息：查看/编辑用户名、手机、头像
- 地址管理：增删改查、设置默认地址
- 我的收藏：收藏商品列表、取消收藏
- 我的订单：跳转订单列表
- 我的优惠券：已领取、已使用、已过期的券

#### 认证
- 注册：用户名 + 邮箱 + 密码
- 登录：用户名/邮箱 + 密码 → 获取 JWT token
- Token 存储在 Cookie，自动过期

### 2.2 后台管理（仅 admin 角色可访问）

#### 仪表盘
- 统计卡片：今日订单数、今日销售额、总用户数、在售商品数
- 可选：近 7 天订单趋势图

#### 商品管理
- 商品列表：分页、搜索、按分类筛选
- 新增/编辑商品：名称、描述、价格、原价、库存、分类、主图+多图上传
- 上架/下架

#### 分类管理
- 树形分类：支持一级和二级分类
- 增删改查

#### 订单管理
- 订单列表：按状态筛选、分页、搜索订单号
- 订单详情：查看订单信息和商品明细
- 操作：发货、取消订单

#### 用户管理
- 用户列表：分页、搜索
- 禁用/启用用户

#### 优惠券管理
- 优惠券列表
- 创建满减券：名称、门槛金额、减免金额、发放数量、有效期
- 查看使用情况

### 2.3 附加功能

#### 商品收藏
- 已登录用户可收藏/取消收藏商品
- 收藏列表支持分页和取消操作
- 同一商品不可重复收藏（数据库唯一约束）

#### 商品评价
- 仅购买过该商品的用户可评价
- 评价内容：1-5 星评分 + 可选文字 + 可选晒图
- 评价列表在商品详情页展示

#### 满减优惠券
- 管理员后台创建优惠券模板（满减类型）
- 用户在前台领取
- 下单时选择一张可用券，系统校验门槛并自动计算优惠后金额
- 使用后标记已用，不可重复使用

---

## 3. 页面路由

### 前台路由（default 布局）

| 路径 | 页面 | 渲染模式 | 认证 |
|------|------|----------|------|
| `/` | 首页 | SSR | ❌ |
| `/products` | 商品列表 | ISR | ❌ |
| `/products/:slug` | 商品详情 | ISR | ❌ |
| `/cart` | 购物车 | CSR | ✅ |
| `/checkout` | 结算/下单 | CSR | ✅ |
| `/orders` | 我的订单 | CSR | ✅ |
| `/orders/:id` | 订单详情 | CSR | ✅ |
| `/user` | 个人中心 | CSR | ✅ |
| `/user/addresses` | 地址管理 | CSR | ✅ |
| `/user/favorites` | 我的收藏 | CSR | ✅ |
| `/user/coupons` | 我的优惠券 | CSR | ✅ |
| `/auth/login` | 登录 | CSR | ❌ |
| `/auth/register` | 注册 | CSR | ❌ |

### 后台路由（admin 布局，需 admin 角色）

| 路径 | 页面 | 渲染模式 |
|------|------|----------|
| `/admin` | 仪表盘 | CSR |
| `/admin/products` | 商品管理 | CSR |
| `/admin/products/create` | 新增商品 | CSR |
| `/admin/products/:id/edit` | 编辑商品 | CSR |
| `/admin/categories` | 分类管理 | CSR |
| `/admin/orders` | 订单管理 | CSR |
| `/admin/orders/:id` | 订单详情 | CSR |
| `/admin/users` | 用户管理 | CSR |
| `/admin/coupons` | 优惠券管理 | CSR |

---

## 4. 数据库设计

### ER 关系图

```
                    ┌─────────────┐
                    │   coupons   │ 优惠券模板
                    └──────┬──────┘
                           │ 1:N
                    ┌──────▼──────┐
                    │user_coupons │ 用户领券
                    └──────┬──────┘
                           │
users ─┬─ addresses (1:N)  │
       ├─ favorites (1:N) ─┼─ products ── product_images (1:N)
       ├─ cart_items (1:N)─┘        └── categories (N:1)
       ├─ orders (1:N) ── order_items (1:N)
       ├─ reviews (1:N) ── products
       └─ user_coupons (1:N)
```

### 表定义

**users** — 用户
| 列 | 类型 | 说明 |
|----|------|------|
| id | INT PK AUTO_INCREMENT | |
| username | VARCHAR(50) UNIQUE | |
| email | VARCHAR(100) UNIQUE | |
| password_hash | VARCHAR(255) | bcrypt |
| role | ENUM('customer','admin') | 默认 customer |
| avatar_url | VARCHAR(500) NULL | |
| phone | VARCHAR(20) NULL | |
| is_active | BOOLEAN DEFAULT TRUE | 管理员可禁用 |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**addresses** — 收货地址
| 列 | 类型 | 说明 |
|----|------|------|
| id | INT PK | |
| user_id | INT FK → users | |
| receiver_name | VARCHAR(50) | |
| phone | VARCHAR(20) | |
| province | VARCHAR(50) | |
| city | VARCHAR(50) | |
| district | VARCHAR(50) | |
| detail | VARCHAR(255) | |
| is_default | BOOLEAN DEFAULT FALSE | |
| created_at | TIMESTAMP | |

**categories** — 商品分类
| 列 | 类型 | 说明 |
|----|------|------|
| id | INT PK | |
| name | VARCHAR(50) | |
| parent_id | INT FK NULL → categories | 支持二级分类 |
| icon | VARCHAR(255) NULL | |
| sort_order | INT DEFAULT 0 | |
| created_at | TIMESTAMP | |

**products** — 商品
| 列 | 类型 | 说明 |
|----|------|------|
| id | INT PK | |
| name | VARCHAR(200) | |
| slug | VARCHAR(200) UNIQUE | URL 友好标识 |
| description | TEXT | |
| price | DECIMAL(10,2) | 当前售价 |
| original_price | DECIMAL(10,2) NULL | 原价（划线价） |
| stock | INT DEFAULT 0 | |
| category_id | INT FK → categories | |
| main_image | VARCHAR(500) | 主图 URL |
| sales_count | INT DEFAULT 0 | 销量 |
| is_on_sale | BOOLEAN DEFAULT TRUE | 上架/下架 |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**product_images** — 商品图片
| 列 | 类型 | 说明 |
|----|------|------|
| id | INT PK | |
| product_id | INT FK → products | |
| image_url | VARCHAR(500) | |
| sort_order | INT DEFAULT 0 | |

**favorites** — 收藏
| 列 | 类型 | 说明 |
|----|------|------|
| id | INT PK | |
| user_id | INT FK → users | |
| product_id | INT FK → products | |
| created_at | TIMESTAMP | |
| 🔑 | UNIQUE(user_id, product_id) | |

**reviews** — 评价
| 列 | 类型 | 说明 |
|----|------|------|
| id | INT PK | |
| user_id | INT FK → users | |
| product_id | INT FK → products | |
| order_id | INT FK → orders | 确保购买后可评 |
| rating | TINYINT(1-5) | |
| content | TEXT NULL | |
| images | JSON NULL | 图片 URL 数组 |
| created_at | TIMESTAMP | |

**cart_items** — 购物车
| 列 | 类型 | 说明 |
|----|------|------|
| id | INT PK | |
| user_id | INT FK → users | |
| product_id | INT FK → products | |
| quantity | INT DEFAULT 1 | |
| created_at | TIMESTAMP | |

**coupons** — 优惠券模板
| 列 | 类型 | 说明 |
|----|------|------|
| id | INT PK | |
| name | VARCHAR(100) | |
| threshold | DECIMAL(10,2) | 满减门槛 |
| discount | DECIMAL(10,2) | 减免金额 |
| total_count | INT | 发放总量 |
| used_count | INT DEFAULT 0 | 已使用数量 |
| start_time | TIMESTAMP | 生效时间 |
| end_time | TIMESTAMP | 过期时间 |
| is_active | BOOLEAN DEFAULT TRUE | |
| created_at | TIMESTAMP | |

**user_coupons** — 用户领券/用券记录
| 列 | 类型 | 说明 |
|----|------|------|
| id | INT PK | |
| user_id | INT FK → users | |
| coupon_id | INT FK → coupons | |
| status | ENUM('unused','used','expired') | |
| used_at | TIMESTAMP NULL | |
| order_id | INT FK NULL → orders | 用于哪个订单 |
| created_at | TIMESTAMP | |

**orders** — 订单
| 列 | 类型 | 说明 |
|----|------|------|
| id | INT PK | |
| order_no | VARCHAR(32) UNIQUE | YYYYMMDDHHmmss + 6位随机数 |
| user_id | INT FK → users | |
| address_snapshot | JSON | 下单时的地址快照 |
| total_amount | DECIMAL(10,2) | 优惠后金额 |
| original_amount | DECIMAL(10,2) | 优惠前金额 |
| coupon_id | INT FK NULL → coupons | 使用的优惠券 |
| discount_amount | DECIMAL(10,2) DEFAULT 0 | 优惠金额 |
| status | ENUM('pending','paid','shipped','completed','cancelled') | |
| remark | VARCHAR(500) NULL | |
| paid_at | TIMESTAMP NULL | |
| shipped_at | TIMESTAMP NULL | |
| completed_at | TIMESTAMP NULL | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**order_items** — 订单商品明细
| 列 | 类型 | 说明 |
|----|------|------|
| id | INT PK | |
| order_id | INT FK → orders | |
| product_id | INT FK → products | |
| product_name | VARCHAR(200) | 商品名快照 |
| product_image | VARCHAR(500) | 商品图快照 |
| price | DECIMAL(10,2) | 购买时单价快照 |
| quantity | INT | |
| subtotal | DECIMAL(10,2) | 小计 |

---

## 5. API 接口

### 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1718534400000
}
```

### 前台 API

| 模块 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| Auth | POST | `/api/auth/register` | 注册 | ❌ |
| Auth | POST | `/api/auth/login` | 登录，返回 JWT | ❌ |
| User | GET | `/api/user/profile` | 个人信息 | ✅ |
| User | PUT | `/api/user/profile` | 更新信息 | ✅ |
| User | GET | `/api/user/addresses` | 地址列表 | ✅ |
| User | POST | `/api/user/addresses` | 新增地址 | ✅ |
| User | PUT | `/api/user/addresses/:id` | 更新地址 | ✅ |
| User | DELETE | `/api/user/addresses/:id` | 删除地址 | ✅ |
| Category | GET | `/api/categories` | 树形分类 | ❌ |
| Product | GET | `/api/products` | 列表（搜索/筛选/分页） | ❌ |
| Product | GET | `/api/products/:slug` | 详情 | ❌ |
| Favorite | GET | `/api/favorites` | 收藏列表 | ✅ |
| Favorite | POST | `/api/favorites` | 收藏 | ✅ |
| Favorite | DELETE | `/api/favorites/:productId` | 取消收藏 | ✅ |
| Cart | GET | `/api/cart` | 购物车列表 | ✅ |
| Cart | POST | `/api/cart` | 添加商品 | ✅ |
| Cart | PUT | `/api/cart/:id` | 修改数量 | ✅ |
| Cart | DELETE | `/api/cart/:id` | 移除 | ✅ |
| Coupon | GET | `/api/coupons/available` | 可领取券 | ✅ |
| Coupon | POST | `/api/coupons/:id/claim` | 领券 | ✅ |
| Coupon | GET | `/api/user/coupons` | 我的券 | ✅ |
| Order | POST | `/api/orders` | 创建订单 | ✅ |
| Order | GET | `/api/orders` | 订单列表 | ✅ |
| Order | GET | `/api/orders/:id` | 订单详情 | ✅ |
| Order | PUT | `/api/orders/:id/cancel` | 取消 | ✅ |
| Order | PUT | `/api/orders/:id/pay` | 模拟支付 | ✅ |
| Review | POST | `/api/reviews` | 发表评价 | ✅ |
| Review | GET | `/api/products/:id/reviews` | 商品评价 | ❌ |

### 后台 API（需 admin 角色）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/dashboard` | 统计数据 |
| GET | `/api/admin/products` | 商品列表 |
| POST | `/api/admin/products` | 新增商品 |
| PUT | `/api/admin/products/:id` | 编辑商品 |
| DELETE | `/api/admin/products/:id` | 删除商品 |
| GET/POST | `/api/admin/categories` | 分类列表/新增 |
| PUT/DELETE | `/api/admin/categories/:id` | 编辑/删除分类 |
| GET | `/api/admin/orders` | 订单列表 |
| PUT | `/api/admin/orders/:id/ship` | 发货 |
| PUT | `/api/admin/orders/:id/cancel` | 取消订单 |
| GET | `/api/admin/users` | 用户列表 |
| PUT | `/api/admin/users/:id/toggle` | 禁用/启用 |
| GET/POST | `/api/admin/coupons` | 券列表/创建 |
| PUT/DELETE | `/api/admin/coupons/:id` | 编辑/删除券 |

### 下单流程

```
POST /api/orders { addressId, couponId?, remark? }
  → 验证用户登录
  → 获取购物车商品
  → 校验库存
  → 计算 originalAmount
  → 校验优惠券（可选）：门槛、有效期、未使用
  → 计算 discountAmount、totalAmount
  → 在事务中：
      ├─ 创建 order + order_items（商品快照）
      ├─ 扣减库存
      ├─ 标记优惠券 used
      └─ 清空购物车
  → 返回订单详情
```

---

## 6. 前端架构

### 目录结构（client/）

```
client/
├── nuxt.config.ts              # Nuxt配置
├── tailwind.config.ts          # Tailwind主题
├── app.vue                     # 根组件
├── assets/                     # 静态资源
│   └── css/main.css
├── components/                 # 组件
│   ├── common/                 # AppButton, AppModal, AppPagination, AppToast
│   ├── layout/                 # DefaultLayout, AdminLayout, AppHeader, AppFooter
│   ├── product/                # ProductCard, ProductGrid, ProductFilter
│   ├── cart/                   # CartItem, CartSummary
│   └── order/                  # OrderCard, OrderStatusBadge
├── composables/                # useAuth, useCart, useProduct, useApi
├── layouts/                    # default.vue（前台）, admin.vue（后台）
├── middleware/                  # auth.ts, admin.ts
├── pages/                      # 文件路由（见第3节）
├── stores/                     # Pinia: auth, cart, ui
├── server/api/                 # BFF层（可选）
└── types/                      # product.ts, order.ts, user.ts, api.ts
```

### 渲染策略

| 页面类型 | 渲染模式 | 原因 |
|----------|----------|------|
| 首页 | SSR | SEO 最重要，首屏展示商品 |
| 商品列表/详情 | ISR + 按需验证 | SEO友好 + 无需每次构建 |
| 购物车/结算/订单 | CSR | 实时个性化数据 |
| 登录/注册 | CSR | 无SEO需求 |
| 个人中心 | CSR | 纯登录后使用 |
| 后台管理 | CSR | 无SEO需求 |

### 组件树（关键页面）

**首页**
```
DefaultLayout
├── AppHeader（Logo、搜索框、分类菜单、购物车图标、用户入口）
└── main
    ├── BannerCarousel（轮播）
    ├── CategoryGrid（分类入口）
    ├── ProductSection（热销排行，ProductCard × N）
    ├── ProductSection（新品上架，ProductCard × N）
    └── ProductSection（猜你喜欢，ProductCard × N）
```

**商品列表**
```
DefaultLayout
└── main
    ├── ProductFilter（分类树 + 价格排序）
    └── ProductGrid（ProductCard × N + AppPagination）
```

**结算页**
```
DefaultLayout
└── main
    ├── AddressSelector（选择/新增地址）
    ├── OrderItemList（商品明细）
    ├── CouponSelector（选择优惠券）
    └── OrderSummary（金额汇总 + 下单按钮）
```

---

## 7. 后端架构

### 目录结构（server/）

```
server/
├── src/
│   ├── main.ts               # 应用入口
│   ├── app.module.ts         # 根模块
│   ├── common/               # 通用层
│   │   ├── decorators/       # @CurrentUser, @Roles
│   │   ├── filters/          # HttpExceptionFilter
│   │   ├── guards/           # JwtAuthGuard, RolesGuard
│   │   ├── interceptors/     # TransformInterceptor（统一响应包装）
│   │   └── pipes/            # ValidationPipe
│   ├── config/               # 配置
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   ├── modules/
│   │   ├── auth/             # 认证模块（登录/注册/JWT策略）
│   │   ├── user/             # 用户模块（个人信息/地址）
│   │   ├── product/          # 商品模块（含搜索/筛选）
│   │   ├── category/         # 分类模块（树形结构）
│   │   ├── cart/             # 购物车模块
│   │   ├── order/            # 订单模块（含下单/支付流程）
│   │   ├── favorite/         # 收藏模块
│   │   ├── review/           # 评价模块
│   │   ├── coupon/           # 优惠券模块
│   │   └── admin/            # 后台管理模块（Dashboard等）
│   └── shared/               # 共享
│       ├── constants/        # 枚举（OrderStatus等）
│       └── utils/            # 工具函数
└── test/
```

### 模块依赖关系

```
auth ← user ← favorite
        ↓
     order ← cart ← product ← category
        ↓        ↓
     coupon   review
        ↓
     admin（聚合多个模块的服务）
```

---

## 8. 实施步骤

### 阶段 1：项目脚手架 — 搭建开发环境

**目标**：从零搭建 Docker 开发环境，前后端项目能启动，数据库能连接。

**后端**
1. 创建 `server/` 目录，用 NestJS CLI 初始化项目（`nest new server`）
2. 安装核心依赖：`@nestjs/typeorm`、`typeorm`、`mysql2`、`@nestjs/config`、`@nestjs/jwt`、`@nestjs/passport`、`passport-jwt`、`bcrypt`、`class-validator`、`class-transformer`
3. 创建 `.env` 和 `.env.example`，定义 `DATABASE_URL`、`JWT_SECRET`、`JWT_EXPIRES_IN`、`UPLOAD_URL`
4. 创建 `src/config/database.config.ts`，读取环境变量配置 TypeORM 连接
5. 在 `app.module.ts` 中导入 `TypeOrmModule.forRootAsync()` 和 `ConfigModule.forRoot({ isGlobal: true })`
6. 创建 `src/common/` 骨架：`TransformInterceptor`（包装 `{ code, message, data, timestamp }`）、`HttpExceptionFilter`
7. 在 `main.ts` 中全局注册 `ValidationPipe`、`TransformInterceptor`、`HttpExceptionFilter`，启用 CORS

**前端**
1. 创建 Nuxt 3 项目：`npx nuxi init client`
2. 安装模块：`@nuxtjs/tailwindcss`、`@pinia/nuxt`、`@nuxtjs/i18n`（可选）
3. 配置 `tailwind.config.ts`，设定清新简约风格的颜色主题（暖白背景、低饱和主色）
4. 创建 `assets/css/main.css`，引入 Tailwind 指令，定义全局 CSS 变量
5. 创建 `layouts/default.vue`（前台：Header + 主体 + Footer 骨架）和 `layouts/admin.vue`（后台：侧边栏 + 顶栏骨架）
6. 创建 `composables/useApi.ts`：基于 `$fetch` 封装，自动拼接 `baseURL`、注入 Cookie 中的 JWT token、统一错误处理
7. 创建 `middleware/auth.ts` 和 `middleware/admin.ts` 骨架
8. 创建 `stores/auth.ts`（登录状态、token 管理）和 `stores/cart.ts` 骨架
9. 创建 `types/api.ts`：`ApiResponse<T>` 接口定义
10. 在 `nuxt.config.ts` 中配置 `runtimeConfig.public.apiBase`

**Docker**
1. 在项目根目录创建 `docker-compose.yml`，定义 3 个服务：
   - `mysql`：MySQL 8.0，端口 3306，挂载数据卷，设置初始密码
   - `server`：构建 `server/Dockerfile`，端口 3000，依赖 mysql
   - `client`：构建 `client/Dockerfile`，端口 3001，依赖 server
2. 创建 `server/Dockerfile`（多阶段：build + production）
3. 创建 `client/Dockerfile`（Nuxt Nitro SSR 模式）
4. 创建 `.gitignore`（忽略 node_modules、.env、uploads、.data、dist、.output）
5. 执行 `docker-compose up -d` 验证环境正常启动，前端能访问 API 返回数据

**验证**：`docker-compose up -d` 后前端 [http://localhost:3001](http://localhost:3001) 显示 Nuxt 欢迎页，后端 [http://localhost:3000](http://localhost:3000) 响应 `{"code":200,"message":"success"}`。

---

### 阶段 2：数据库建模 — Entity + 迁移 + 种子数据

**目标**：所有数据表 Entity 定义完成，自动建表，有测试数据可用来开发。

1. 按顺序创建所有 Entity 文件：
   - `modules/user/entities/user.entity.ts`
   - `modules/user/entities/address.entity.ts`
   - `modules/category/entities/category.entity.ts`
   - `modules/product/entities/product.entity.ts`
   - `modules/product/entities/product-image.entity.ts`
   - `modules/favorite/entities/favorite.entity.ts`
   - `modules/order/entities/cart-item.entity.ts`
   - `modules/order/entities/order.entity.ts`
   - `modules/order/entities/order-item.entity.ts`
   - `modules/review/entities/review.entity.ts`
   - `modules/coupon/entities/coupon.entity.ts`
   - `modules/coupon/entities/user-coupon.entity.ts`
2. 每个 Entity 定义完整的 `@Column()` 装饰器、`@ManyToOne`/`@OneToMany` 关系、唯一约束
3. 在 `database.config.ts` 开启 `synchronize: true`（开发阶段），验证建表成功
4. 创建 `server/src/database/seeds/` 目录
5. 编写种子数据脚本 `seed.ts`（独立脚本，用 TypeORM DataSource 插入测试数据）：
   - 2 个用户（1 个 customer + 1 个 admin，密码 bcrypt 加密）
   - 5 个一级分类 + 8 个二级分类
   - 30 个商品（覆盖各分类，价格 9.9~999 元，3-5 张图片/商品）
   - 2 个优惠券模板
6. 在 `package.json` 添加 `"seed": "ts-node src/database/seeds/seed.ts"` 脚本
7. 执行 `npm run seed` 验证数据插入

**验证**：用 MySQL 客户端连接查看表结构和种子数据，确认外键关系和约束正确。

---

### 阶段 3：认证 + 用户模块

**目标**：用户可以注册、登录，JWT 认证体系跑通，个人中心和地址管理可用。

**后端**
1. **Auth 模块**
   - 实现 `POST /api/auth/register`：校验用户名/邮箱唯一性 → bcrypt 加密密码 → 创建用户 → 返回 JWT
   - 实现 `POST /api/auth/login`：校验凭证 → 生成 JWT（payload: `{ sub, username, role }`）→ 返回 token + 用户信息
   - DTO：`register.dto.ts`（username, email, password）、`login.dto.ts`（username, password）
   - 编写 `jwt.strategy.ts`：从请求头提取 token → 校验 → 注入 `req.user`
   - 编写 `JwtAuthGuard`：基于 passport-jwt 的守卫
   - 编写 `RolesGuard` + `@Roles('admin')` 装饰器
2. **User 模块**
   - 实现 `GET /api/user/profile`：返回当前登录用户信息
   - 实现 `PUT /api/user/profile`：更新用户名、手机、头像
   - DTO：`update-user.dto.ts`
3. **Address 子模块**（放在 user 模块内或独立）
   - 实现完整 CRUD：`GET/POST /api/user/addresses`、`PUT/DELETE /api/user/addresses/:id`
   - 设置默认地址逻辑：标记 default 时自动取消其他地址的默认

**前端**
1. **登录/注册页面**（`pages/auth/login.vue`、`pages/auth/register.vue`）
   - 表单：用户名 + 密码 / 用户名 + 邮箱 + 密码
   - 提交后用 `useApi` 调用 API，拿到 token 存入 Pinia `auth` store 和 Cookie
   - 成功后跳转到首页
2. **认证状态管理**：
   - `stores/auth.ts`：`user`、`token`、`isLoggedIn`、`login()`、`logout()`、`fetchProfile()`
   - Cookie 存储 token，页面刷新时自动恢复登录状态
3. **路由中间件**
   - `middleware/auth.ts`：检查 token，无则重定向到 `/auth/login`
   - `middleware/admin.ts`：检查 role === 'admin'，否则重定向到 403
4. **Header 组件**（`components/layout/AppHeader.vue`）
   - 未登录：显示登录/注册按钮
   - 已登录：显示用户名、购物车图标（带数量 badge）
5. **个人中心页**（`pages/user/index.vue`）
   - 展示用户信息，可编辑
6. **地址管理页**（`pages/user/addresses.vue`）
   - 地址列表 + 新增/编辑弹窗 + 删除确认 + 设默认

**验证**：完整走通注册 → 登录 → 查看个人信息 → 添加地址 → 退出登录流程。

---

### 阶段 4：分类 + 商品模块

**目标**：后端商品/分类 API 完整可用，前端商品列表和详情页展示。

**后端 — Category 模块**
1. 实现 `GET /api/categories`：返回树形结构的分类（一级分类包含 children 数组）
2. Service 中递归查询或一次查询后在代码中构建树

**后端 — Product 模块**
1. 实现 `GET /api/products`：
   - Query 参数：`keyword`（搜索）、`categoryId`（筛选）、`sort`（price_asc/price_desc/sales/newest）、`page`、`pageSize`
   - SQL LIKE 搜索 `name` 和 `description`
   - 根据 categoryId 包含子分类的所有商品
   - 分页返回 `{ list, total, page, pageSize }`
   - DTO：`query-product.dto.ts`
2. 实现 `GET /api/products/:slug`：
   - 返回商品详情（含分类信息、图片数组）
   - 同时查询该商品的平均评分和评价数量
3. 文件上传：
   - 在 `main.ts` 配置 `ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'uploads') })`
   - 创建图片上传接口 `POST /api/admin/upload`（使用 `@nestjs/platform-express` 的 `FileInterceptor`）
   - 文件命名：`timestamp` + 随机串，存储到 `./uploads`

**前端 — 商品列表页**（`pages/products/index.vue`）
1. 使用 `useRoute().query` 获取筛选参数，拼接到 API 请求
2. 搜索框：输入关键词，按回车或点击搜索触发查询
3. 分类筛选侧栏：用 `useFetch` 获取分类树，点击分类更新 categoryId 筛选
4. 商品网格：用 `ProductCard` 组件展示，响应式 4/3/2 列
5. 分页：`AppPagination` 组件，下一页/上一页/跳页
6. 渲染模式：Nuxt `defineRouteRules` 设置 ISR（每小时重新验证）

**前端 — 商品详情页**（`pages/products/[slug].vue`）
1. 主图区域：当前大图 + 下方缩略图列表，点击切换
2. 商品信息：名称、价格、原价（划线）、库存、销量、描述
3. 「加入购物车」按钮 + 数量选择器
4. 「收藏」按钮（心形图标切换）
5. 渲染模式：ISR

**验证**：首页展示商品列表，搜索 "手机" 返回相关商品，点击进入详情页，分类筛选正常。

---

### 阶段 5：收藏模块

**目标**：用户可收藏/取消收藏商品，收藏列表可查看。

**后端 — Favorite 模块**
1. 实现 `GET /api/favorites`：当前用户收藏列表，分页，包含商品基本信息
2. 实现 `POST /api/favorites`：`{ productId }` → 创建收藏记录（唯一约束防重复）
3. 实现 `DELETE /api/favorites/:productId`：取消收藏

**前端**
1. 商品详情页：收藏按钮切换（根据 `isFavorited` 状态显示实心/空心）
2. 商品卡片：可显示收藏按钮
3. 收藏列表页（`pages/user/favorites.vue`）：分页展示 + 取消收藏

**验证**：登录后收藏商品 → 查看收藏列表 → 取消收藏 → 再次尝试收藏同一商品不报错。

---

### 阶段 6：购物车模块

**目标**：购物车完整 CRUD，前端购物车页面交互流畅。

**后端 — Cart 模块**（放在 order 模块内）
1. 实现 `GET /api/cart`：当前用户购物车列表，JOIN 商品信息（名称、主图、价格、库存）
2. 实现 `POST /api/cart`：`{ productId, quantity }` → 如已存在则累加数量
3. 实现 `PUT /api/cart/:id`：更新商品数量（校验 stock）
4. 实现 `DELETE /api/cart/:id`：移除商品
5. 添加 API `DELETE /api/cart`：清空购物车

**前端 — 购物车页**（`pages/cart/index.vue`）
1. 购物车商品列表：每项展示图片、名称、单价、数量选择器（+/-）、小计、删除
2. 全选/取消全选 checkbox
3. 已选商品总价汇总（`CartSummary` 组件）
4. 「去结算」按钮 → 跳转 `/checkout`
5. 空购物车状态：插图和「去逛逛」引导按钮

**前端 — Pinia 购物车状态**（`stores/cart.ts`）
1. `items`、`selectedIds`、`totalPrice`、`totalCount`
2. 购物车操作同步调用 API + 乐观更新本地状态

**前端 — Header 购物车图标**
1. 显示购物车数量 badge
2. 悬停可预览（小弹窗）

**验证**：添加商品到购物车 → 修改数量 → 删除 → 全选价格计算正确 → Header badge 同步更新。

---

### 阶段 7：订单模块

**目标**：完整下单流程，订单状态流转，前端结算页和订单列表/详情页。

**后端 — Order 模块**
1. **创建订单** `POST /api/orders`（事务操作）：
   - 输入：`{ addressId, couponId?, remark? }`
   - 获取购物车 → 校验库存 → 查地址 → 计算金额 → 校验优惠券 → 执行事务
2. **生成订单编号**：`YYYYMMDDHHmmss` + 6 位随机数
3. **地址快照**：创建订单时将地址 JSON 保存到 `address_snapshot`
4. **商品快照**：order_items 保存购买时的商品名称、图片、价格
5. 实现 `GET /api/orders`：当前用户订单列表，分页，按状态筛选
6. 实现 `GET /api/orders/:id`：订单详情（含 order_items），仅本人可查看
7. 实现 `PUT /api/orders/:id/cancel`：取消订单（仅 pending 状态可取消），恢复库存、恢复优惠券
8. 实现 `PUT /api/orders/:id/pay`：模拟支付 → 状态改为 `paid`，记录 `paid_at`

**前端 — 结算页**（`pages/checkout/index.vue`）
1. 步骤式或一页式表单
2. 选择收货地址（从用户地址列表选，或新增）
3. 确认商品列表（从购物车选中的商品）
4. 选择优惠券（显示可用券，含够不够门槛的提示）
5. 金额汇总：商品总额 → 运费（免邮）→ 优惠金额 → 实付金额
6. 「提交订单」按钮 → 创建订单 → 跳转支付确认页

**前端 — 支付确认页**（结算页的第二步或弹窗）
1. 显示订单号、支付金额
2. 「确认支付」按钮 → 调用模拟支付 API → 跳转订单详情

**前端 — 订单列表页**（`pages/orders/index.vue`）
1. Tab 切换状态筛选：全部 / 待付款 / 已付款 / 已发货 / 已完成 / 已取消
2. 订单卡片：订单号、时间、金额、状态 badge、商品缩略图
3. 点击进入订单详情

**前端 — 订单详情页**（`pages/orders/[id].vue`）
1. 订单状态时间线（PENDING → PAID → SHIPPED → COMPLETED）
2. 商品列表（快照数据）
3. 收货地址、优惠券信息
4. 操作按钮：待付款 → 去支付、待发货 → 取消订单、已收货 → 去评价

**验证**：添加商品到购物车 → 结算 → 选地址 → 选优惠券（选个不够门槛的提示不能选）→ 下单 → 模拟支付 → 查看订单列表 → 取消一个 pending 订单。

---

### 阶段 8：评价模块

**目标**：用户可评价已购商品，评价展示在商品详情页。

**后端 — Review 模块**
1. 实现 `POST /api/reviews`：
   - 输入：`{ productId, orderId, rating, content?, images? }`
   - 校验：该用户确实购买了该商品且未评价过
   - 图片上传（可复用 upload API 或前端先上传再传 URL 数组）
2. 实现 `GET /api/products/:id/reviews`：某商品的评价列表，分页，按时间倒序
3. 评价提交后更新 `products` 表的评分汇总（可选，或实时算平均分）

**前端 — 商品详情页评价区域**
1. 评价列表：用户头像、用户名（脱敏）、评分星星、评价时间、内容、晒图
2. 评分分布概览（平均分 + 各星级数量）

**前端 — 发表评价**
1. 在订单详情页，已收货状态显示「去评价」按钮
2. 弹窗/跳页：星级评分组件（hover 交互）、文字输入、图片上传（可选）

**验证**：支付后模拟发货/收货 → 从订单详情进入评价 → 发表 4 星 + 文字 + 图 → 在商品详情页查看到该评价。

---

### 阶段 9：优惠券模块

**目标**：管理员创建满减券，用户领取、下单使用。

**后端 — Coupon 模块**
1. 实现 `GET /api/coupons/available`：当前可领取的券（is_active、在有效期内、未领完）
2. 实现 `POST /api/coupons/:id/claim`：当前用户领取（校验是否已领、是否有库存）
3. 实现 `GET /api/user/coupons`：我的券列表，可按 status 筛选
4. 在 `POST /api/orders` 中集成优惠券校验逻辑：
   - 校验券属于当前用户
   - 校验券未使用、未过期
   - 校验订单金额 >= threshold
   - 计算 totalAmount = originalAmount - discount
   - 标记 coupon 为 used，增加 coupons.used_count

**前端 — 我的优惠券页**（`pages/user/coupons.vue`）
1. Tab：可用 / 已使用 / 已过期
2. 优惠券卡片：券名称、门槛、金额、有效期

**前端 — 领券中心**（可在首页或独立页放置入口）
1. 展示可领取的券，点击「立即领取」

**前端 — 结算页优惠券选择**
1. 下拉/弹窗选择可用券
2. 提示是否满足门槛（如"还差 ¥50 可用"）
3. 选中后自动计算优惠后金额

**验证**：管理员后台创建券 → 用户在前台领取 → 下单尝试使用（不满足门槛不生效）→ 满足门槛成功用券 → 券变为已使用。

---

### 阶段 10：后台管理

**目标**：管理员后台完整可用，能管理商品、分类、订单、用户、优惠券。

**后端 — Admin 模块**
1. **Dashboard**：`GET /api/admin/dashboard`
   - 返回：今日订单数、今日销售额、总用户数、在售商品数
   - 可选：近 7 天每日订单数（用于折线图）
2. **商品管理**：CRUD（含图片上传、上架/下架）
3. **分类管理**：CRUD（树形结构管理界面数据）
4. **订单管理**：列表 + 发货操作 `PUT /api/admin/orders/:id/ship`（状态 pending/paid → shipped，记录 shipped_at）
5. **用户管理**：列表 + 禁用/启用 toggle
6. **优惠券管理**：CRUD + 查看使用统计
7. 所有后台接口用 `@Roles('admin')` + `RolesGuard` 保护

**前端 — 后台布局**（`layouts/admin.vue`）
1. 左侧固定侧边栏：Dashboard、商品、分类、订单、用户、优惠券 导航
2. 顶栏：Logo + 用户信息 + 返回前台
3. Tailwind 后台风格：继承清新简约但偏功能化

**前端 — 各管理页面**
1. Dashboard：4 个统计卡片 + 近 7 天订单图表（Vue3 + Chart.js 或简单手写）
2. 商品管理：表格列表 + 搜索 + 新增/编辑表单（富文本可选 Markdown） + 图片上传预览
3. 分类管理：表格 + 新增（选父分类）/编辑/删除（有子分类不能删）
4. 订单管理：Table + 状态筛选 + 查看详情抽屉 + 发货按钮
5. 用户管理：表格 + 搜索 + 禁用/启用切换
6. 优惠券管理：表格 + 创建表单（门槛、金额、数量、时间范围）

**验证**：用 admin 账号登录后台，完成各模块 CRUD，数据同步反映到前台。

---

### 阶段 11：首页建设

**目标**：首页内容丰富，视觉好看，体验流畅。

**前端 — 首页**（`pages/index.vue`）
1. **轮播 Banner**：`BannerCarousel` 组件
   - 从 API 获取 banner 数据（可配置：图片、标题、链接）
   - 支持自动播放 + 手动切换 + 指示器
2. **分类入口**：`CategoryGrid` 组件
   - 一级分类图标 + 名称的网格排列
   - 每个入口点击跳转到对应分类的商品列表
3. **热销排行**：`ProductSection` 组件
   - 标题 + 「查看更多」链接
   - 横向可滚动或 5 列网格，`ProductCard` 展示
   - 数据通过 API `?sort=sales&pageSize=5` 获取
4. **新品上架**：同上，`?sort=newest&pageSize=5`
5. **猜你喜欢**：基于浏览记录的个性化推荐
   - 后端实现：记录用户浏览过的分类，推荐同类商品
   - 简单方案：查用户最近浏览的商品分类，随机取该分类下的商品
   - 展示标题 "猜你喜欢"
6. SSR 渲染：用 `useAsyncData` + `defineRouteRules({ ssr: true })` 确保首页服务端渲染

**后端 — Banner 接口**（可选，或前端硬编码 banner 配置）
1. 创建 `GET /api/banners`：返回 banner 配置列表

**验证**：首页各模块正常加载，轮播可用，点击入口/商品正确跳转。

---

### 阶段 12：收尾优化

**目标**：打磨细节，提交前质量检查。

1. **SEO 优化**：
   - 首页、商品列表、商品详情设置合理的 `<title>`、`<meta description>`
   - `nuxt.config.ts` 中配置 `seo` 模块或手动处理 head
   - 商品详情页添加 Open Graph 标签
   - 生成 `sitemap.xml`（Nuxt 模块自动或手动）
2. **性能优化**：
   - 图片懒加载（Nuxt Image 或 `loading="lazy"`）
   - API 响应分页确保不返回过多数据
   - 确保首页 SSR 渲染不阻塞
3. **UI 打磨**：
   - 响应式适配（移动端：单列/双列、底部导航、汉堡菜单）
   - 加载状态：Skeleton 屏（商品卡片骨架屏）
   - 空状态：各列表页的空状态提示
   - 错误状态：网络错误提示 + 重试按钮
   - Toast 通知：成功/失败操作提示
   - 按钮 loading 状态
4. **代码整理**：
   - 确保所有 TypeScript 类型到位
   - 清理 console.log
   - 确保 `.env` 不在 Git 中
   - 补充 `README.md`
5. **最终验证**：
   - 完整走通前台全部流程
   - 完整走通后台全部流程
   - 移动端浏览器测试
   - Docker 环境从头启动测试
