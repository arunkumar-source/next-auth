import * as dotenv from "dotenv";
import { defineConfig } from 'drizzle-kit';
dotenv.config({path: '../../.env'});

export default defineConfig({
  schema: './src/Schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});

