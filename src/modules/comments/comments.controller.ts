import { Controller, Post, Body, Get } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { BaseResponse } from 'src/shared/types';
import { ApplyDocsForCreateComment, ApplyDocsForGetComments } from './decorators';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @ApplyDocsForCreateComment()
  @Post()
  async create(@Body() body: CreateCommentDto): Promise<BaseResponse<{ id: string }>> {
    const comment = await this.commentsService.create(body);
    return { message: 'Comment created successfully', data: { id: comment.id } };
  }

  @ApplyDocsForGetComments()
  @Get()
  async findAll(): Promise<BaseResponse<CreateCommentDto[]>> {
    const comments = await this.commentsService.findAll();
    return { message: 'Comments retrieved successfully', data: comments };
  } 
}
