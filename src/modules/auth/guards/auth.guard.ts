import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            request['user'] = payload;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    private extractTokenFromHeader(request: Request): string | null {
        const authHeader =
            request.headers.authorization ||
            request.header('Authorization') ||
            request.headers['Authorization'];

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
