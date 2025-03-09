import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyDto {
    @ApiProperty({ description: 'The confirmation code', example: '123456' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(6)
    code: string;
}   