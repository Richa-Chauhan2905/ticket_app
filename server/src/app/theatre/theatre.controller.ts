import type { Request, Response } from "express";
import TheatrService from "./theatre.service.js";
import { createTheatreSchema } from "./theatre.schema.js";

class TheatreController {
  private theatreService = new TheatrService();

  public async createTheatre(req: Request, res: Response) {
    try {
      const parsed = await createTheatreSchema.safeParseAsync(req.body);

      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error });
      }

      const theatre = await this.theatreService.createThratre(parsed.data);

      return res.status(201).json({
        message: "Theatre created successfully",
        data: theatre,
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to create Theatre " });
    }
  }

  public async getAllTheatres(_: Request, res: Response) {
    try {
      const theatres = await this.theatreService.getAllTheatres();

      return res.status(200).json({ data: theatres });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch theatres" });
    }
  }

  public async getTheatreById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Invalid theatre ID" });
      }

      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Invalid theatre ID" });
      }

      const theatre = await this.theatreService.getTheatreById(id);

      return res.status(200).json({ data: theatre });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch theatre" });
    }
  }
}

export default TheatreController;
