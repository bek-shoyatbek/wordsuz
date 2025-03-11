import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../types";
import { UsersService } from "src/modules/users/users.service";
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UsersService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
            passReqToCallback: true,
            ignoreExpiration: false,
        });
    }

    async validate(req: Request, payload: JwtPayload) {
        const refreshToken = this.extractTokenFromHeader(req);
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }
        const user = await this.userService.findOne(payload.id);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            refreshToken
        };
    }

    private extractTokenFromHeader(req: Request): string | null {
        const [type, token] = req.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : null;
    }
}