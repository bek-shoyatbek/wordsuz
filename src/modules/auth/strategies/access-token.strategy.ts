import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload, UserRole } from "../types";
import { UsersService } from "src/modules/users/users.service";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt-access') {
    constructor(
      private readonly configService: ConfigService,
      private readonly userService: UsersService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
            ignoreExpiration: false,
        });
    }

    async validate(payload: JwtPayload) {
        if (payload.id === 'admin' && payload.role === UserRole.Admin) {
            return {
                id: 'admin',
                email: payload.email,
                role: payload.role
            };
        }

        const user = await this.userService.findOne(payload.id);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            role: payload.role || UserRole.User
        };
    }
}