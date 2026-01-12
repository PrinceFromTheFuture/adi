import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle(process.env.DATABASE_URL!);
export default db;

// Export all schemas
export * from "./schemas/User";
export * from "./schemas/FoodItem";
export * from "./schemas/SavedMeal";
export * from "./schemas/Meal";
export * from "./schemas/FoodDatabase";
export * from "./schemas/WaterLog";
export * from "./schemas/StepsLog";
export * from "./schemas/WeightLog";
export * from "./schemas/RestDay";
export * from "./schemas/DailyReminder";
export * from "./schemas/Workouts";
export * from "./schemas/WorkoutSessions";
