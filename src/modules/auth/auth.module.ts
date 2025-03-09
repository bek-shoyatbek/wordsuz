import { Module } from "@nestjs/common";

import { MailModule } from "../mail/mail.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
@Module({
    imports: [MailModule, UsersModule],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule { }
