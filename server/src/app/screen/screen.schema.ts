import { z } from "zod";

export const createScreenSchema = z.object({
  theatreId: z.string().uuid(),
  name: z.string().min(1, "Screen name required"),
  totalSeats: z.coerce.number().min(20, "Total seats must be at least 20"),
});

export type CreateScreenInput = z.infer<typeof createScreenSchema>;
