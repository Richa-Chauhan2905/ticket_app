import express from "express";
import { restrictToAdmin } from "../middleware/admin.middleware.js";
import { restrictToAuthenticatedUser } from "../middleware/auth.middleware.js";
import ScreenController from "./screen.controller.js";
export const screenRouter = express.Router();
const screenController = new ScreenController();
screenRouter.post("/create-screen", restrictToAuthenticatedUser(), restrictToAdmin(), screenController.createScreen.bind(screenController));
screenRouter.get("/:theatreId", restrictToAuthenticatedUser(), screenController.getScreensByTheatre.bind(screenController));
//# sourceMappingURL=screen.routes.js.map