import { z } from "zod";
export declare const createTheatreSchema: z.ZodObject<{
    name: z.ZodString;
    location: z.ZodString;
}, z.core.$strip>;
export type CreateTheatreInput = z.infer<typeof createTheatreSchema>;
//# sourceMappingURL=theatre.schema.d.ts.map