import { integer, pgTable, date, time, timestamp } from "drizzle-orm/pg-core";

export const waterLogsTable = pgTable("water_logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  amountMl: integer().notNull(),
  logDate: date().notNull(),
  logTime: time(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

