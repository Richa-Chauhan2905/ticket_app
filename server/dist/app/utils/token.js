import JWT from 'jsonwebtoken';
const JWT_SECRET = "myjsonwebtoken";
export function createUserToken(payload) {
    const token = JWT.sign(payload, JWT_SECRET);
    return token;
}
export function verifyUserToken(token) {
    try {
        const payload = JWT.verify(token, JWT_SECRET);
        return payload;
    }
    catch (error) {
        return null;
    }
}
//# sourceMappingURL=token.js.map