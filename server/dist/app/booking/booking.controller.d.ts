import type { Request, Response } from "express";
declare class BookingController {
    private bookingService;
    createBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    verifyPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default BookingController;
//# sourceMappingURL=booking.controller.d.ts.map