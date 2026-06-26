import express from "express";
import type { Router } from "express";
import { restrictToAdmin } from "../middleware/admin.middleware.js";
import { restrictToAuthenticatedUser } from "../middleware/auth.middleware.js";
import MovieController from "./movies.controllert.js";
import { upload } from "../middleware/upload.middleware.js";

const movieController = new MovieController();

export const movieRouter: Router = express.Router();

movieRouter.post(
  "/add-movie",
  restrictToAuthenticatedUser(),
  restrictToAdmin(),
  upload.single("poster"),
  movieController.addMovie.bind(movieController),
);
movieRouter.get(
  "/get-all-movie",
  restrictToAuthenticatedUser(),
  movieController.getAllMovies.bind(movieController),
);
movieRouter.get(
  "/:id",
  restrictToAuthenticatedUser(),
  movieController.getMovieById.bind(movieController),
);
