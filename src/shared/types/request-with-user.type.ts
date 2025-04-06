export type RequestWithUser = Request & {
    user: {
        id: string;
        email: string;
    };
};