import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DictionaryModule } from './dictionary/dictionary.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TranslatorModule } from './translator/translator.module';

@Module({
  imports: [
    DictionaryModule,
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TranslatorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
