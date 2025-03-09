import { Injectable, BadRequestException, Inject } from "@nestjs/common";
import { MailService } from "../mail/mail.service";
import { CACHE_TTL } from "src/shared/configs";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { CONFIRMATION_TEMPLATE } from "src/shared/constants";
import { getVerificationCode } from "src/shared/utils/generators";
import { hashPassword, comparePassword } from "src/shared/utils/hash";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly mailService: MailService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly userService: UsersService
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

    async verify(code: string): Promise<string> {
        const userCredentials = await this.cacheManager.get<string | null>(code);
        if (!userCredentials) {
            throw new BadRequestException('Invalid confirmation code');
        }
        await this.cacheManager.del(code);

        const user = JSON.parse(userCredentials);
        await this.userService.createUser(user.email, user.password);
        return user.email;
    }

    async login(email: string, password: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid password');
        }
        return user;
    }
}
