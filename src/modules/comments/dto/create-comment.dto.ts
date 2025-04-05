import { IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCommentDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    username?: string

    @ApiProperty()
    @IsString()
    @MaxLength(255)
    text: string;

    @ApiProperty()
    @IsUUID()
    @IsOptional()
    wordId?: string;
}