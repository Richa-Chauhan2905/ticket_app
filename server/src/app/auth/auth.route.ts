import type { Router } from "express";
import express from "express";
import AuthenticationController from "./auth.controller.js";
import { authenticationMiddleware, restrictToAuthenticatedUser } from "../middleware/auth.middleware.js";

const authController = new AuthenticationController();

export const authRouter: Router = express.Router();

authRouter.post("/sign-up", authController.handleSignup.bind(authController));
authRouter.post("/sign-in", authController.handleSignin.bind(authController));
authRouter.post("/logout", authController.handleLogout.bind(authController));
authRouter.get("/me", restrictToAuthenticatedUser(), authController.handleMe.bind(authController));
