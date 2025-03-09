import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
    @ApiProperty({ description: 'The email of the user', example: 'test@test.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'The password of the user', example: 'password' })
    @IsNotEmpty()
    @IsString()
    password: string;
}
