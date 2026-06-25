import type { NextFunction, Request, Response } from "express";

export function restrictToAdmin() {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication Required" });
    }

    if (req.user && req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access only" });
    }

    next();
  };
}