if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set and at least 32 characters long");
}
export const BCRYPT_ROUNDS = 10; // fast enough for free serverless, still strong
