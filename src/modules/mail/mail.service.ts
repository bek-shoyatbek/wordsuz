import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from 'fs/promises';
import * as ejs from 'ejs';
import { join } from 'path';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService, private readonly configService: ConfigService) { }

    async sendMail(to: string, subject: string, text: string) {
        await this.mailerService.sendMail({
            to, subject, text
        })
    }

    async sendTemplateMail(to: string, subject: string, template: string, context: object) {
        const htmlTemplate = await fs.readFile(join(process.cwd(), 'assets', 'templates', `${template}.ejs`), 'utf8');
        return await this.mailerService.sendMail({
            from: this.configService.get('SMTP_FROM'),
            to, subject, html: ejs.render(htmlTemplate, context)
        })
    }
}