import { integer, pgTable, text, date, boolean, timestamp } from "drizzle-orm/pg-core";
import { workoutsTable } from "./Workouts";

export const workoutSessionsTable = pgTable("workout_sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutId: integer().references(() => workoutsTable.id),
  workoutName: text().notNull(),
  sessionDate: date().notNull(),
  durationMinutes: integer(),
  caloriesBurned: integer(),
  performanceNotes: text(),
  completed: boolean().notNull().default(false),
  isSample: boolean().notNull().default(false),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});
