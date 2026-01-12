import { integer, pgTable, text, pgEnum, decimal, timestamp } from "drizzle-orm/pg-core";

export const genderEnum = pgEnum("gender", ["male", "female"]);
export const activityLevelEnum = pgEnum("activity_level", ["sedentary", "lightly_active", "moderately_active", "very_active"]);

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  targetWeight: decimal({ precision: 5, scale: 2 }).notNull(),
  currentWeight: decimal({ precision: 5, scale: 2 }).notNull(),
  height: decimal({ precision: 5, scale: 2 }).notNull(),
  gender: genderEnum().notNull(),
  activityLevel: activityLevelEnum().notNull(),
  profileImage: text().notNull(),
  dailyWaterGoal: integer().notNull().default(2000),
  dailyCalorieGoal: integer().notNull().default(2000),
  dailyStepsGoal: integer().notNull().default(10000),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});
