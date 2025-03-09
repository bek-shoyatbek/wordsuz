import { Injectable, BadRequestException, Inject } from "@nestjs/common";
import { MailService } from "../mail/mail.service";
import { CACHE_TTL } from "src/shared/configs";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { CONFIRMATION_TEMPLATE } from "src/shared/constants";
import { getVerificationCode } from "src/shared/utils/generators";
import { hashPassword, comparePassword } from "src/shared/utils/hash";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "./types";

@Injectable()
export class AuthService {
    constructor(
        private readonly mailService: MailService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly userService: UsersService,
        private readonly jwtService: JwtService
    ) { }

    async register(email: string, password: string) {
        const user = await this.userService.findByEmail(email);
        if (user) {
            throw new BadRequestException('User already exists');
        }
        const code = getVerificationCode();
        const hashedPassword = await hashPassword(password);
        const newUser = {
            email,
            password: hashedPassword
        };

        await this.cacheManager.set(code, JSON.stringify(newUser), CACHE_TTL);

        return await this.mailService.sendTemplateMail(
            email,
            'Tasdiqlash kodini kiriting',
            CONFIRMATION_TEMPLATE,
            { email, confirmationCode: code }
        );
    }

    async verify(code: string): Promise<{ email: string, accessToken: string }> {
        const userCredentials = await this.cacheManager.get<string | null>(code);
        if (!userCredentials) {
            throw new BadRequestException('Invalid confirmation code');
        }
        await this.cacheManager.del(code);

        const user = JSON.parse(userCredentials);
        await this.userService.createUser(user.email, user.password);
        const payload: JwtPayload = {
            email: user.email,
            id: user.id
        };
        const token = await this.generateToken(payload);

        return { email: user.email, accessToken: token };
    }

    async login(email: string, password: string): Promise<{ email: string, accessToken: string }> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid password');
        }
        const payload: JwtPayload = {
            email: user.email,
            id: user.id
        };
        const token = await this.generateToken(payload);
        return { email: user.email, accessToken: token };
    }

    private async generateToken(payload: JwtPayload) {
        return this.jwtService.sign(payload);
    }

    private async verifyToken(token: string) {
        return this.jwtService.verify(token);
    }
}
