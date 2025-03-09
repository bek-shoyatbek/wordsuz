import { AuthService } from "./auth.service";
import { Controller, Post, Body } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RegisterDto, VerifyDto } from "./dto/request";
import { BaseResponse } from "src/shared/types";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: RegisterDto, required: true })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @Post('register')
    async register(@Body() body: RegisterDto): Promise<BaseResponse<{ email: string }>> {
        await this.authService.sendConfirmationEmail(body.email);
        return { message: 'User registered successfully', data: { email: body.email }, status: 201 };
    }

    @ApiOperation({ summary: 'Verify confirmation code' })
    @ApiBody({ type: VerifyDto, required: true })
    @ApiResponse({ status: 200, description: 'Confirmation code verified successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @Post('verify')
    async verify(@Body() body: VerifyDto): Promise<BaseResponse<{ email: string }>> {
        const email = await this.authService.verifyConfirmationCode(body.code);
        return { message: 'Confirmation code verified successfully', data: { email }, status: 200 };
    }
}