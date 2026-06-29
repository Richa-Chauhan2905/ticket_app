import { z } from "zod";
export declare const createScreenSchema: z.ZodObject<{
    theatreId: z.ZodString;
    name: z.ZodString;
    totalSeats: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export type CreateScreenInput = z.infer<typeof createScreenSchema>;
//# sourceMappingURL=screen.schema.d.ts.map