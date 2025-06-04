import { Module } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { DatabaseModule } from 'src/shared/database/database.module';
import { AuthModule } from "../auth/auth.module";
import { RolesGuard } from "../auth/guards/roles.guard";

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [BookmarksController],
  providers: [BookmarksService, RolesGuard],
})
export class BookmarksModule { }
