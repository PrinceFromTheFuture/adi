ALTER TABLE "workout_sessions" ALTER COLUMN "workoutId" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "dailyCalorieGoal" integer DEFAULT 2000 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "dailyStepsGoal" integer DEFAULT 10000 NOT NULL;