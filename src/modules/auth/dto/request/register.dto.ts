import { IsNotEmpty, IsString, MinLength, MaxLength, IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class RegisterDto {
    @ApiProperty({ description: 'The email of the user', example: 'test@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'The password of the user', example: '12345678' })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(32)
    password: string;
}   