import { createClient } from "@base44/sdk";
import {
  mockUsers,
  mockSavedMeals,
  mockFoodItems,
  mockWorkoutSessions,
  mockStepsLogs,
  mockDailyReminders,
  mockFoodDatabase,
  mockWaterLogs,
  mockRestDays,
  mockWeightLogs,
  mockWorkouts,
  mockMeals,
} from "./mockData";

// Type definitions for entity methods
interface EntityMethods<T> {
  list(sortBy?: string, limit?: number): Promise<T[]>;
  filter(query: Record<string, any>, sortBy?: string, limit?: number): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  bulkCreate(dataArray: Partial<T>[]): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  schema(): Promise<any>;
}

// Base class for entity operations
class EntityManager<T extends { id?: string }> implements EntityMethods<T> {
  private data: T[];
  private entitySchema: any;
  private entityName: string;

  constructor(initialData: T[], schema: any, entityName: string) {
    this.data = [...initialData];
    this.entitySchema = schema;
    this.entityName = entityName;
  }

  async list(sortBy?: string, limit?: number): Promise<T[]> {
    let result = [...this.data];

    if (sortBy) {
      result.sort((a, b) => {
        const aVal = (a as any)[sortBy];
        const bVal = (b as any)[sortBy];
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
        return 0;
      });
    }

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }

  async filter(query: Record<string, any>, sortBy?: string, limit?: number): Promise<T[]> {
    let result = this.data.filter((item) => {
      return Object.keys(query).every((key) => {
        const itemValue = (item as any)[key];
        const queryValue = query[key];

        if (typeof queryValue === "object" && queryValue !== null) {
          // Handle operators like $gt, $lt, etc.
          if ("$gt" in queryValue) return itemValue > queryValue.$gt;
          if ("$gte" in queryValue) return itemValue >= queryValue.$gte;
          if ("$lt" in queryValue) return itemValue < queryValue.$lt;
          if ("$lte" in queryValue) return itemValue <= queryValue.$lte;
          if ("$ne" in queryValue) return itemValue !== queryValue.$ne;
          if ("$in" in queryValue) return queryValue.$in.includes(itemValue);
        }

        return itemValue === queryValue;
      });
    });

    if (sortBy) {
      result.sort((a, b) => {
        const aVal = (a as any)[sortBy];
        const bVal = (b as any)[sortBy];
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
        return 0;
      });
    }

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }

  async create(data: Partial<T>): Promise<T> {
    const newItem = {
      ...data,
      id: `${this.entityName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as T;

    this.data.push(newItem);
    return newItem;
  }

  async bulkCreate(dataArray: Partial<T>[]): Promise<T[]> {
    const newItems = dataArray.map(
      (data) =>
        ({
          ...data,
          id: `${this.entityName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }) as unknown
    ) as T[];

    this.data.push(...newItems);
    return newItems;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const index = this.data.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`${this.entityName} with id ${id} not found`);
    }

    this.data[index] = {
      ...this.data[index],
      ...data,
      id, // Preserve the original id
      updated_at: new Date().toISOString(),
    };

    return this.data[index];
  }

  async delete(id: string): Promise<void> {
    const index = this.data.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`${this.entityName} with id ${id} not found`);
    }

    this.data.splice(index, 1);
  }

  async schema(): Promise<any> {
    return this.entitySchema;
  }
}

// Entity Schemas
const userSchema = {
  name: "User",
  type: "object",
  properties: {
    target_weight: { type: "number", description: 'משקל יעד בק"ג' },
    current_weight: { type: "number", description: 'משקל נוכחי בק"ג' },
    height: { type: "number", description: 'גובה בס"מ' },
    gender: { type: "string", enum: ["male", "female"], description: "מגדר" },
    activity_level: {
      type: "string",
      enum: ["sedentary", "lightly_active", "moderately_active", "very_active"],
      description: "רמת פעילות גופנית",
    },
    profile_image: { type: "string", description: "תמונת פרופיל" },
    daily_water_goal: {
      type: "number",
      description: 'יעד שתייה יומי במ"ל',
      default: 2000,
    },
  },
  required: ["target_weight", "current_weight", "height", "gender", "activity_level", "profile_image"],
};

const savedMealSchema = {
  name: "SavedMeal",
  type: "object",
  properties: {
    meal_name: { type: "string", description: "שם הארוחה" },
    items: { type: "array", description: "פריטי הארוחה" },
    total_calories: { type: "number", description: "סך כל הקלוריות" },
    total_protein: { type: "number", description: "סך כל החלבון" },
    total_carbs: { type: "number", description: "סך כל הפחמימות" },
    total_fat: { type: "number", description: "סך כל השומן" },
  },
  required: ["meal_name", "items"],
};

const foodItemSchema = {
  name: "FoodItem",
  type: "object",
  properties: {
    name: { type: "string", description: "שם המנה" },
    category: {
      type: "string",
      enum: ["protein", "carb", "vegetable", "addition"],
      description: "קטגוריית המנה",
    },
    calories_per_unit: { type: "number", description: "קלוריות ליחידה" },
    protein_per_unit: { type: "number", description: "חלבון ליחידה בגרם" },
    carbs_per_unit: { type: "number", description: "פחמימות ליחידה בגרם" },
    fat_per_unit: { type: "number", description: "שומן ליחידה בגרם" },
    unit_type: {
      type: "string",
      enum: ["spoon", "gram", "piece"],
      description: "סוג יחידת מידה",
    },
    default_amount: { type: "number", default: 1, description: "כמות בררת מחדל" },
  },
  required: ["name", "category", "calories_per_unit", "unit_type"],
};

const workoutSessionSchema = {
  name: "WorkoutSession",
  type: "object",
  properties: {
    workout_id: { type: "string", description: "ID של תבנית האימון" },
    workout_name: { type: "string", description: "שם האימון" },
    session_date: { type: "string", format: "date", description: "תאריך בצוע האימון" },
    duration_minutes: { type: "number", description: "משך האימון בפועל" },
    calories_burned: { type: "number", description: "קלוריות שנשרפו" },
    performance_notes: { type: "string", description: "הערות על הבצוע" },
    completed: { type: "boolean", default: true, description: "האם האימון הושלם" },
  },
  required: ["workout_id", "workout_name", "session_date"],
};

const stepsLogSchema = {
  name: "StepsLog",
  type: "object",
  properties: {
    steps_count: { type: "number", description: "מספר צעדים" },
    log_date: { type: "string", format: "date", description: "תאריך רישום הצעדים" },
    distance_km: { type: "number", description: "מרחק בקילומטרים" },
    calories_burned: { type: "number", description: "קלוריות שנשרפו מהליכה" },
  },
  required: ["steps_count", "log_date"],
};

const dailyReminderSchema = {
  name: "DailyReminder",
  type: "object",
  properties: {
    reminder_type: {
      type: "string",
      enum: ["water", "meal_planning", "breakfast", "lunch", "dinner", "snack", "workout"],
      description: "סוג התזכורת",
    },
    reminder_time: { type: "string", description: "שעת התזכורת (HH:mm)" },
    is_active: { type: "boolean", default: true, description: "האם התזכורת פעילה" },
    message: { type: "string", description: "הודעת התזכורת" },
    days_of_week: {
      type: "array",
      items: {
        type: "string",
        enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      },
      description: "ימים בשבוע לתזכורת",
    },
  },
  required: ["reminder_type", "reminder_time"],
};

const foodDatabaseSchema = {
  name: "FoodDatabase",
  type: "object",
  properties: {
    food_name: { type: "string", description: "שם המזון" },
    food_name_english: { type: "string", description: "שם המזון באנגלית" },
    calories_per_100g: { type: "number", description: "קלוריות ל-100 גרם" },
    protein_per_100g: { type: "number", description: "חלבון ל-100 גרם" },
    carbs_per_100g: { type: "number", description: "פחמימות ל-100 גרם" },
    fat_per_100g: { type: "number", description: "שומן ל-100 גרם" },
    fiber_per_100g: { type: "number", description: "סיבים תזונתיים ל-100 גרם" },
    category: { type: "string", description: "קטגוריית המזון" },
  },
  required: ["food_name", "calories_per_100g"],
};

const waterLogSchema = {
  name: "WaterLog",
  type: "object",
  properties: {
    amount_ml: { type: "number", description: "כמות המים במיליליטר" },
    log_date: { type: "string", format: "date", description: "תאריך השתייה" },
    log_time: { type: "string", description: "שעת השתייה" },
  },
  required: ["amount_ml", "log_date"],
};

const restDaySchema = {
  name: "RestDay",
  type: "object",
  properties: {
    rest_date: { type: "string", format: "date", description: "Date of the rest day" },
    reason: {
      type: "string",
      enum: ["scheduled_rest", "injury", "illness", "personal", "travel"],
      description: "Reason for rest day",
    },
    notes: { type: "string", description: "Additional notes about the rest day" },
  },
  required: ["rest_date", "reason"],
};

const weightLogSchema = {
  name: "WeightLog",
  type: "object",
  properties: {
    weight: { type: "number", description: "Body weight in kg" },
    log_date: { type: "string", format: "date", description: "Date of weight measurement" },
    body_fat_percentage: { type: "number", description: "Body fat percentage if measured" },
    muscle_mass: { type: "number", description: "Muscle mass in kg if measured" },
    notes: { type: "string", description: "Additional notes about the measurement" },
  },
  required: ["weight", "log_date"],
};

const workoutSchema = {
  name: "Workout",
  type: "object",
  properties: {
    workout_name: { type: "string", description: "שם תבנית האימון" },
    workout_type: {
      type: "string",
      enum: ["כוח", "איירובי", "גמישות", "משולב"],
      description: "סוג האימון",
    },
    duration_minutes: { type: "number", description: "משך האימון המשוער בדקות" },
    exercises: { type: "array", description: "רשימת תרגילים באימון" },
    intensity: {
      type: "string",
      enum: ["נמוכה", "בינונית", "גבוהה"],
      description: "רמת עוצמת האימון",
    },
    notes: { type: "string", description: "הערות על האימון" },
    is_active: { type: "boolean", default: false, description: "האם האימון במצב ביצוע כרגע" },
    last_performed: { type: "string", format: "date", description: "תאריך ביצוע אחרון" },
  },
  required: ["workout_name"],
};

const mealSchema = {
  name: "Meal",
  type: "object",
  properties: {
    meal_type: {
      type: "string",
      enum: ["breakfast", "lunch", "dinner", "snack"],
      description: "Type of meal",
    },
    food_name: { type: "string", description: "Name of the food item" },
    calories: { type: "number", description: "Calories per serving" },
    protein: { type: "number", description: "Protein content in grams" },
    carbs: { type: "number", description: "Carbohydrate content in grams" },
    fat: { type: "number", description: "Fat content in grams" },
    serving_size: { type: "string", description: "Serving size description" },
    meal_date: { type: "string", format: "date", description: "Date of the meal" },
    meal_time: { type: "string", description: "Time when meal was consumed" },
    notes: { type: "string", description: "Additional notes about the meal" },
  },
  required: ["meal_type", "food_name", "meal_date"],
};

// Override auth (commented out as it requires proper AxiosResponse type)
// base44.auth.me = async () => {
//   return { id: "fsdf", email: "adi@gmail.com", full_name: "adi", role: "admin" };
// };
export const User = new EntityManager(mockUsers, userSchema, "User");
// Create entity managers
export const entities = {
  User: new EntityManager(mockUsers, userSchema, "User"),
  SavedMeal: new EntityManager(mockSavedMeals, savedMealSchema, "SavedMeal"),
  FoodItem: new EntityManager(mockFoodItems, foodItemSchema, "FoodItem"),
  WorkoutSession: new EntityManager(mockWorkoutSessions, workoutSessionSchema, "WorkoutSession"),
  StepsLog: new EntityManager(mockStepsLogs, stepsLogSchema, "StepsLog"),
  DailyReminder: new EntityManager(mockDailyReminders, dailyReminderSchema, "DailyReminder"),
  FoodDatabase: new EntityManager(mockFoodDatabase, foodDatabaseSchema, "FoodDatabase"),
  WaterLog: new EntityManager(mockWaterLogs, waterLogSchema, "WaterLog"),
  RestDay: new EntityManager(mockRestDays, restDaySchema, "RestDay"),
  WeightLog: new EntityManager(mockWeightLogs, weightLogSchema, "WeightLog"),
  Workout: new EntityManager(mockWorkouts, workoutSchema, "Workout"),
  Meal: new EntityManager(mockMeals, mealSchema, "Meal"),
};
export const base44 = {
  entities,
  auth: {
    me: async () => {
      return { id: "fsdf", email: "adi@gmail.com", full_name: "adi", role: "admin" };
    },
  },
};
// Export types for TypeScript
export type User = (typeof mockUsers)[0];
export type SavedMeal = (typeof mockSavedMeals)[0];
export type FoodItem = (typeof mockFoodItems)[0];
export type WorkoutSession = (typeof mockWorkoutSessions)[0];
export type StepsLog = (typeof mockStepsLogs)[0];
export type DailyReminder = (typeof mockDailyReminders)[0];
export type FoodDatabase = (typeof mockFoodDatabase)[0];
export type WaterLog = (typeof mockWaterLogs)[0];
export type RestDay = (typeof mockRestDays)[0];
export type WeightLog = (typeof mockWeightLogs)[0];
export type Workout = (typeof mockWorkouts)[0];
export type Meal = (typeof mockMeals)[0];
