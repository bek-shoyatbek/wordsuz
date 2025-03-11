import { AuthService } from "./auth.service";
import { Controller, Post, Body, Get, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { LoginDto, RegisterDto, VerifyDto } from "./dto/request";
import { BaseResponse } from "src/shared/types";
import { AuthGuard } from "./guards/auth.guard";
import { ApplyDocsForCurrentUser, ApplyDocsForLogin, ApplyDocsForRefreshToken, ApplyDocsForRegister, ApplyDocsForVerify } from "./decorators";
import { RefreshTokenDto } from "./dto/request/refresh-token.dto";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @ApplyDocsForRegister()
    @Post('register')
    async register(@Body() body: RegisterDto): Promise<BaseResponse<{ email: string }>> {
        await this.authService.register(body.email, body.password);
        return { message: 'User registered successfully', data: { email: body.email } };
    }

    @ApplyDocsForVerify()
    @Post('verify')
    async verify(@Body() body: VerifyDto): Promise<BaseResponse<{ email: string, accessToken: string }>> {
        const { email, accessToken } = await this.authService.verify(body.confirmationCode);
        return { message: 'Confirmation code verified successfully', data: { email, accessToken } };
    }

    @ApplyDocsForLogin()
    @Post('login')
    async login(@Body() body: LoginDto): Promise<BaseResponse<{ email: string, accessToken: string, refreshToken: string }>> {
        const { email, accessToken, refreshToken } = await this.authService.login(body.email, body.password);
        return { message: 'User logged in successfully', data: { email, accessToken, refreshToken } };
    }

    @ApplyDocsForRefreshToken()
    @Post('refresh-token')
    async refreshToken(@Body() body: RefreshTokenDto): Promise<BaseResponse<{ accessToken: string }>> {
        const { accessToken } = await this.authService.refreshToken(body.refreshToken);
        return { message: 'Refresh token refreshed successfully', data: { accessToken } };
    }

    @ApplyDocsForCurrentUser()
    @UseGuards(AuthGuard)
    @Get('current')
    async current(@Req() req: Request): Promise<BaseResponse<{ email: string }>> {
        const user = req['user'];
        return { message: 'Current user retrieved successfully', data: { email: user.email } };
    }
}
