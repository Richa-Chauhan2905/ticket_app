import { z } from "zod";
export declare const createShowSchema: z.ZodObject<{
    movieId: z.ZodString;
    screenId: z.ZodString;
    startTime: z.ZodString;
    price: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export type CreateShowInput = z.infer<typeof createShowSchema>;
//# sourceMappingURL=show.schema.d.ts.map