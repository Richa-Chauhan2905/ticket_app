import express from "express";
import SeatController from "./seat.controller.js";
import { restrictToAuthenticatedUser } from "../middleware/auth.middleware.js";

const seatController = new SeatController();

export const seatRouter = express.Router();

seatRouter.get(
  "/:showId",
  restrictToAuthenticatedUser(),
  seatController.getSeatByShow.bind(seatController),
);
seatRouter.post(
  "/lock",
  restrictToAuthenticatedUser(),
  seatController.lockSeats.bind(seatController),
);
