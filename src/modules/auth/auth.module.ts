import { Module } from "@nestjs/common";

import { MailModule } from "../mail/mail.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { JWT_OPTIONS } from "src/shared/configs";

@Module({
    imports: [MailModule, UsersModule,
        JwtModule.registerAsync(JWT_OPTIONS)
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }
