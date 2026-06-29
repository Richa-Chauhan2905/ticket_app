import express from "express";
import { restrictToAdmin } from "../middleware/admin.middleware.js";
import { restrictToAuthenticatedUser } from "../middleware/auth.middleware.js";
import ShowController from "./show.controller.js";

export const showRouter = express.Router();
const showController = new ShowController();

showRouter.post(
  "/create-show",
  restrictToAuthenticatedUser(),
  restrictToAdmin(),
  showController.createShow.bind(showController),
);

showRouter.get(
  "/:movieId",
  restrictToAuthenticatedUser(),
  showController.getShowsByMovie.bind(showController),
);
