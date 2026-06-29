import ScreenService from "./screen.services.js";
import { createScreenSchema } from "./screen.schema.js";
class ScreenController {
    screenService = new ScreenService();
    async createScreen(req, res) {
        try {
            const parsed = createScreenSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error });
            }
            const screen = await this.screenService.createScreen(parsed.data);
            return res.status(201).json({
                message: "Screen created successfully",
                data: screen,
            });
        }
        catch (error) {
            return res.status(500).json({ error: "Failed to create screen" });
        }
    }
    async getScreensByTheatre(req, res) {
        try {
            const { theatreId } = req.params;
            if (!theatreId || typeof theatreId !== "string") {
                return res.status(400).json({ error: "Invalid theatre ID" });
            }
            const screens = await this.screenService.getScreensByTheatre(theatreId);
            return res.status(200).json({ data: screens });
        }
        catch (error) {
            return res.status(500).json({ error: "Failed to fetch screens" });
        }
    }
}
export default ScreenController;
//# sourceMappingURL=screen.controller.js.map