import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateCommentDto } from "../dto/create-comment.dto";

export function ApplyDocsForCreateComment() {
    return applyDecorators(
        ApiOperation({ summary: 'Create a comment' }),
        ApiBody({ type: CreateCommentDto, required: true }),
        ApiResponse({ status: 200, description: 'Comment created successfully' }),
        ApiResponse({ status: 400, description: 'Bad Request' })
    )
}

export function ApplyDocsForGetComments() {
    return applyDecorators(
        ApiOperation({ summary: 'Get comments' }),
        ApiResponse({ type: CreateCommentDto, status: 200, description: 'Comments retrieved successfully' }),
        ApiResponse({ status: 400, description: 'Bad Request' })
    )
}

export function ApplyDocsForDeleteComment() {
    return applyDecorators(
        ApiOperation({ summary: 'Delete a comment' }),
        ApiResponse({ status: 200, description: 'Comment deleted successfully' }),
        ApiResponse({ status: 400, description: 'Bad Request' })
    )
}

