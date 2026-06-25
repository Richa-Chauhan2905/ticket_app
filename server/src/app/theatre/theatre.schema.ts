import { z } from "zod";

export const createTheatreSchema = z.object({
  name: z.string().min(1, "Theatre name is required"),
  location: z.string().min(1, "Theatre location is required"),
});

export type CreateTheatreInput = z.infer<typeof createTheatreSchema>;
