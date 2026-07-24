import "dotenv/config";
import { InternalServerError500 } from "../errors/InternalServerError500.js";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new InternalServerError500(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv:  process.env.NODE_ENV ?? "development",
  port: required("PORT"),
  databaseUrl: required("DATABASE_URL"),

  dbHost: required("DB_HOST"),
  dbPort: Number(process.env.DB_PORT ?? 5432),
  dbName: required("DB_NAME"),
  dbUser: required("DB_USER"),
  dbPassword: required("DB_PASSWORD"),
  
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",

  corsOrigin: required("CORS_ORIGIN"),
};

const productionEnvironments = ["production", "prod"];
export const isProduction = productionEnvironments.includes(env.nodeEnv.toLowerCase());
