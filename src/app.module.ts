import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DictionaryModule } from './dictionary/dictionary.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [DictionaryModule, HttpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
