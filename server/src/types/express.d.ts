import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string | null;
        email: string;
        password: string;
        role: "user" | "admin";
        isVerified: boolean | null;
        createdAt: Date | null;
        updatedAt: Date | null;
      };
    }
  }
}
