import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger'; // Add this import
import { BookmarksService } from './bookmarks.service';
import {
  ApplyDocsForCreateBookmark,
  ApplyDocsForDeleteBookmark,
  ApplyDocsForGetBookmarks,
} from './decorators';
import { RequestWithUser } from "../../shared/types/request-with-user.type";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../auth/types";
import { AuthGuard } from "@nestjs/passport";

@ApiTags('Bookmarks') // Add this decorator
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @UseGuards(AuthGuard('jwt-access'), RolesGuard)
  @Roles(UserRole.User)
  @ApplyDocsForGetBookmarks()
  @Get()
  async getBookmarks(@Req() req: RequestWithUser) {
    const userId = req.user.id;

    return this.bookmarksService.getBookmarks(userId);
  }

  @UseGuards(AuthGuard('jwt-access'), RolesGuard)
  @Roles(UserRole.User)
  @ApplyDocsForCreateBookmark()
  @Post(':wordId')
  async createBookmark(
    @Req() req: RequestWithUser,
    @Param('wordId', new ParseUUIDPipe({ version: '4' })) wordId: string,
  ) {
    const userId = req.user.id;
    return this.bookmarksService.createBookmark(userId, wordId);
  }

  @UseGuards(AuthGuard('jwt-access'), RolesGuard)
  @Roles(UserRole.User)
  @ApplyDocsForDeleteBookmark()
  @Delete(':wordId')
  async deleteBookmark(
    @Req() req: RequestWithUser,
    @Param('wordId', new ParseUUIDPipe({ version: '4' })) wordId: string,
  ) {
    const userId = req.user.id;
    return this.bookmarksService.deleteBookmark(userId, wordId);
  }
}