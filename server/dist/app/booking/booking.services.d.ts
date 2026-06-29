declare class BookingService {
    createBooking(userId: string, showId: string, seatIds: string[]): Promise<{
        booking: {
            id: string;
            createdAt: Date | null;
            updatedAt: Date | null;
            showId: string;
            status: "pending" | "success" | "failed" | null;
            userId: string;
            totalAmount: number;
        };
        totalAmount: number;
        order: import("razorpay/dist/types/orders.js").Orders.RazorpayOrder;
    }>;
    verifyPayment(data: {
        bookingId: string;
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        userId: string;
    }): Promise<boolean>;
}
export default BookingService;
//# sourceMappingURL=booking.services.d.ts.map