/**
 * 统一 API 响应格式
 * 对应后端 TransformInterceptor 包装
 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

/**
 * 分页响应
 */
export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * 分页 API 响应
 */
export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>

/**
 * 登录/注册请求
 */
export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email?: string
  phone?: string
  nickname?: string
}

/**
 * 用户信息（从后端返回的 safe user）
 */
export interface User {
  id: number
  username: string
  email: string | null
  phone: string | null
  nickname: string | null
  avatar: string | null
  role: 'customer' | 'admin'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 认证响应
 */
export interface AuthData {
  user: User
  token: string
}

/**
 * 通用分页查询参数
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
}

// ========== 商品分类 ==========

export interface Category {
  id: number
  name: string
  icon: string | null
  image: string | null
  sort: number
  isActive: boolean
  description: string | null
  parent: Category | null
  children: Category[] | null
  createdAt: string
  updatedAt: string
}

// ========== 商品 ==========

export interface ProductImage {
  id: number
  url: string
  sort: number
}

export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  stock: number
  coverImage: string | null
  status: 'draft' | 'on' | 'off'
  isFeatured: boolean
  salesCount: number
  viewCount: number
  category: Category | null
  images: ProductImage[]
  createdAt: string
  updatedAt: string
}

/** 商品列表项（可能不含完整 images） */
export type ProductListItem = Pick<
  Product,
  'id' | 'name' | 'price' | 'stock' | 'coverImage' | 'status' | 'salesCount'
> & {
  category: Pick<Category, 'id' | 'name'> | null
}

/** 商品查询参数 */
export interface ProductQueryParams extends PaginationParams {
  keyword?: string
  categoryId?: number
  sortBy?: 'price' | 'salesCount' | 'createdAt'
  sortOrder?: 'ASC' | 'DESC'
}

/** 后端实际用 limit 而非 pageSize，适配一下 */
export interface ProductApiParams {
  keyword?: string
  categoryId?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  page?: number
  limit?: number
}

// ========== 购物车 ==========

export interface CartItem {
  id: number
  quantity: number
  selected: boolean
  product: ProductListItem
  createdAt: string
}

// ========== 订单 ==========

export interface OrderItem {
  id: number
  productName: string
  productImage: string | null
  price: number
  quantity: number
  amount: number
  product: { id: number; name: string; coverImage: string | null } | null
}

export type OrderStatus = 'pending_payment' | 'paid' | 'shipped' | 'completed' | 'cancelled'

export interface Order {
  id: number
  orderNo: string
  status: OrderStatus
  totalAmount: number
  freight: number
  couponDiscount: number
  payAmount: number
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  remark: string | null
  user?: User
  orderItems: OrderItem[]
  createdAt: string
  updatedAt: string
}

export const OrderStatusMap: Record<OrderStatus, string> = {
  pending_payment: '待付款',
  paid: '待发货',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
}

export const OrderStatusColorMap: Record<OrderStatus, string> = {
  pending_payment: 'text-orange-600 bg-orange-50',
  paid: 'text-blue-600 bg-blue-50',
  shipped: 'text-purple-600 bg-purple-50',
  completed: 'text-green-600 bg-green-50',
  cancelled: 'text-gray-500 bg-gray-100',
}

// ========== 优惠券 ==========

export type CouponType = 'fixed' | 'percent'

export interface Coupon {
  id: number
  name: string
  type: CouponType
  minAmount: number
  discountValue: number
  maxDiscount: number | null
  totalQuantity: number
  remainingQuantity: number
  perUserLimit: number
  startDate: string | null
  endDate: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type UserCouponStatus = 'unused' | 'used' | 'expired'

export interface UserCoupon {
  id: number
  status: UserCouponStatus
  usedAt: string | null
  coupon: Coupon
  createdAt: string
}

export const UserCouponStatusMap: Record<UserCouponStatus, string> = {
  unused: '未使用',
  used: '已使用',
  expired: '已过期',
}

// ========== 评价 ==========

export interface Review {
  id: number
  rating: number
  content: string | null
  images: string[] | null
  user: Pick<User, 'id' | 'username' | 'nickname' | 'avatar'>
  product: { id: number; name: string }
  createdAt: string
}

// ========== 收货地址（前端本地暂用，等后端实现后对接） ==========

export interface Address {
  id: number
  receiverName: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

// ========== 管理端仪表盘 ==========

export interface DashboardData {
  stats: {
    totalProducts: number
    totalOrders: number
    totalUsers: number
    todayRevenue: number
  }
  recentOrders: Order[]
}

// ========== 管理端商品创建/更新 ==========

export interface CreateProductData {
  name: string
  description?: string
  price: number
  stock: number
  coverImage?: string
  categoryId?: number
  isFeatured?: boolean
  status?: 'draft' | 'on' | 'off'
}

export interface UpdateProductData extends Partial<CreateProductData> {}

// ========== 管理端分类创建/更新 ==========

export interface CreateCategoryData {
  name: string
  icon?: string
  image?: string
  sort?: number
  isActive?: boolean
  description?: string
  parentId?: number | null
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

// ========== 管理端优惠券创建/更新 ==========

export interface CreateCouponData {
  name: string
  type: CouponType
  minAmount: number
  discountValue: number
  maxDiscount?: number
  totalQuantity: number
  perUserLimit?: number
  startDate?: string
  endDate?: string
  isActive?: boolean
}

export interface UpdateCouponData extends Partial<CreateCouponData> {}
