import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/shared/database/database.service';

@Injectable()
export class BookmarksService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getBookmarks(userId: string) {
    return this.databaseService.bookmark.findMany({
      where: { userId },
      include: {
        Word: {
          select: {
            titleUz: true,
          },
        },
      },
    });
  }

  async createBookmark(userId: string, wordId: string) {
    return this.databaseService.bookmark.create({ data: { userId, wordId } });
  }

  async deleteBookmark(userId: string, wordId: string) {
    const bookmark = await this.databaseService.bookmark.findFirst({
      where: { userId, wordId },
    });
    if (!bookmark) return null;
    return this.databaseService.bookmark.delete({ where: { id: bookmark.id } });
  }
}
