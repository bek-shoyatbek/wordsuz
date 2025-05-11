import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class CreateVerbFormDto {
  @IsString()
  @IsNotEmpty()
  tense: string;

  @IsObject()
  @IsNotEmpty()
  content: object;
}
