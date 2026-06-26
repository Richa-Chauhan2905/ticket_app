import type { Request, Response } from "express";
import { createShowSchema } from "./show.schema.js";
import ShowService from "./show.services.js";
class ShowController {
  private showService = new ShowService();

  public async createShow(req: Request, res: Response) {
    try {
      const parsed = createShowSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error });
      }

      const show = await this.showService.createShow(parsed.data);

      return res.status(201).json({
        message: "Show created successfully",
        data: show,
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to create show" });
    }
  }

  public async getShowsByMovie(req: Request, res: Response) {
    try {
      const { movieId } = req.params;

      if (!movieId || Array.isArray(movieId)) {
        return res.status(400).json({ error: "Movie ID required" });
      }

      const shows = await this.showService.getShowsByMovie(movieId);

      return res.status(200).json({ data: shows });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch shows" });
    }
  }
}

export default ShowController;
