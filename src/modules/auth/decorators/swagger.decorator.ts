import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { LoginDto, RegisterDto, VerifyDto } from "../dto";

export function ApplyDocsForRegister() {
    return applyDecorators(
        ApiOperation({ summary: 'Register a user' }),
        ApiBody({ type: RegisterDto, required: true }),
        ApiResponse({ status: 200, description: 'User registered successfully' }),
        ApiResponse({ status: 400, description: 'Bad Request' })
    )
}

export function ApplyDocsForVerify() {
    return applyDecorators(
        ApiOperation({ summary: 'Verify confirmation code' }),
        ApiBody({ type: VerifyDto, required: true }),
        ApiResponse({ status: 200, description: 'Confirmation code verified successfully' }),
        ApiResponse({ status: 400, description: 'Bad Request' })
    )
}

export function ApplyDocsForLogin() {
    return applyDecorators(
        ApiOperation({ summary: 'Login a user' }),
        ApiBody({ type: LoginDto, required: true }),
        ApiResponse({ status: 200, description: 'User logged in successfully' }),
        ApiResponse({ status: 400, description: 'Bad Request' })
    )
}

export function ApplyDocsForCurrentUser() {
    return applyDecorators(
        ApiOperation({ summary: 'Get current user' }),
        ApiBearerAuth(),
        ApiResponse({
            status: 200,
            description: 'Current user retrieved successfully',
            schema: {
                example: {
                    message: 'Current user retrieved successfully',
                    data: { email: 'user@example.com' }
                }
            }
        }),
        ApiResponse({
            status: 401,
            description: 'Unauthorized',
            schema: {
                example: {
                    message: 'Unauthorized',
                    error: 'No token provided'
                }
            }
        })
    )
}