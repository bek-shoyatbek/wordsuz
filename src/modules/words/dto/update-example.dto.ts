import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateExampleDto {
  @IsOptional() @IsString() phrase?: string;
  @IsOptional() @IsString() translation?: string;
  @IsOptional() @IsBoolean() isVerified?: boolean;
}
