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
import { REDIS_OPTIONS, MAIL_OPTIONS } from './shared/configs';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthModule } from './modules/auth/auth.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { CommentsModule } from './modules/comments/comments.module';
import { BookmarksModule } from "./modules/bookmarks/bookmarks.module";

@Module({
  imports: [
    AuthModule,
    HttpModule,
    TemplatesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync(REDIS_OPTIONS),
    MailerModule.forRootAsync(MAIL_OPTIONS),
    PexelsModule,
    WordModule,
    TranslatorsModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'frontend'),
      exclude: ['api/*'],
    }),
    CommentsModule,
    BookmarksModule
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule { }
