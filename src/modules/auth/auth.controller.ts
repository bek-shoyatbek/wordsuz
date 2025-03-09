import { AuthService } from "./auth.service";
import { Controller, Post, Body } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LoginDto, RegisterDto, VerifyDto } from "./dto/request";
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
        await this.authService.register(body.email, body.password);
        return { message: 'User registered successfully', data: { email: body.email } };
    }

    @ApiOperation({ summary: 'Verify confirmation code' })
    @ApiBody({ type: VerifyDto, required: true })
    @ApiResponse({ status: 200, description: 'Confirmation code verified successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @Post('verify')
    async verify(@Body() body: VerifyDto): Promise<BaseResponse<{ email: string, accessToken: string }>> {
        const { email, accessToken } = await this.authService.verify(body.confirmationCode);
        return { message: 'Confirmation code verified successfully', data: { email, accessToken } };
    }

    @ApiOperation({ summary: 'Login a user' })
    @ApiBody({ type: LoginDto, required: true })
    @ApiResponse({ status: 200, description: 'User logged in successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @Post('login')
    async login(@Body() body: LoginDto): Promise<BaseResponse<{ email: string, accessToken: string }>> {
        const { email, accessToken } = await this.authService.login(body.email, body.password);
        return { message: 'User logged in successfully', data: { email, accessToken } };
    }
}