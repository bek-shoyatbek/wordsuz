import { cleanEnv, num, str, url } from "envalid";


export const envConfig = cleanEnv(process.env, {
    APP_PORT: num({ default: 3000 }),

    DATABASE_URL: url(),

    REDIS_HOST: str(),
    REDIS_PORT: num(),
    REDIS_PASSWORD: str(),

    PEXELS_API_KEY: str(),

    WORDS_API_URL: url(),
    WORDS_API_KEY: str(),
    WORDS_API_HOST: str(),

    TRANSLATOR_API_KEY: str(),

    SMTP_HOST: str(),
    SMTP_PORT: num(),
    SMTP_LOGIN: str(),
    SMTP_FROM: str(),
    SMTP_KEY: str(),

    JWT_SECRET: str(),
    JWT_EXPIRES_IN: str(),
    JWT_ACCESS_TOKEN_SECRET: str(),
    JWT_ACCESS_TOKEN_EXPIRES_IN: str(),
    JWT_REFRESH_TOKEN_SECRET: str(),
    JWT_REFRESH_TOKEN_EXPIRES_IN: str(),

    JWT_ADMIN_ACCESS_TOKEN_SECRET: str(),
    JWT_ADMIN_ACCESS_TOKEN_EXPIRES_IN: str(),

    ADMIN_EMAIL: str(),
    ADMIN_PASSWORD: str(),
})