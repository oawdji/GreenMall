import { IsString, IsOptional, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';

/**
 * 注册请求 DTO
 */
export class RegisterDto {
  @IsString()
  @MinLength(3, { message: '用户名至少3个字符' })
  @MaxLength(20, { message: '用户名最多20个字符' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '用户名只能包含字母、数字和下划线' })
  username: string;

  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  @MaxLength(30, { message: '密码最多30个字符' })
  password: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: '手机号最多20个字符' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '昵称最多50个字符' })
  nickname?: string;
}
