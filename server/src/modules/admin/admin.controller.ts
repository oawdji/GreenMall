import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles, Role } from '../../common/roles.decorator';

/**
 * 管理端仪表盘控制器
 */
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 仪表盘数据
   * GET /api/admin/dashboard
   */
  @Get('dashboard')
  async dashboard() {
    return this.adminService.dashboard();
  }
}
