import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";

// Work status enum
export const workStatusDB = pgEnum("work_status", [ "backlog", "todo", "in-progress", "done", "cancelled"]);

// Work table with description and endDate fields
export const workDB = pgTable("nextjs_work", {
       id: text("id").primaryKey(),
       title: text("title").notNull(),
       description: text("description"),
       status: workStatusDB("status").notNull().default("todo"),
       endDate: timestamp("endDate", {
              withTimezone: true,
       }),
       createdAt: timestamp("createdAt", {
              withTimezone: true,
       }).notNull().defaultNow(),
       // TODO: trigger new migration generation
});



export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  email: text("email").notNull().unique(),

  password: text("password").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
