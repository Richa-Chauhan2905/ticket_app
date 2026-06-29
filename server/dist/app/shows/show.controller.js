import { createShowSchema } from "./show.schema.js";
import ShowService from "./show.services.js";
class ShowController {
    showService = new ShowService();
    async createShow(req, res) {
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
        }
        catch (error) {
            return res.status(500).json({ error: "Failed to create show" });
        }
    }
    async getShowsByMovie(req, res) {
        try {
            const { movieId } = req.params;
            if (!movieId || Array.isArray(movieId)) {
                return res.status(400).json({ error: "Movie ID required" });
            }
            const shows = await this.showService.getShowsByMovie(movieId);
            return res.status(200).json({ data: shows });
        }
        catch (error) {
            return res.status(500).json({ error: "Failed to fetch shows" });
        }
    }
}
export default ShowController;
//# sourceMappingURL=show.controller.js.map