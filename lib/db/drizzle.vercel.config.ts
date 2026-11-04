import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.VERCEL_DATABASE_URL) {
  throw new Error("VERCEL_DATABASE_URL must point to the Vercel-connected PostgreSQL database.");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.VERCEL_DATABASE_URL,
  },
});
