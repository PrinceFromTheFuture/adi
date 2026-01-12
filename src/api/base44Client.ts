// Base44 Client Proxy - Routes all operations to the real database via API

// Type definitions for entity methods
interface EntityMethods<T> {
  list(sortBy?: string, limit?: number): Promise<T[]>;
  filter(query: Record<string, unknown>, sortBy?: string, limit?: number): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  bulkCreate(dataArray: Partial<T>[]): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  schema(): Promise<Record<string, unknown>>;
}

// API base URL - uses relative path for Next.js API routes
const API_BASE = "/api/entities";

// Base class for entity operations - proxies to API
class EntityProxy<T extends { id?: string | number }> implements EntityMethods<T> {
  private entityName: string;
  private entitySchema: Record<string, unknown>;

  constructor(entityName: string, schema: Record<string, unknown>) {
    this.entityName = entityName;
    this.entitySchema = schema;
  }

  async list(sortBy?: string, limit?: number): Promise<T[]> {
    const params = new URLSearchParams();
    if (sortBy) params.set("sortBy", sortBy);
    if (limit) params.set("limit", limit.toString());

    const url = `${API_BASE}/${this.entityName}${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to list entities");
    }

    return response.json();
  }

  async filter(query: Record<string, unknown>, sortBy?: string, limit?: number): Promise<T[]> {
    const params = new URLSearchParams();
    params.set("filter", JSON.stringify(query));
    if (sortBy) params.set("sortBy", sortBy);
    if (limit) params.set("limit", limit.toString());

    const url = `${API_BASE}/${this.entityName}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to filter entities");
    }

    return response.json();
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await fetch(`${API_BASE}/${this.entityName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create entity");
    }

    return response.json();
  }

  async bulkCreate(dataArray: Partial<T>[]): Promise<T[]> {
    const response = await fetch(`${API_BASE}/${this.entityName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataArray),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to bulk create entities");
    }

    return response.json();
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const response = await fetch(`${API_BASE}/${this.entityName}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update entity");
    }

    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${this.entityName}?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete entity");
    }
  }

  async schema(): Promise<Record<string, unknown>> {
    return this.entitySchema;
  }
}

// Entity Schemas (kept for backwards compatibility with schema() method)
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

// Type definitions (from mock data structure)
export type User = {
  id?: string | number;
  target_weight: number;
  current_weight: number;
  height: number;
  gender: "male" | "female";
  activity_level: "sedentary" | "lightly_active" | "moderately_active" | "very_active";
  profile_image: string;
  daily_water_goal?: number;
  created_at?: string;
  updated_at?: string;
};

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

export type SavedMeal = {
  id?: string | number;
  meal_name: string;
  items: SavedMealItem[];
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  created_at?: string;
  updated_at?: string;
};

export type FoodItem = {
  id?: string | number;
  name: string;
  category: "protein" | "carb" | "vegetable" | "addition";
  calories_per_unit: number;
  protein_per_unit?: number;
  carbs_per_unit?: number;
  fat_per_unit?: number;
  unit_type: "spoon" | "gram" | "piece";
  default_amount?: number;
  created_at?: string;
  updated_at?: string;
};

export type WorkoutSession = {
  id?: string | number;
  workout_id: string;
  workout_name: string;
  session_date: string;
  duration_minutes?: number;
  calories_burned?: number;
  performance_notes?: string;
  completed?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type StepsLog = {
  id?: string | number;
  steps_count: number;
  log_date: string;
  distance_km?: number;
  calories_burned?: number;
  created_at?: string;
  updated_at?: string;
};

export type DailyReminder = {
  id?: string | number;
  reminder_type: "water" | "meal_planning" | "breakfast" | "lunch" | "dinner" | "snack" | "workout";
  reminder_time: string;
  is_active?: boolean;
  message?: string;
  days_of_week?: string[];
  created_at?: string;
  updated_at?: string;
};

export type FoodDatabase = {
  id?: string | number;
  food_name: string;
  food_name_english?: string;
  calories_per_100g: number;
  protein_per_100g?: number;
  carbs_per_100g?: number;
  fat_per_100g?: number;
  fiber_per_100g?: number;
  category?: string;
  created_at?: string;
  updated_at?: string;
};

export type WaterLog = {
  id?: string | number;
  amount_ml: number;
  log_date: string;
  log_time?: string;
  created_at?: string;
  updated_at?: string;
};

export type RestDay = {
  id?: string | number;
  rest_date: string;
  reason: "scheduled_rest" | "injury" | "illness" | "personal" | "travel";
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type WeightLog = {
  id?: string | number;
  weight: number;
  log_date: string;
  body_fat_percentage?: number;
  muscle_mass?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type Exercise = {
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  rest_time: string;
  target_muscles: string[];
  image_url: string;
};

export type Workout = {
  id?: string | number;
  workout_name: string;
  workout_type?: string;
  duration_minutes?: number;
  exercises?: Exercise[];
  intensity?: string;
  notes?: string;
  is_active?: boolean;
  last_performed?: string;
  created_at?: string;
  updated_at?: string;
};

export type Meal = {
  id?: string | number;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  food_name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  serving_size?: string;
  meal_date: string;
  meal_time?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

// File upload handler
async function uploadFile(options: { file: File }): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append("file", options.file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }

  return response.json();
}

// Auth methods
const auth = {
  me: async () => {
    const response = await fetch("/api/auth/me");
    if (!response.ok) {
      throw new Error("Failed to get user info");
    }
    return response.json();
  },
};

// Core utilities
const Core = {
  UploadFile: uploadFile,
};

// Create entity proxies
export const User = new EntityProxy<User>("User", userSchema);

export const entities = {
  User: new EntityProxy<User>("User", userSchema),
  SavedMeal: new EntityProxy<SavedMeal>("SavedMeal", savedMealSchema),
  FoodItem: new EntityProxy<FoodItem>("FoodItem", foodItemSchema),
  WorkoutSession: new EntityProxy<WorkoutSession>("WorkoutSession", workoutSessionSchema),
  StepsLog: new EntityProxy<StepsLog>("StepsLog", stepsLogSchema),
  DailyReminder: new EntityProxy<DailyReminder>("DailyReminder", dailyReminderSchema),
  FoodDatabase: new EntityProxy<FoodDatabase>("FoodDatabase", foodDatabaseSchema),
  WaterLog: new EntityProxy<WaterLog>("WaterLog", waterLogSchema),
  RestDay: new EntityProxy<RestDay>("RestDay", restDaySchema),
  WeightLog: new EntityProxy<WeightLog>("WeightLog", weightLogSchema),
  Workout: new EntityProxy<Workout>("Workout", workoutSchema),
  Meal: new EntityProxy<Meal>("Meal", mealSchema),
};

// Main export - maintains backwards compatibility with base44 SDK interface
export const base44 = {
  entities,
  auth,
  Core,
};
