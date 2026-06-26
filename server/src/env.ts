import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().optional(),
  DATABASE_URL: z.string(),
//   JWT_SECRET: z.string(),
//   EMAIL_USER: z.string().email(),
//   EMAIL_PASS: z.string(),
//   REDIS_URL: z.string(),
  IMAGEKIT_PUBLIC_KEY: z.string(),
  IMAGEKIT_PRIVATE_KEY: z.string(),
  IMAGEKIT_URL_ENDPOINT: z.string(),
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
