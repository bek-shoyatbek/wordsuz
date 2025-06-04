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
import { BookmarksService } from './bookmarks.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  ApplyDocsForCreateBookmark,
  ApplyDocsForDeleteBookmark,
  ApplyDocsForGetBookmarks,
} from './decorators';
import { RequestWithUser } from "../../shared/types/request-with-user.type";

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @UseGuards(AuthGuard)
  @ApplyDocsForGetBookmarks()
  @Get()
  async getBookmarks(@Req() req: RequestWithUser) {
    const userId = req.user.id;

    return this.bookmarksService.getBookmarks(userId);
  }

  @UseGuards(AuthGuard)
  @ApplyDocsForCreateBookmark()
  @Post(':wordId')
  async createBookmark(
    @Req() req: RequestWithUser,
    @Param('wordId', new ParseUUIDPipe({ version: '4' })) wordId: string,
  ) {
    const userId = req.user.id;
    return this.bookmarksService.createBookmark(userId, wordId);
  }

  @UseGuards(AuthGuard)
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
