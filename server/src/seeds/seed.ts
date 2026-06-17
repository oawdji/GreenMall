/**
 * 种子数据脚本 —— 填充开发/测试用初始数据
 *
 * 使用方式: npx ts-node -r tsconfig-paths/register src/seeds/seed.ts
 * 或: npm run seed
 *
 * 注意: 此脚本会先清空已有数据再插入，仅限开发环境使用
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Category } from '../modules/category/entities/category.entity';
import { Product } from '../modules/product/entities/product.entity';
import { ProductImage } from '../modules/product/entities/product-image.entity';
import { User } from '../modules/user/entities/user.entity';
import { Role } from '../common/roles.decorator';
import { Repository, TreeRepository, DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Logger } from '@nestjs/common';

const logger = new Logger('Seed');

/**
 * 分类种子数据
 * [名称, 图标emoji, 排序]
 */
const CATEGORY_SEEDS: Array<{
  name: string;
  icon: string;
  sort: number;
  children?: Array<{ name: string; icon: string; sort: number }>;
}> = [
  {
    name: '手机数码',
    icon: '📱',
    sort: 1,
    children: [
      { name: '智能手机', icon: '📱', sort: 1 },
      { name: '平板电脑', icon: '📋', sort: 2 },
      { name: '智能穿戴', icon: '⌚', sort: 3 },
      { name: '耳机音箱', icon: '🎧', sort: 4 },
    ],
  },
  {
    name: '电脑办公',
    icon: '💻',
    sort: 2,
    children: [
      { name: '笔记本', icon: '💻', sort: 1 },
      { name: '台式机', icon: '🖥️', sort: 2 },
      { name: '电脑配件', icon: '🖱️', sort: 3 },
    ],
  },
  {
    name: '服装鞋帽',
    icon: '👗',
    sort: 3,
    children: [
      { name: '女装', icon: '👗', sort: 1 },
      { name: '男装', icon: '👔', sort: 2 },
      { name: '运动户外', icon: '🏃', sort: 3 },
      { name: '鞋靴箱包', icon: '👟', sort: 4 },
    ],
  },
  {
    name: '食品饮料',
    icon: '🍜',
    sort: 4,
    children: [
      { name: '休闲零食', icon: '🍪', sort: 1 },
      { name: '饮料冲调', icon: '☕', sort: 2 },
      { name: '生鲜水果', icon: '🍎', sort: 3 },
      { name: '地方特产', icon: '🏺', sort: 4 },
    ],
  },
  {
    name: '家居用品',
    icon: '🏠',
    sort: 5,
    children: [
      { name: '家纺布艺', icon: '🛏️', sort: 1 },
      { name: '灯具照明', icon: '💡', sort: 2 },
      { name: '收纳清洁', icon: '🧹', sort: 3 },
      { name: '厨房用具', icon: '🍳', sort: 4 },
    ],
  },
  {
    name: '美妆个护',
    icon: '💄',
    sort: 6,
    children: [
      { name: '面部护肤', icon: '🧴', sort: 1 },
      { name: '彩妆香水', icon: '💄', sort: 2 },
      { name: '个人护理', icon: '🪥', sort: 3 },
    ],
  },
  {
    name: '图书文娱',
    icon: '📚',
    sort: 7,
    children: [
      { name: '图书杂志', icon: '📖', sort: 1 },
      { name: '电子书', icon: '📱', sort: 2 },
      { name: '文具用品', icon: '✏️', sort: 3 },
    ],
  },
  {
    name: '运动健康',
    icon: '⚽',
    sort: 8,
    children: [
      { name: '健身器材', icon: '🏋️', sort: 1 },
      { name: '瑜伽舞蹈', icon: '🧘', sort: 2 },
      { name: '运动护具', icon: '🛡️', sort: 3 },
    ],
  },
];

/**
 * 商品种子数据
 */
interface ProductSeed {
  name: string;
  description: string;
  price: number;
  stock: number;
  coverImage: string;
  isFeatured: boolean;
  status: string;
  salesCount: number;
  viewCount: number;
  categoryName: string;
}

const PRODUCT_SEEDS: ProductSeed[] = [
  // ===== 手机数码 > 智能手机 =====
  {
    name: '华为 Mate 70 Pro 旗舰手机',
    description:
      '搭载麒麟9100芯片，6.9英寸OLED曲面屏，120Hz刷新率，5000mAh大电池，支持88W超级快充。徕卡四摄影像系统，支持卫星通信。',
    price: 6999.0,
    stock: 200,
    coverImage: '',
    isFeatured: true,
    status: 'on',
    salesCount: 15680,
    viewCount: 125000,
    categoryName: '智能手机',
  },
  {
    name: 'iPhone 16 Pro Max',
    description:
      'A18 Pro芯片，6.9英寸Super Retina XDR显示屏，钛金属边框，48MP主摄像头，支持Apple Intelligence智能功能。',
    price: 9999.0,
    stock: 150,
    coverImage: '',
    isFeatured: true,
    status: 'on',
    salesCount: 23400,
    viewCount: 189000,
    categoryName: '智能手机',
  },
  {
    name: '小米 15 Ultra 影像旗舰',
    description:
      '骁龙8 Gen4处理器，徕卡光学镜头，1英寸大底主摄，5000mAh电池+120W快充，IP68防水防尘。',
    price: 5999.0,
    stock: 300,
    coverImage: '',
    isFeatured: true,
    status: 'on',
    salesCount: 9800,
    viewCount: 87000,
    categoryName: '智能手机',
  },
  {
    name: 'OPPO Find X7 Pro',
    description:
      '天玑9400旗舰芯片，哈苏影像系统，双潜望长焦镜头，2K+分辨率的AMOLED屏幕。',
    price: 5499.0,
    stock: 180,
    coverImage: '',
    isFeatured: false,
    status: 'on',
    salesCount: 5600,
    viewCount: 45000,
    categoryName: '智能手机',
  },

  // ===== 电脑办公 > 笔记本 =====
  {
    name: 'MacBook Pro 16英寸 M4 Max',
    description:
      'Apple M4 Max芯片，32GB统一内存，1TB SSD，Liquid Retina XDR显示屏，18小时续航，轻薄专业创作本。',
    price: 19999.0,
    stock: 80,
    coverImage: '',
    isFeatured: true,
    status: 'on',
    salesCount: 4500,
    viewCount: 67000,
    categoryName: '笔记本',
  },
  {
    name: 'ThinkPad X1 Carbon Gen 12',
    description:
      '英特尔酷睿Ultra 7处理器，14英寸2.8K OLED屏幕，16GB内存+512GB SSD，碳纤维机身仅重1.08kg，商务旗舰轻薄本。',
    price: 10999.0,
    stock: 120,
    coverImage: '',
    isFeatured: false,
    status: 'on',
    salesCount: 3200,
    viewCount: 38000,
    categoryName: '笔记本',
  },
  {
    name: '华为 MateBook X Pro 2024',
    description:
      '14.2英寸3.1K OLED原色屏，酷睿Ultra 9处理器，32GB+1TB，超轻薄全金属机身，超级终端多设备协同。',
    price: 11999.0,
    stock: 100,
    coverImage: '',
    isFeatured: true,
    status: 'on',
    salesCount: 2800,
    viewCount: 42000,
    categoryName: '笔记本',
  },

  // ===== 服装鞋帽 > 女装 =====
  {
    name: '法式复古碎花连衣裙',
    description:
      '100%纯棉面料，复古碎花印花，方领泡泡袖设计，A字裙摆优雅大方，适合春夏日常穿搭。',
    price: 299.0,
    stock: 500,
    coverImage: '',
    isFeatured: true,
    status: 'on',
    salesCount: 12600,
    viewCount: 89000,
    categoryName: '女装',
  },
  {
    name: '韩版宽松针织开衫',
    description:
      '软糯针织面料，蝙蝠袖宽松版型，简约纯色设计，V领显瘦百搭，春秋外搭必备单品。',
    price: 189.0,
    stock: 600,
    coverImage: '',
    isFeatured: false,
    status: 'on',
    salesCount: 8700,
    viewCount: 56000,
    categoryName: '女装',
  },

  // ===== 服装鞋帽 > 男装 =====
  {
    name: '商务休闲免烫衬衫',
    description:
      '新疆长绒棉面料，DP免烫技术，立体剪裁修身版型，尖领设计，适合商务通勤穿着。',
    price: 259.0,
    stock: 400,
    coverImage: '',
    isFeatured: false,
    status: 'on',
    salesCount: 9800,
    viewCount: 65000,
    categoryName: '男装',
  },

  // ===== 食品饮料 > 休闲零食 =====
  {
    name: '三只松鼠每日坚果大礼包',
    description:
      '每日坚果混合装750g/30袋，含腰果、扁桃仁、核桃仁、蓝莓干、蔓越莓干等7种坚果果干，科学配比每日营养。',
    price: 139.0,
    stock: 1000,
    coverImage: '',
    isFeatured: true,
    status: 'on',
    salesCount: 56700,
    viewCount: 234000,
    categoryName: '休闲零食',
  },
  {
    name: '良品铺子牛肉干零食大礼包',
    description:
      '内蒙古风干牛肉干为主，搭配猪肉脯、鱿鱼丝、鸭脖等12种零食，整箱约1.2kg，追剧聚会必备。',
    price: 99.0,
    stock: 800,
    coverImage: '',
    isFeatured: false,
    status: 'on',
    salesCount: 34200,
    viewCount: 156000,
    categoryName: '休闲零食',
  },

  // ===== 食品饮料 > 饮料冲调 =====
  {
    name: '星巴克中度烘焙咖啡豆',
    description:
      '星巴克派克市场烘焙咖啡豆 1.13kg，中度烘焙，口感顺滑均衡，带有可可和坚果香气，适合滴滤/法压壶冲泡。',
    price: 198.0,
    stock: 350,
    coverImage: '',
    isFeatured: false,
    status: 'on',
    salesCount: 12000,
    viewCount: 78000,
    categoryName: '饮料冲调',
  },

  // ===== 家居用品 > 厨房用具 =====
  {
    name: '双立人不锈钢刀具套装',
    description:
      '德国双立人TWIN Pollux系列，7件套含中片刀、蔬菜刀、多用刀、剪刀、磨刀棒及刀架，冰锻工艺持久锋利。',
    price: 899.0,
    stock: 150,
    coverImage: '',
    isFeatured: true,
    status: 'on',
    salesCount: 5600,
    viewCount: 45000,
    categoryName: '厨房用具',
  },
  {
    name: '美的多功能电饭煲 IH加热',
    description:
      '4L大容量，IH立体电磁加热，精钢厚釜内胆，24小时预约，智能记忆烹饪习惯，煮粥煲汤蛋糕多功能。',
    price: 499.0,
    stock: 300,
    coverImage: '',
    isFeatured: false,
    status: 'on',
    salesCount: 18900,
    viewCount: 98000,
    categoryName: '厨房用具',
  },

  // ===== 美妆个护 > 面部护肤 =====
  {
    name: '兰蔻小黑瓶精华肌底液 50ml',
    description:
      '第二代小黑瓶，含二裂酵母精粹和益生元，修护肌肤屏障，改善粗糙暗沉，提升肌肤细腻光泽，适合所有肤质。',
    price: 1080.0,
    stock: 200,
    coverImage: '',
    isFeatured: true,
    status: 'on',
    salesCount: 23400,
    viewCount: 167000,
    categoryName: '面部护肤',
  },
  {
    name: '珀莱雅双抗精华液 2.0',
    description:
      '国产抗老精华标杆，双重抗氧抗糖，含虾青素、麦角硫因、肌肽成分，改善暗黄，紧致轮廓，适合25岁以上。',
    price: 259.0,
    stock: 500,
    coverImage: '',
    isFeatured: true,
    status: 'on',
    salesCount: 45000,
    viewCount: 289000,
    categoryName: '面部护肤',
  },

  // ===== 运动健康 > 健身器材 =====
  {
    name: 'Keep 智能动感单车 C1 Pro',
    description:
      'Keep智能调阻动感单车，静音磁控，AI虚拟陪练，APP课程同步，支持FTP骑行能力测试，居家健身必备。',
    price: 2999.0,
    stock: 100,
    coverImage: '',
    isFeatured: true,
    status: 'on',
    salesCount: 3400,
    viewCount: 45000,
    categoryName: '健身器材',
  },
  {
    name: '李宁专业竞速跑步鞋 超轻23',
    description:
      '超轻科技中底，全掌碳板支撑，MONO纱轻薄鞋面，回弹率超80%，适合半马/全马竞速跑步训练。',
    price: 599.0,
    stock: 400,
    coverImage: '',
    isFeatured: false,
    status: 'on',
    salesCount: 12000,
    viewCount: 78000,
    categoryName: '运动户外',
  },

  // ===== 图书文娱 > 图书杂志 =====
  {
    name: '《深入浅出Vue.js》技术书籍',
    description:
      '全面讲解Vue.js 3.x核心原理与实战，涵盖响应式系统、虚拟DOM、Diff算法、组合式API、Pinia状态管理等内容，适合前端进阶学习。',
    price: 79.0,
    stock: 600,
    coverImage: '',
    isFeatured: false,
    status: 'on',
    salesCount: 8900,
    viewCount: 56000,
    categoryName: '图书杂志',
  },
];

/**
 * 用户种子数据
 */
const USER_SEEDS = [
  {
    username: 'admin',
    password: 'admin123',
    email: 'admin@greenmall.com',
    phone: '13800000000',
    nickname: '系统管理员',
    role: Role.Admin,
  },
  {
    username: 'testuser',
    password: 'test123',
    email: 'test@greenmall.com',
    phone: '13800000001',
    nickname: '测试用户',
    role: Role.Customer,
  },
  {
    username: 'zhangsan',
    password: 'test123',
    email: 'zhangsan@example.com',
    phone: '13800000002',
    nickname: '张三',
    role: Role.Customer,
  },
];

async function seed() {
  logger.log('🌱 开始填充种子数据...\n');

  // ===== 1. 创建 NestJS 独立应用上下文 =====
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get<DataSource>(getDataSourceToken());
  const catRepo: TreeRepository<Category> = app.get('CategoryRepository');
  const productRepo: Repository<Product> = app.get('ProductRepository');
  const productImageRepo: Repository<ProductImage> = app.get('ProductImageRepository');
  const userRepo: Repository<User> = app.get('UserRepository');

  // ===== 2. 清空已有数据（禁用外键检查后整体清空，再恢复） =====
  logger.log('🗑️  清空已有数据...');
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  // 按依赖顺序清空：先删引用方再删被引用方
  await productImageRepo.clear();
  await catRepo.clear(); // 分类自引用由 FK 禁用保证安全
  await productRepo.clear();
  await userRepo.clear();
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

  // ===== 3. 创建分类（支持两级树形结构） =====
  logger.log('\n📁 创建商品分类...');
  const categoryMap = new Map<string, Category>();

  for (const cat of CATEGORY_SEEDS) {
    // 创建父分类
    const parent = catRepo.create({ name: cat.name, icon: cat.icon, sort: cat.sort, isActive: true });
    await catRepo.save(parent);
    categoryMap.set(parent.name, parent);
    logger.log(`  ├─ ${parent.icon} ${parent.name}`);

    // 创建子分类
    if (cat.children) {
      for (const child of cat.children) {
        const sub = catRepo.create({
          name: child.name,
          icon: child.icon,
          sort: child.sort,
          isActive: true,
          parent,
        });
        await catRepo.save(sub);
        categoryMap.set(sub.name, sub);
        logger.log(`  │  └─ ${sub.icon} ${sub.name}`);
      }
    }
  }

  // ===== 4. 创建用户 =====
  logger.log('\n👤 创建用户...');
  for (const userData of USER_SEEDS) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = userRepo.create({
      ...userData,
      password: hashedPassword,
      isActive: true,
    });
    await userRepo.save(user);
    logger.log(
      `  ├─ ${user.username} (${user.role === Role.Admin ? '管理员' : '普通用户'}) — 密码: ${userData.password}`,
    );
  }

  // ===== 5. 创建商品 =====
  logger.log('\n📦 创建商品...');
  let productCount = 0;

  for (const prodData of PRODUCT_SEEDS) {
    const category = categoryMap.get(prodData.categoryName);
    if (!category) {
      logger.warn(`  ⚠️  跳过商品 "${prodData.name}"：分类 "${prodData.categoryName}" 不存在`);
      continue;
    }

    const product = productRepo.create({
      name: prodData.name,
      description: prodData.description,
      price: prodData.price,
      stock: prodData.stock,
      coverImage: prodData.coverImage,
      status: prodData.status,
      isFeatured: prodData.isFeatured,
      salesCount: prodData.salesCount,
      viewCount: prodData.viewCount,
      category,
    });
    await productRepo.save(product);
    productCount++;

    // 如果提供了封面图，创建 ProductImage 记录
    if (prodData.coverImage) {
      const image = productImageRepo.create({
        url: prodData.coverImage,
        sort: 0,
        product,
      });
      await productImageRepo.save(image);
    }

    const featured = prodData.isFeatured ? '⭐' : '  ';
    logger.log(`  ${featured} [${category.name}] ${prodData.name} — ¥${prodData.price}`);
  }

  // ===== 6. 完成 =====
  logger.log(`\n✅ 种子数据填充完成！`);
  logger.log(`   分类: ${categoryMap.size} 个`);
  logger.log(`   用户: ${USER_SEEDS.length} 个`);
  logger.log(`   商品: ${productCount} 个`);
  logger.log(`\n📝 管理员账号: admin / admin123`);
  logger.log(`📝 测试用户账号: testuser / test123`);

  await app.close();
  process.exit(0);
}

seed().catch((err) => {
  logger.error('❌ 种子数据填充失败:', err);
  process.exit(1);
});
