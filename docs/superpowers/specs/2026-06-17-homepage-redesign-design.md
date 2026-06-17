# 电商商城 PC 首页重设计 — 设计规格书

**日期**: 2026-06-17  
**状态**: 已确认  
**范围**: 前端 `client/` 目录，仅 PC 端首页

---

## 1. 设计目标

重新设计 GreenMall 2.0 PC 端首页，定位现代简约商务风格：
- 干净白色主色调，浅绿色 `#22c55e` 辅助色
- 圆角柔和卡片（12px），分层轻量化阴影
- 无衬线字体 Inter
- 丰富内容层次，引导用户浏览和转化

---

## 2. 视觉规范

| 参数 | 值 |
|------|-----|
| 主色 | `#22c55e` (green-500) |
| 辅色 | `#4ade80` (green-400) / `#166534` (green-700) |
| 浅色背景 | `#f0fdf4` (green-50) / `#dcfce7` (green-100) |
| 卡片圆角 | `12px` (rounded-xl) |
| 卡片阴影 | `0 1px 3px rgba(0,0,0,0.04)` hover→`0 4px 12px rgba(0,0,0,0.08)` |
| 按钮圆角 | `8px` (rounded-lg) |
| 字体 | Inter (Google Fonts, weights 400/500/600/700) |
| 过渡动画 | `transition-all duration-200` |

### 颜色层次对照表
```
页面背景: #f9fafb (gray-50)
白色卡片区: #ffffff
浅绿背景条: #f0fdf4 (green-50)
特价横条: #fef3c7 (amber-50)
边框线: #f3f4f6 (gray-100) / #e5e7eb (gray-200)
主文字: #111827 (gray-900)
辅助文字: #6b7280 (gray-500)
价格: #22c55e (green-500)
```

---

## 3. 页面结构（从上到下）

### 3.1 顶部导航栏（AppHeader·重写）
- 粘性定位（sticky top-0），白色背景，底部 1px 边框
- **Logo** 左侧：`🌿 GreenMall`，绿色加粗 `text-green-500 font-bold`
- **搜索框** 居中：`max-w-[480px]`，`border-2 border-green-500` 聚焦态，圆角 `rounded-lg`，placeholder "搜索商品、品牌、分类..."
- **分类按钮**：`📂 分类` 图标+文字，点击展开 Mega Menu 下拉面板（显示所有一级+二级分类，树形呈现）
- **右侧图标**：购物车 `🛒`（数量角标 green-500 背景白色文字）+ 用户头像 `👤`（已登录显示头像首字母圆形容器，未登录显示登录链接）

### 3.2 Banner 轮播区（HeroBanner·新增）
- 3 张轮播，自动播放 4s 间隔，手动左右箭头切换
- 绿色渐变背景：`linear-gradient(135deg, #f0fdf4, #dcfce7, #bbf7d0)`
- 左文字 + 右 emoji 装饰图布局，左右 padding 48px
- 每张内容：
  1. "618 年中大促" — 全场低至5折 · 精选好物限时抢，CTA "立即抢购 →"
  2. "新品首发" — 最新数码/服饰抢先购 · 限时12期免息，CTA "探索新品 →"
  3. "会员专区" — 积分翻倍·专属折扣·优先发货，CTA "了解权益 →"
- 底部指示器：圆点/短线，当前 active 项加长 + 绿色填充
- 左右切换箭头：hover 时显示，半透明白色圆形背景

### 3.3 分类图标导航（CategoryIcons·新增）
- 8 个圆形图标，一行排列，`justify-between`
- 每个：emoji 图标 + 分类名称文字（12px），点击跳转 `/products?categoryId=X`
- 背景：白色卡片 `rounded-xl`，内边距 `py-4`

### 3.4 限时特价横条（FlashDealBar·新增）
- 浅黄色背景 `bg-amber-50`，圆角 `rounded-xl`
- 左侧：⚡ 图标 + "限时特价" 标题
- 中间：倒计时 `HH:MM:SS`（模拟 12 小时后到期）
- 右侧："全场低至5折 · 手慢无" 标语
- 点击跳转 `/products?sortBy=price&sortOrder=ASC`

### 3.5 精选好物（ProductGrid·新增）
- 标题行："✨ 精选好物" + 右对齐"查看更多 →" 链接
- 网格 `grid-cols-4`，2 行共 8 个商品
- 使用简洁商品卡片（见 3.8）

### 3.6 热销排行 + 新品上架（HotRanking + ProductGrid·新增）
- 左右布局：`grid-cols-3`，左 1/3 热销排行，右 2/3 新品上架
- **热销排行**：TOP 5 列表，每项带排名数字（#1 金色、#2 银色、#3 铜色）、商品名、价格
- **新品上架**：2行×3列 网格，使用简洁商品卡片

### 3.7 特色服务横条（ServiceBar·新增）
- 浅绿背景 `bg-green-50`，圆角 `rounded-xl`
- 4 项水平排列：🚚 免费配送 · 🔄 7天无理由退换 · 🛡️ 正品保障 · 💬 在线客服
- 每项：emoji 图标 + 文字，间距均匀分布

### 3.8 商品卡片（ProductCard·改版）
- 白色背景，圆角 `rounded-xl`(12px)，边框 `border border-gray-100`
- 阴影 `shadow-sm`（0 1px 3px rgba(0,0,0,0.04)）
- hover 效果：阴影加深至 `shadow-md`，图片 `scale-105`，`transition-all duration-200`
- 卡片结构：
  - 图片区：浅灰背景 `bg-gray-50`，商品图片或 emoji 占位，`aspect-[4/3]`
  - 信息区：`p-3` 内边距
    - 分类标签（11px，gray-500）
    - 商品名称（12px 加粗，最多2行截断 `line-clamp-2`）
    - 价格（15px 加粗 green-500）+ 销量（10px gray-400）
- 支持 `isFeatured` 角标（⭐ 精选标记）

---

## 4. 组件清单

### 新建组件（6个）
| 组件 | 路径 | 说明 |
|------|------|------|
| HeroBanner | `components/home/HeroBanner.vue` | 3张渐变轮播，自动播放+手动切换+指示器 |
| CategoryIcons | `components/home/CategoryIcons.vue` | 8圆形分类导航 |
| FlashDealBar | `components/home/FlashDealBar.vue` | 限时特价横条+倒计时 |
| ProductGrid | `components/home/ProductGrid.vue` | 带标题+查看更多链接的商品网格 |
| HotRanking | `components/home/HotRanking.vue` | TOP5热销排行侧栏 |
| ServiceBar | `components/home/ServiceBar.vue` | 4项服务承诺横条 |

### 重写/改版组件（3个）
| 组件 | 路径 | 改动 |
|------|------|------|
| AppHeader | `components/layout/AppHeader.vue` | 搜索居中+分类按钮+Mega Menu面板 |
| ProductCard | `components/product/ProductCard.vue` | 新视觉：12px圆角+轻阴影+hover动画 |
| AppFooter | `components/layout/AppFooter.vue` | 微调颜色适配新风格 |

### 修改配置文件（4个）
| 文件 | 改动 |
|------|------|
| `nuxt.config.ts` | 添加 Google Fonts (Inter) 链接 |
| `tailwind.config.ts` | 扩展阴影、确认绿色调色板 |
| `assets/css/main.css` | Inter 字体导入、卡片hover动画、全局样式 |
| `pages/index.vue` | 完全重写，组装所有首页组件 |

---

## 5. 数据流

- **分类数据**: CategoryIcons 组件从后端 `GET /api/categories` 获取（启用的一级分类），点击跳转 `/products?categoryId=X`
- **商品数据**: ProductGrid/HotRanking 组件从后端 `GET /api/products` 获取，分别传不同参数：
  - 精选好物：`?isFeatured=true&limit=8`
  - 热销排行：`?sortBy=salesCount&sortOrder=DESC&limit=5`
  - 新品上架：`?sortBy=createdAt&sortOrder=DESC&limit=6`
- **用户状态**: 从 auth store 读取，控制导航栏头像/登录状态
- **购物车角标**: 从 cart store 读取 `totalCount`

---

## 6. 非功能需求

- **响应式**: 首页宽度 `max-w-7xl` 居中，最小支持 1024px 宽屏（PC 端专属）
- **性能**: 商品图片使用 Nuxt Image 或懒加载，Banner 使用 CSS 渐变避免图片加载阻塞
- **SEO**: 首页 SSR 渲染，商品数据服务端获取
- **无障碍**: 按钮和链接有 `aria-label`，轮播支持键盘左右箭头操作
- **动画**: 轮播切换用 `transform translateX`，卡片 hover 用 `scale`+`shadow` 过渡

---

## 7. 验证标准

- [ ] 首页在 `http://localhost:3001` 正常渲染所有区块
- [ ] 导航栏搜索框居中，输入关键词回车跳转商品列表页
- [ ] 分类按钮点击展开 Mega Menu，显示所有分类
- [ ] Banner 自动轮播（4s间隔），手动可切换
- [ ] 所有商品卡片 hover 有阴影加深+图片放大效果
- [ ] 限时特价倒计时正常运行
- [ ] 点击"查看更多"跳转正确
- [ ] 购物车角标实时显示数量
- [ ] 中文商品名称无乱码
