import type { Request, Response } from "express";
import BookingService from "./booking.services.js";
import { bookingSchema } from "./booking.schema.js";

class BookingController {
  private bookingService = new BookingService();

  public async createBooking(req: Request, res: Response) {
    try {
      const parsed = bookingSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: parsed.error,
        });
      }

      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: "User not authenticated",
        });
      }

      const result = await this.bookingService.createBooking(
        userId,
        parsed.data.showId,
        parsed.data.seatIds,
      );

      return res.status(201).json({
        ...result,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }
}

export default BookingController;
