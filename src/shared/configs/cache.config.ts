import { CacheModuleAsyncOptions } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import { ConfigModule } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-store";

export const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export const REDIS_OPTIONS: CacheModuleAsyncOptions = {
    imports: [ConfigModule],
    isGlobal: true,
    useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
            socket: {
                host: configService.get('REDIS_HOST'),
                port: configService.get('REDIS_PORT'),
            },
            // password: configService.get('REDIS_PASSWORD'),
        })
        return {
            store: () => store,
            ttl: CACHE_TTL,
        }
    },
    inject: [ConfigService],
}