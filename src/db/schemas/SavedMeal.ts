import { integer, pgTable, text, jsonb, decimal, timestamp } from "drizzle-orm/pg-core";

export type SavedMealItem = {
  food_item_id: string;
  food_name: string;
  category: string;
  amount: number;
  unit_type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const savedMealsTable = pgTable("saved_meals", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  mealName: text().notNull(),
  items: jsonb().$type<SavedMealItem[]>().notNull(),
  totalCalories: decimal({ precision: 8, scale: 2 }),
  totalProtein: decimal({ precision: 8, scale: 2 }),
  totalCarbs: decimal({ precision: 8, scale: 2 }),
  totalFat: decimal({ precision: 8, scale: 2 }),
  createdBy: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

