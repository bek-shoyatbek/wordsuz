import { cleanEnv, num, str, url } from "envalid";


export const envConfig = cleanEnv(process.env, {
    APP_PORT: num({ default: 3000 }),

    DATABASE_URL: url(),

    WORDS_API_URL: url(),
    WORDS_API_KEY: str(),
    WORDS_API_HOST: str(),
    TRANSLATOR_API_KEY: str(),
})