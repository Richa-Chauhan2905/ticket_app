import BookingService from "./booking.services.js";
import { bookingSchema, verifyPaymentSchema } from "./booking.schema.js";
class BookingController {
    bookingService = new BookingService();
    async createBooking(req, res) {
        try {
            const parsed = bookingSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error });
            }
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "User not authenticated" });
            }
            const result = await this.bookingService.createBooking(userId, parsed.data.showId, parsed.data.seatIds);
            return res.status(201).json({
                message: "Booking created",
                ...result,
            });
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async verifyPayment(req, res) {
        try {
            const parsed = verifyPaymentSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error });
            }
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "User not authenticated" });
            }
            await this.bookingService.verifyPayment({
                ...parsed.data,
                userId,
            });
            return res.json({ message: "Payment successful, booking confirmed" });
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}
export default BookingController;
//# sourceMappingURL=booking.controller.js.map