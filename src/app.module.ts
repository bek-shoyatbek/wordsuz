import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PexelsModule } from './modules/pexels/pexels.module';
import { WordModule } from './modules/words/words.module';
import { TranslatorsModule } from './modules/translators/translators.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CacheModule } from '@nestjs/cache-manager';
import { CACHE_TTL } from './shared/constants';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: CACHE_TTL,
    }),
    PexelsModule,
    WordModule,
    TranslatorsModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'frontend'),
      exclude: ['api/*'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
