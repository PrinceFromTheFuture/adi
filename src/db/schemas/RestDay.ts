import { integer, pgTable, text, pgEnum, date, timestamp } from "drizzle-orm/pg-core";

export const restDayReasonEnum = pgEnum("rest_day_reason", ["scheduled_rest", "injury", "illness", "personal", "travel"]);

export const restDaysTable = pgTable("rest_days", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  restDate: date().notNull(),
  reason: restDayReasonEnum().notNull(),
  notes: text(),
  createdBy: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

