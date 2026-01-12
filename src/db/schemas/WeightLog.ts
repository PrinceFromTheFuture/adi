import { integer, pgTable, text, date, decimal, timestamp } from "drizzle-orm/pg-core";

export const weightLogsTable = pgTable("weight_logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  weight: decimal({ precision: 5, scale: 2 }).notNull(),
  logDate: date().notNull(),
  bodyFatPercentage: decimal({ precision: 5, scale: 2 }),
  muscleMass: decimal({ precision: 5, scale: 2 }),
  notes: text(),
  createdBy: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

