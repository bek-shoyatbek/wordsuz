import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from 'express';
import { JwtPayload } from "../types";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Access token is missing');
        }

        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(
                token,
                {
                    secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')
                }
            );

            request['user'] = {
                id: payload.id,
                email: payload.email,
            };

            return true;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Access token has expired');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Invalid access token');
            }
            throw new UnauthorizedException('Authentication failed');
        }
    }

    private extractTokenFromHeader(request: Request): string | null {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            return null;
        }

        const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
        const [type, token] = headerValue.split(' ');

        if (type !== 'Bearer') {
            return null;
        }

        return token;
    }
}
