import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PexelsModule } from './pexels/pexels.module';
import { WordModule } from './word/word.module';
import { TranslatorModule } from './translator/translator.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PexelsModule,
    WordModule,
    TranslatorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
