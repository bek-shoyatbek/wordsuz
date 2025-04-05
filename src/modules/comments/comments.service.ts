import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { DatabaseService } from 'src/shared/database/database.service';

@Injectable()
export class CommentsService {
    constructor(private readonly databaseService: DatabaseService) { }
    async create(createCommentDto: CreateCommentDto) {
        const { username, text, wordId } = createCommentDto;
        const comment = await this.databaseService.comment.create({
            data: {
                username: username || new Date().toISOString(),
                text,
                wordId: wordId || null
            }
        });
        return { id: comment.id };
    }

    async findAll() {
        return await this.databaseService.comment.findMany();
    }
}
