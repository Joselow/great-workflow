import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

export default defineConfig({
  schema: "./src/db/schemas/*",
  out: "./src/db/drizzle",
  dialect: "postgresql",
  // dbCredentials: {
  //   url: process.env.DATABASE_URL,
  // },
});
