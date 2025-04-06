import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";


export function ApplyDocsForCreateBookmark() {
    return applyDecorators(
        ApiOperation({ summary: 'Create a bookmark' }),
        ApiBearerAuth(),
        ApiParam({ name: 'wordId', required: true, type: 'string', format: 'uuid' }),
        ApiResponse({ status: 200, description: 'Bookmark created successfully' }),
        ApiResponse({ status: 400, description: 'Bad Request' })
    )
}

export function ApplyDocsForDeleteBookmark() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Delete a bookmark' }),
        ApiParam({ name: 'wordId', required: true, type: 'string', format: 'uuid' }),
        ApiResponse({ status: 200, description: 'Bookmark deleted successfully' }),
        ApiResponse({ status: 400, description: 'Bad Request' })
    )
}

export function ApplyDocsForGetBookmarks() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Get bookmarks' }),
        ApiResponse({ status: 200, description: 'Bookmarks retrieved successfully' }),
        ApiResponse({ status: 400, description: 'Bad Request' })
    )
}
