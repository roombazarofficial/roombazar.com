// Prisma 7 no longer loads .env automatically, so it is loaded explicitly here.
// This only affects CLI commands (migrate, generate, studio); the running
// application reads its configuration through @nestjs/config instead.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 configuration.
 *
 * The connection URL lives here rather than in schema.prisma, which keeps the
 * schema a pure description of the data model with no environment coupling.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    /*
      Run after `prisma migrate reset` and available as `npx prisma db seed`.
      tsx rather than ts-node because the seed is ESM-flavoured and tsx handles
      that without a separate tsconfig.
    */
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
