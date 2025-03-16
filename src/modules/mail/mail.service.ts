import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TemplatesService } from "../templates/templates.service";

@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
        private readonly templatesService: TemplatesService
    ) { }

    async sendMail(to: string, subject: string, text: string) {
        await this.mailerService.sendMail({
            to, subject, text
        })
    }

    async sendTemplateMail(to: string, subject: string, template: string, context: object) {
        const html = await this.templatesService.getCompiledTemplate(template, context);

        return await this.mailerService.sendMail({
            from: this.configService.get('SMTP_FROM'),
            to, subject, html
        })
    }
}