import { SetMetadata } from '@nestjs/common';

/**
 * 角色枚举
 */
export enum Role {
  Customer = 'customer',
  Admin = 'admin',
}

export const ROLES_KEY = 'roles';

/**
 * 角色权限装饰器
 *
 * 用法:
 * @Roles(Role.Admin)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async someAdminMethod() { ... }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
