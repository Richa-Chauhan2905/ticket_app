export interface userTokenPayload {
    id: string;
    role: "user" | "admin";
}
export declare function createUserToken(payload: userTokenPayload): string;
export declare function verifyUserToken(token: string): userTokenPayload | null;
//# sourceMappingURL=token.d.ts.map