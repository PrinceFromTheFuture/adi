import { integer, pgTable, text, decimal, timestamp } from "drizzle-orm/pg-core";

export const foodDatabaseTable = pgTable("food_database", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  foodName: text().notNull(),
  foodNameEnglish: text(),
  caloriesPer100g: decimal({ precision: 8, scale: 2 }).notNull(),
  proteinPer100g: decimal({ precision: 8, scale: 2 }),
  carbsPer100g: decimal({ precision: 8, scale: 2 }),
  fatPer100g: decimal({ precision: 8, scale: 2 }),
  fiberPer100g: decimal({ precision: 8, scale: 2 }),
  category: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

