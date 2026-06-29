import z from "zod";
export const bookingSchema = z.object({
    showId: z.string().uuid(),
    seatIds: z.array(z.string().uuid()).min(1),
});
export const verifyPaymentSchema = z.object({
    bookingId: z.string().uuid(),
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
});
//# sourceMappingURL=booking.schema.js.map