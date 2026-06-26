import type { Request, Response } from "express";
import SeatService from "./seat.services.js";

class SeatController {
  private seatService = new SeatService();

  public async getSeatByShow(req: Request, res: Response) {
    try {
      const { showId } = req.params;

      if (!showId || Array.isArray(showId)) {
        return res.status(400).json({ error: "Show ID is required" });
      }

      const seats = await this.seatService.getSeatsByShow(showId);

      return res.status(200).json({ data: seats });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch seats" });
    }
  }

  async lockSeats(req: Request, res: Response) {
    try {
      const { seatIds } = req.body;
      //@ts-ignore
      const userId = req.user.id;

      await this.seatService.lockSeats(userId, seatIds);

      return res.json({ message: "Seats locked" });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export default SeatController;
