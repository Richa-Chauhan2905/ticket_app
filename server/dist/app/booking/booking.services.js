import { db } from "../../db/index.js";
import { bookings, bookingSeats, shows, payments } from "../../db/schema.js";
import { env } from "../../env.js";
import crypto from "crypto";
import SeatService from "../seat/seat.services.js";
import { eq } from "drizzle-orm";
import Razorpay from "razorpay";
const seatService = new SeatService();
const razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
});
class BookingService {
    async createBooking(userId, showId, seatIds) {
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
        await db.insert(bookingSeats).values(seatIds.map((seatId) => ({
            bookingId: booking.id,
            seatId,
        })));
        const order = await razorpay.orders.create({
            amount: totalAmount * 100,
            currency: "INR",
            receipt: booking.id,
        });
        await db.insert(payments).values({
            bookingId: booking.id,
            razorpayOrderId: order.id,
            amount: totalAmount,
        });
        return {
            booking,
            totalAmount,
            order,
        };
    }
    async verifyPayment(data) {
        const body = data.razorpayOrderId + "|" + data.razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");
        if (expectedSignature !== data.razorpaySignature) {
            throw new Error("Invalid payment signature");
        }
        await db
            .update(payments)
            .set({
            razorpayPaymentId: data.razorpayPaymentId,
            status: "success",
        })
            .where(eq(payments.razorpayOrderId, data.razorpayOrderId));
        const bookingSeatsData = await db
            .select()
            .from(bookingSeats)
            .where(eq(bookingSeats.bookingId, data.bookingId));
        const seatIds = bookingSeatsData.map((s) => s.seatId);
        await seatService.confirmBooking(data.userId, seatIds);
        await db
            .update(bookings)
            .set({ status: "success" })
            .where(eq(bookings.id, data.bookingId));
        return true;
    }
}
export default BookingService;
//# sourceMappingURL=booking.services.js.map