import { integer, pgTable, text, pgEnum, decimal, timestamp } from "drizzle-orm/pg-core";

export const foodCategoryEnum = pgEnum("food_category", ["protein", "carb", "vegetable", "addition"]);
export const unitTypeEnum = pgEnum("unit_type", ["spoon", "gram", "piece"]);

export const foodItemsTable = pgTable("food_items", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  category: foodCategoryEnum().notNull(),
  caloriesPerUnit: decimal({ precision: 8, scale: 2 }).notNull(),
  proteinPerUnit: decimal({ precision: 8, scale: 2 }),
  carbsPerUnit: decimal({ precision: 8, scale: 2 }),
  fatPerUnit: decimal({ precision: 8, scale: 2 }),
  unitType: unitTypeEnum().notNull(),
  defaultAmount: decimal({ precision: 8, scale: 2 }).notNull().default('1'),
  createdBy: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

