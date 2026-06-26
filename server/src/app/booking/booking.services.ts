import { db } from "../../db/index.js";
import { bookings, bookingSeats, shows } from "../../db/schema.js";
import SeatService from "../seat/seat.services.js";
import { eq } from "drizzle-orm";

const seatService = new SeatService();

class BookingService {
  async createBooking(userId: string, showId: string, seatIds: string[]) {
    await seatService.lockSeats(userId, seatIds);

    const showResult = await db
      .select()
      .from(shows)
      .where(eq(shows.id, showId));

    const show = showResult[0];

    if (!show) {
      throw new Error("Show not found");
    }

    const totalAmount = seatIds.length * show.price;

    const [booking] = await db
      .insert(bookings)
      .values({
        userId,
        showId,
        totalAmount,
        status: "pending",
      })
      .returning();

    if (!booking) {
      throw new Error("Failed to create booking");
    }

    await db.insert(bookingSeats).values(
      seatIds.map((seatId) => ({
        bookingId: booking.id,
        seatId,
      })),
    );

    return {
      booking,
      totalAmount,
    };
  }
}

export default BookingService;
