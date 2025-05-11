import { IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateVerbFormDto {
  @IsOptional() @IsString() tense?: string;
  @IsOptional() @IsObject() content?: object; // You can use a stricter schema if needed
}
