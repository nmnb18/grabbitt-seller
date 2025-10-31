export type User = {
    uid: string;
    email: string;
    name: string;
    token?: string;
    shopName: string;
    role: string;
    phone: string;
}

export type UserPayload = {
    email: string;
    name: string;
    shopName: string;
    role: string;
    phone: string;
    password: string;
}