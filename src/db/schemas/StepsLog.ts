import { integer, pgTable, text, date, decimal, timestamp } from "drizzle-orm/pg-core";

export const stepsLogsTable = pgTable("steps_logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  stepsCount: integer().notNull(),
  logDate: date().notNull(),
  distanceKm: decimal({ precision: 8, scale: 2 }),
  caloriesBurned: decimal({ precision: 8, scale: 2 }),
  createdBy: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});
