import { hash, genSalt, compare } from "bcrypt";

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string) => {
    const salt = await genSalt(SALT_ROUNDS);
    return await hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string) => {
    return await compare(password, hashedPassword);
};
