import { z } from "zod";
export const createShowSchema = z.object({
    movieId: z.string().uuid(),
    screenId: z.string().uuid(),
    startTime: z.string().datetime(),
    price: z.coerce.number().min(1, "Price must be postive"),
});
//# sourceMappingURL=show.schema.js.map