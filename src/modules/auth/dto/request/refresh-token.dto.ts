import { IsString } from "class-validator";
import { IsNotEmpty } from "class-validator";

export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}
