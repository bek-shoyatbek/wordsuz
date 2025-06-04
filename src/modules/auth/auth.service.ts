// auth.service.ts - Fixed version
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { CACHE_TTL } from 'src/shared/configs';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CONFIRMATION_TEMPLATE } from 'src/shared/constants';
import { getVerificationCode } from 'src/shared/utils/generators';
import { comparePassword, hashPassword } from 'src/shared/utils/hash';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, UserRole } from './types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async loginAsAdmin(email: string, password: string) {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    const isAdmin = email === adminEmail && password === adminPassword;
    if (!isAdmin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const adminPayload: JwtPayload = {
      email,
      role: UserRole.Admin,
      id: 'admin',
    };

    return {
      email,
      accessToken: await this.jwtService.signAsync(
        {
          sub: adminPayload.email, // Use 'sub' consistently
          role: adminPayload.role,
          id: adminPayload.id,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'), // Use same secret as regular users
          expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
        },
      ),
    };
  }

  async register(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (user) {
      throw new BadRequestException('User already exists');
    }

    const code = getVerificationCode();
    const hashedPassword = await hashPassword(password);
    const newUser = { email, password: hashedPassword };

    const cacheKey = `verification:${code}`;
    await this.cacheManager.set(cacheKey, JSON.stringify(newUser), CACHE_TTL);

    return await this.mailService.sendTemplateMail(
      email,
      'Tasdiqlash kodini kiriting',
      CONFIRMATION_TEMPLATE,
      { email, confirmationCode: code },
    );
  }

  async verify(code: string) {
    const cacheKey = `verification:${code}`;
    const userCredentials = await this.cacheManager.get<string>(cacheKey);

    if (!userCredentials) {
      throw new BadRequestException('Invalid or expired confirmation code');
    }

    await this.cacheManager.del(cacheKey);
    const userData = JSON.parse(userCredentials);

    const user = await this.userService.createUser(
      userData.email,
      userData.password,
    );
    const tokens = await this.getTokens({
      email: user.email,
      role: UserRole.User,
      id: user.id,
    });

    return {
      email: user.email,
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens({
      email: user.email,
      role: UserRole.User,
      id: user.id,
    });
    return {
      email: user.email,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    const decoded = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
    });
    if (!decoded) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userService.findByEmail(decoded.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.getTokens({
      email: user.email,
      role: UserRole.User,
      id: user.id,
    });
    return tokens;
  }

  private async getTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.getAccessToken(payload),
      this.getRefreshToken(payload),
    ]);

    return { accessToken, refreshToken };
  }

  private async getAccessToken(payload: JwtPayload) {
    return this.jwtService.signAsync(
      {
        sub: payload.email,
        role: payload.role,
        id: payload.id,
      },
      {
        expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      },
    );
  }

  private async getRefreshToken(payload: JwtPayload) {
    return this.jwtService.signAsync(
      {
        sub: payload.email,
        role: payload.role,
        id: payload.id,
      },
      {
        expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN'),
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      },
    );
  }
}