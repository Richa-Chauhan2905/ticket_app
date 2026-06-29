import { z } from "zod";
export declare const createMovieSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    duration: z.ZodCoercedNumber<unknown>;
    language: z.ZodString;
}, z.core.$strip>;
export type CreateTheatreInput = z.infer<typeof createMovieSchema>;
//# sourceMappingURL=movies.schema.d.ts.map