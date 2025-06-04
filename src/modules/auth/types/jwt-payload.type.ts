import { UserRole } from "./index";

export type JwtPayload = {
    email: string;
    role?: UserRole;
    id: string;
}