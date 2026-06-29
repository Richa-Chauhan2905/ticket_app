import type { Request, Response } from "express";
declare class SeatController {
    private seatService;
    getSeatByShow(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    lockSeats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default SeatController;
//# sourceMappingURL=seat.controller.d.ts.map