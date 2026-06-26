import express from "express";
import BookingController from "./booking.controller.js";
import { restrictToAuthenticatedUser } from "../middleware/auth.middleware.js";

export const bookingRouter = express.Router();
const bookingController = new BookingController();

bookingRouter.post(
  "/create",
  restrictToAuthenticatedUser(),
  bookingController.createBooking.bind(bookingController),
);
