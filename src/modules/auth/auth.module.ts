import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT_OPTIONS } from 'src/shared/configs';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    MailModule,
    UsersModule,
    JwtModule.registerAsync(JWT_OPTIONS),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AuthGuard,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
