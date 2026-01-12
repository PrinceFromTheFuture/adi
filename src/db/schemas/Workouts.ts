import { integer, pgTable, text, varchar, pgEnum, jsonb, boolean, date, timestamp } from "drizzle-orm/pg-core";
import db from "..";
import { sql } from "drizzle-orm";

export const workoutTypeEnum = pgEnum("workout_type", ["גמישות", "כוח", "אירובי", "משולב"]);
export const intensityEnum = pgEnum("intensity", ["נמוכה", "בינונית", "גבוהה"]);
export type Exercise = {
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  rest_time: string;
  target_muscles: string[];
  image_url: string;
};

export const workoutsTable = pgTable("workouts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutName: text().notNull(),
  workoutType: workoutTypeEnum(),
  durationMinutes: integer().notNull(),
  intensity: intensityEnum(),
  exercises: jsonb().$type<Exercise[]>().notNull(),
  notes: text(),
  isActive: boolean().notNull().default(false),
  lastPerformed: date()
    .notNull()
    .default(sql`CURRENT_DATE`),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});
