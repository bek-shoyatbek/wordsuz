import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PexelsModule } from './pexels/pexels.module';
import { WordModule } from './word/word.module';
import { TranslatorModule } from './translator/translator.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PexelsModule,
    WordModule,
    TranslatorModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'frontend'),
      exclude: ['api/*'],
    })
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule { }
