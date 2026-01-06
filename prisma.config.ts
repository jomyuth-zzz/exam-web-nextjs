// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    provider: "mongodb",
    url: process.env.MONGODB_URI!,
  },
});
