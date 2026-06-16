import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto) {
    const { username, password, email, phone, nickname } = registerDto;

    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 密码哈希
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      email,
      phone,
      nickname,
    });

    await this.userRepository.save(user);

    // 生成 token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 查找用户（包含密码字段用于验证）
    const user = await this.userRepository.findOne({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        email: true,
        phone: true,
        nickname: true,
        avatar: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查账号是否启用
    if (!user.isActive) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成 token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * 生成 JWT Token
   */
  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  /**
   * 移除密码等敏感字段后返回用户信息
   */
  private sanitizeUser(user: User) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
