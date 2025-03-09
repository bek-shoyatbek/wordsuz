import { Injectable, BadRequestException, Inject } from "@nestjs/common";
import { MailService } from "../mail/mail.service";
import { CACHE_TTL } from "src/shared/configs";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { CONFIRMATION_TEMPLATE } from "src/shared/constants";
import { getVerificationCode } from "src/shared/utils/generators";

@Injectable()
export class AuthService {
    constructor(private readonly mailService: MailService, @Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async sendConfirmationEmail(email: string) {
        const code = getVerificationCode();

        await this.cacheManager.set(code, email, CACHE_TTL);

        return await this.mailService.sendTemplateMail(
            email,
            'Tasdiqlash kodini kiriting',
            CONFIRMATION_TEMPLATE,
            { email, confirmationCode: code }
        );
    }

    async verifyConfirmationCode(code: string): Promise<string> {
        const email = await this.cacheManager.get<string | null>(code);
        if (!email) {
            throw new BadRequestException('Invalid confirmation code');
        }
        await this.cacheManager.del(code);
        return email;
    }
}
