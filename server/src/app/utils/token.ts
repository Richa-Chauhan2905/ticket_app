import JWT from 'jsonwebtoken'

export interface userTokenPayload {
    id: string;
    role: "user" | "admin";
}

const JWT_SECRET = "myjsonwebtoken"
export function createUserToken(payload: userTokenPayload){
    const token = JWT.sign(payload, JWT_SECRET)
    return token;
}
export function verifyUserToken(token: string){
    try {
        const payload = JWT.verify(token, JWT_SECRET) as userTokenPayload;
        return payload
    } catch (error) {
        return null;
    }
}
