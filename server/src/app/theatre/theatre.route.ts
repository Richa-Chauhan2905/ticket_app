import { Router } from "express";
import express from "express";
import TheatreController from "./theatre.controller.js";
import { restrictToAdmin } from "../middleware/admin.middleware.js";
import { restrictToAuthenticatedUser } from "../middleware/auth.middleware.js";

const theatreController = new TheatreController();

export const theatreRouter: Router = express.Router();

theatreRouter.post(
  "/create-theatre",
  restrictToAuthenticatedUser(),
  restrictToAdmin(),
  theatreController.createTheatre.bind(theatreController),
);
theatreRouter.get(
  "/get-all-theatres",
  restrictToAuthenticatedUser(),
  theatreController.getAllTheatres.bind(theatreController),
);
theatreRouter.get(
  "/:id",
  restrictToAuthenticatedUser(),
  theatreController.getTheatreById.bind(theatreController),
);
