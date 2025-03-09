import { EjsAdapter } from "@nestjs-modules/mailer/dist/adapters/ejs.adapter";
import { MailerAsyncOptions } from "@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface";
import { ConfigService } from "@nestjs/config";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";


export const MAIL_OPTIONS: MailerAsyncOptions = {
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
        transport: {
            host: configService.get('SMTP_HOST'),
            port: configService.get('SMTP_PORT'),
            auth: {
                user: configService.get('SMTP_LOGIN'),
                pass: configService.get('SMTP_KEY'),
            },
            defaults: {
                from: configService.get('SMTP_FROM'),
            },
            tls: {
                rejectUnauthorized: false,
            },
            secure: false,
        },
        template: {
            dir: join(process.cwd(), 'assets', 'templates'),
            adapter: new EjsAdapter(),
            options: {
                strict: true,
            },
        },
    }),
    inject: [ConfigService],
}