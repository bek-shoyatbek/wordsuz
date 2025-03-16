import { JwtModuleAsyncOptions } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";


export const JWT_OPTIONS: JwtModuleAsyncOptions = {
    global: true,
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
    }),
    inject: [ConfigService],
}