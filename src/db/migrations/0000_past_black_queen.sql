CREATE TYPE "public"."reminder_type" AS ENUM('water', 'meal_planning', 'breakfast', 'lunch', 'dinner', 'snack', 'workout');--> statement-breakpoint
CREATE TYPE "public"."food_category" AS ENUM('protein', 'carb', 'vegetable', 'addition');--> statement-breakpoint
CREATE TYPE "public"."unit_type" AS ENUM('spoon', 'gram', 'piece');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('breakfast', 'lunch', 'dinner', 'snack');--> statement-breakpoint
CREATE TYPE "public"."rest_day_reason" AS ENUM('scheduled_rest', 'injury', 'illness', 'personal', 'travel');--> statement-breakpoint
CREATE TYPE "public"."activity_level" AS ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."intensity" AS ENUM('נמוכה', 'בינונית', 'גבוהה');--> statement-breakpoint
CREATE TYPE "public"."workout_type" AS ENUM('גמישות', 'כוח', 'אירובי', 'משולב');--> statement-breakpoint
CREATE TABLE "daily_reminders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "daily_reminders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"reminderType" "reminder_type" NOT NULL,
	"reminderTime" time NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"message" text,
	"daysOfWeek" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_database" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "food_database_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"foodName" text NOT NULL,
	"foodNameEnglish" text,
	"caloriesPer100g" numeric(8, 2) NOT NULL,
	"proteinPer100g" numeric(8, 2),
	"carbsPer100g" numeric(8, 2),
	"fatPer100g" numeric(8, 2),
	"fiberPer100g" numeric(8, 2),
	"category" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "food_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"category" "food_category" NOT NULL,
	"caloriesPerUnit" numeric(8, 2) NOT NULL,
	"proteinPerUnit" numeric(8, 2),
	"carbsPerUnit" numeric(8, 2),
	"fatPerUnit" numeric(8, 2),
	"unitType" "unit_type" NOT NULL,
	"defaultAmount" numeric(8, 2) DEFAULT '1' NOT NULL,
	"createdBy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meals" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "meals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"mealType" "meal_type" NOT NULL,
	"foodName" text NOT NULL,
	"calories" numeric(8, 2),
	"protein" numeric(8, 2),
	"carbs" numeric(8, 2),
	"fat" numeric(8, 2),
	"servingSize" text,
	"mealDate" date NOT NULL,
	"mealTime" time,
	"notes" text,
	"createdBy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rest_days" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "rest_days_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"restDate" date NOT NULL,
	"reason" "rest_day_reason" NOT NULL,
	"notes" text,
	"createdBy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_meals" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "saved_meals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"mealName" text NOT NULL,
	"items" jsonb NOT NULL,
	"totalCalories" numeric(8, 2),
	"totalProtein" numeric(8, 2),
	"totalCarbs" numeric(8, 2),
	"totalFat" numeric(8, 2),
	"createdBy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "steps_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "steps_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"stepsCount" integer NOT NULL,
	"logDate" date NOT NULL,
	"distanceKm" numeric(8, 2),
	"caloriesBurned" numeric(8, 2),
	"createdBy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"targetWeight" numeric(5, 2) NOT NULL,
	"currentWeight" numeric(5, 2) NOT NULL,
	"height" numeric(5, 2) NOT NULL,
	"gender" "gender" NOT NULL,
	"activityLevel" "activity_level" NOT NULL,
	"profileImage" text NOT NULL,
	"dailyWaterGoal" integer DEFAULT 2000 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "water_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "water_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"amountMl" integer NOT NULL,
	"logDate" date NOT NULL,
	"logTime" time,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weight_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "weight_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"weight" numeric(5, 2) NOT NULL,
	"logDate" date NOT NULL,
	"bodyFatPercentage" numeric(5, 2),
	"muscleMass" numeric(5, 2),
	"notes" text,
	"createdBy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workouts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"workoutName" text NOT NULL,
	"workoutType" "workout_type",
	"durationMinutes" integer NOT NULL,
	"intensity" "intensity",
	"exercises" jsonb NOT NULL,
	"notes" text,
	"isActive" boolean DEFAULT false NOT NULL,
	"lastPerformed" date DEFAULT CURRENT_DATE NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workout_sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"workoutId" integer DEFAULT null,
	"workoutName" text NOT NULL,
	"sessionDate" date NOT NULL,
	"durationMinutes" integer,
	"caloriesBurned" integer,
	"performanceNotes" text,
	"completed" boolean DEFAULT false NOT NULL,
	"isSample" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_workoutId_workouts_id_fk" FOREIGN KEY ("workoutId") REFERENCES "public"."workouts"("id") ON DELETE no action ON UPDATE no action;