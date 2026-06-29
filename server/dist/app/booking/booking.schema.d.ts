import z from "zod";
export declare const bookingSchema: z.ZodObject<{
    showId: z.ZodString;
    seatIds: z.ZodArray<z.ZodString>;
}, z.z.core.$strip>;
export declare const verifyPaymentSchema: z.ZodObject<{
    bookingId: z.ZodString;
    razorpayOrderId: z.ZodString;
    razorpayPaymentId: z.ZodString;
    razorpaySignature: z.ZodString;
}, z.z.core.$strip>;
//# sourceMappingURL=booking.schema.d.ts.map