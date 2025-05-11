import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateExampleDto {
  @IsString()
  @IsNotEmpty()
  phrase: string;

  @IsString()
  @IsNotEmpty()
  translation: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
