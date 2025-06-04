import { JwtPayload } from "./jwt-payload.type";

export * from './jwt-payload.type';

export enum UserRole {
  SuperAdmin = 'SUPER_ADMIN',
  Admin = 'ADMIN',
  User = 'USER',
}

export interface AuthRequest extends Request {
  user: JwtPayload;
}