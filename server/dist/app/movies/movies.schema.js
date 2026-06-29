import { z } from "zod";
export const createMovieSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    duration: z.coerce.number().min(1, "Duration must be atleast 1 minute"),
    language: z.string().min(1, "Language is required"),
});
//# sourceMappingURL=movies.schema.js.map