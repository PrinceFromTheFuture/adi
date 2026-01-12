import { integer, pgTable, text, pgEnum, time, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";

export const reminderTypeEnum = pgEnum("reminder_type", ["water", "meal_planning", "breakfast", "lunch", "dinner", "snack", "workout"]);

export const dailyRemindersTable = pgTable("daily_reminders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  reminderType: reminderTypeEnum().notNull(),
  reminderTime: time().notNull(),
  isActive: boolean().notNull().default(true),
  message: text(),
  daysOfWeek: jsonb().$type<string[]>(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

