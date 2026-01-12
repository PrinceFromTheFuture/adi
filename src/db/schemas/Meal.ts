import { integer, pgTable, text, pgEnum, decimal, date, time, timestamp } from "drizzle-orm/pg-core";

export const mealTypeEnum = pgEnum("meal_type", ["breakfast", "lunch", "dinner", "snack"]);

export const mealsTable = pgTable("meals", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  mealType: mealTypeEnum().notNull(),
  foodName: text().notNull(),
  calories: decimal({ precision: 8, scale: 2 }),
  protein: decimal({ precision: 8, scale: 2 }),
  carbs: decimal({ precision: 8, scale: 2 }),
  fat: decimal({ precision: 8, scale: 2 }),
  servingSize: text(),
  mealDate: date().notNull(),
  mealTime: time(),
  notes: text(),
  createdBy: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});
