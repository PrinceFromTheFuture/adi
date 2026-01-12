/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, gt, gte, lt, lte, ne, inArray, and, asc } from "drizzle-orm";
import db from "@/db";
import {
  usersTable,
  foodItemsTable,
  savedMealsTable,
  mealsTable,
  foodDatabaseTable,
  waterLogsTable,
  stepsLogsTable,
  weightLogsTable,
  restDaysTable,
  dailyRemindersTable,
  workoutsTable,
  workoutSessionsTable,
} from "@/db";

// Type for entity names
export type EntityName =
  | "User"
  | "FoodItem"
  | "SavedMeal"
  | "Meal"
  | "FoodDatabase"
  | "WaterLog"
  | "StepsLog"
  | "WeightLog"
  | "RestDay"
  | "DailyReminder"
  | "Workout"
  | "WorkoutSession";

// Map entity names to their Drizzle tables
const entityTableMap = {
  User: usersTable,
  FoodItem: foodItemsTable,
  SavedMeal: savedMealsTable,
  Meal: mealsTable,
  FoodDatabase: foodDatabaseTable,
  WaterLog: waterLogsTable,
  StepsLog: stepsLogsTable,
  WeightLog: weightLogsTable,
  RestDay: restDaysTable,
  DailyReminder: dailyRemindersTable,
  Workout: workoutsTable,
  WorkoutSession: workoutSessionsTable,
} as const;

// Field mapping from snake_case (frontend) to camelCase (database)
const fieldMappings: Record<string, Record<string, string>> = {
  User: {
    target_weight: "targetWeight",
    current_weight: "currentWeight",
    activity_level: "activityLevel",
    profile_image: "profileImage",
    daily_water_goal: "dailyWaterGoal",
    created_at: "createdAt",
    updated_at: "updatedAt",
  },
  FoodItem: {
    calories_per_unit: "caloriesPerUnit",
    protein_per_unit: "proteinPerUnit",
    carbs_per_unit: "carbsPerUnit",
    fat_per_unit: "fatPerUnit",
    unit_type: "unitType",
    default_amount: "defaultAmount",
    created_by: "createdBy",
    created_at: "createdAt",
    updated_at: "updatedAt",
  },
  SavedMeal: {
    meal_name: "mealName",
    total_calories: "totalCalories",
    total_protein: "totalProtein",
    total_carbs: "totalCarbs",
    total_fat: "totalFat",
    created_by: "createdBy",
    created_at: "createdAt",
    updated_at: "updatedAt",
  },
  Meal: {
    meal_type: "mealType",
    food_name: "foodName",
    serving_size: "servingSize",
    meal_date: "mealDate",
    meal_time: "mealTime",
    created_by: "createdBy",
    created_at: "createdAt",
    updated_at: "updatedAt",
  },
  FoodDatabase: {
    food_name: "foodName",
    food_name_english: "foodNameEnglish",
    calories_per_100g: "caloriesPer100g",
    protein_per_100g: "proteinPer100g",
    carbs_per_100g: "carbsPer100g",
    fat_per_100g: "fatPer100g",
    fiber_per_100g: "fiberPer100g",
    created_at: "createdAt",
    updated_at: "updatedAt",
  },
  WaterLog: {
    amount_ml: "amountMl",
    log_date: "logDate",
    log_time: "logTime",
    created_at: "createdAt",
    updated_at: "updatedAt",
  },
  StepsLog: {
    steps_count: "stepsCount",
    log_date: "logDate",
    distance_km: "distanceKm",
    calories_burned: "caloriesBurned",
    created_by: "createdBy",
    created_at: "createdAt",
    updated_at: "updatedAt",
  },
  WeightLog: {
    log_date: "logDate",
    body_fat_percentage: "bodyFatPercentage",
    muscle_mass: "muscleMass",
    created_by: "createdBy",
    created_at: "createdAt",
    updated_at: "updatedAt",
  },
  RestDay: {
    rest_date: "restDate",
    created_by: "createdBy",
    created_at: "createdAt",
    updated_at: "updatedAt",
  },
  DailyReminder: {
    reminder_type: "reminderType",
    reminder_time: "reminderTime",
    is_active: "isActive",
    days_of_week: "daysOfWeek",
    created_at: "createdAt",
    updated_at: "updatedAt",
  },
  Workout: {
    workout_name: "workoutName",
    workout_type: "workoutType",
    duration_minutes: "durationMinutes",
    is_active: "isActive",
    last_performed: "lastPerformed",
    created_at: "createdAt",
    updated_at: "updatedAt",
  },
  WorkoutSession: {
    workout_id: "workoutId",
    workout_name: "workoutName",
    session_date: "sessionDate",
    duration_minutes: "durationMinutes",
    calories_burned: "caloriesBurned",
    performance_notes: "performanceNotes",
    is_sample: "isSample",
    created_at: "createdAt",
    updated_at: "updatedAt",
  },
};

// Convert frontend snake_case data to database camelCase
function toDbFormat(entityName: EntityName, data: Record<string, unknown>): Record<string, unknown> {
  const mapping = fieldMappings[entityName] || {};
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const dbKey = mapping[key] || key;
    result[dbKey] = value;
  }

  return result;
}

// Convert database camelCase data to frontend snake_case
function toFrontendFormat(entityName: EntityName, data: Record<string, unknown>): Record<string, unknown> {
  const mapping = fieldMappings[entityName] || {};
  const reverseMapping: Record<string, string> = {};

  for (const [snakeKey, camelKey] of Object.entries(mapping)) {
    reverseMapping[camelKey] = snakeKey;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const frontendKey = reverseMapping[key] || key;
    result[frontendKey] = value;
  }

  return result;
}

// Build filter conditions from query object
function buildFilterConditions(table: any, entityName: EntityName, query: Record<string, any>): any[] {
  const conditions: any[] = [];
  const mapping = fieldMappings[entityName] || {};

  for (const [key, value] of Object.entries(query)) {
    const dbKey = mapping[key] || key;
    const column = table[dbKey];

    if (!column) continue;

    if (typeof value === "object" && value !== null) {
      if ("$gt" in value) conditions.push(gt(column, value.$gt));
      if ("$gte" in value) conditions.push(gte(column, value.$gte));
      if ("$lt" in value) conditions.push(lt(column, value.$lt));
      if ("$lte" in value) conditions.push(lte(column, value.$lte));
      if ("$ne" in value) conditions.push(ne(column, value.$ne));
      if ("$in" in value) conditions.push(inArray(column, value.$in));
    } else {
      conditions.push(eq(column, value));
    }
  }

  return conditions;
}

/**
 * List all records from an entity table
 */
export async function listEntity(entityName: EntityName, sortBy?: string, limit?: number): Promise<Record<string, unknown>[]> {
  const table = entityTableMap[entityName];
  if (!table) throw new Error(`Unknown entity: ${entityName}`);

  const mapping = fieldMappings[entityName] || {};
  let query = db.select().from(table);

  if (sortBy) {
    const dbSortField = mapping[sortBy] || sortBy;
    const column = (table as any)[dbSortField];
    if (column) {
      query = query.orderBy(asc(column)) as any;
    }
  }

  if (limit) {
    query = query.limit(limit) as any;
  }

  const results = await query;
  return results.map((row) => toFrontendFormat(entityName, row as Record<string, unknown>));
}

/**
 * Filter records from an entity table
 */
export async function filterEntity(
  entityName: EntityName,
  filterQuery: Record<string, any>,
  sortBy?: string,
  limit?: number
): Promise<Record<string, unknown>[]> {
  const table = entityTableMap[entityName];
  if (!table) throw new Error(`Unknown entity: ${entityName}`);

  const mapping = fieldMappings[entityName] || {};
  const conditions = buildFilterConditions(table, entityName, filterQuery);

  let query = db.select().from(table);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  if (sortBy) {
    const dbSortField = mapping[sortBy] || sortBy;
    const column = (table as any)[dbSortField];
    if (column) {
      query = query.orderBy(asc(column)) as any;
    }
  }

  if (limit) {
    query = query.limit(limit) as any;
  }

  const results = await query;
  return results.map((row) => toFrontendFormat(entityName, row as Record<string, unknown>));
}

/**
 * Create a new record in an entity table
 */
export async function createEntity(entityName: EntityName, data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const table = entityTableMap[entityName];
  if (!table) throw new Error(`Unknown entity: ${entityName}`);

  // Remove id if present (auto-generated) - using destructuring to exclude fields
  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...restData } = data;
  const dbData = toDbFormat(entityName, restData);

  const [result] = await db
    .insert(table)
    .values(dbData as any)
    .returning();
  return toFrontendFormat(entityName, result as Record<string, unknown>);
}

/**
 * Bulk create records in an entity table
 */
export async function bulkCreateEntity(entityName: EntityName, dataArray: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
  const table = entityTableMap[entityName];
  if (!table) throw new Error(`Unknown entity: ${entityName}`);

  const dbDataArray = dataArray.map((data) => {
    // Remove auto-generated fields
    const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...restData } = data;
    return toDbFormat(entityName, restData);
  });

  const results = await db
    .insert(table)
    .values(dbDataArray as any)
    .returning();
  return results.map((row) => toFrontendFormat(entityName, row as Record<string, unknown>));
}

/**
 * Update a record in an entity table
 */
export async function updateEntity(entityName: EntityName, id: number | string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const table = entityTableMap[entityName];
  if (!table) throw new Error(`Unknown entity: ${entityName}`);

  // Remove id and created_at from update data
  const { id: _id, created_at: _createdAt, ...restData } = data;
  const dbData = {
    ...toDbFormat(entityName, restData),
    updatedAt: new Date(),
  };

  const numericId = typeof id === "string" ? parseInt(id, 10) : id;

  const [result] = await db
    .update(table)
    .set(dbData as any)
    .where(eq((table as any).id, numericId))
    .returning();

  if (!result) throw new Error(`${entityName} with id ${id} not found`);

  return toFrontendFormat(entityName, result as Record<string, unknown>);
}

/**
 * Delete a record from an entity table
 */
export async function deleteEntity(entityName: EntityName, id: number | string): Promise<void> {
  const table = entityTableMap[entityName];
  if (!table) throw new Error(`Unknown entity: ${entityName}`);

  const numericId = typeof id === "string" ? parseInt(id, 10) : id;

  const result = await db
    .delete(table)
    .where(eq((table as any).id, numericId))
    .returning();

  if (result.length === 0) {
    throw new Error(`${entityName} with id ${id} not found`);
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: number) {
  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  if (users.length === 0) {
    return null;
  }

  const user = users[0];

  // Convert database field names to API field names and handle decimals
  return {
    id: user.id,
    target_weight: Number(user.targetWeight),
    current_weight: Number(user.currentWeight),
    height: Number(user.height),
    gender: user.gender,
    activity_level: user.activityLevel,
    profile_image: user.profileImage,
    daily_water_goal_ml: user.dailyWaterGoal,
    daily_calorie_goal: user.dailyCalorieGoal,
    daily_steps_goal: user.dailyStepsGoal,
    created_at: user.createdAt?.toISOString(),
    updated_at: user.updatedAt?.toISOString(),
  };
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: number, data: any) {
  // Convert API field names to database field names
  const updateData: any = {};

  if (data.target_weight !== undefined) updateData.targetWeight = data.target_weight.toString();
  if (data.current_weight !== undefined) updateData.currentWeight = data.current_weight.toString();
  if (data.height !== undefined) updateData.height = data.height.toString();
  if (data.gender !== undefined) updateData.gender = data.gender;
  if (data.activity_level !== undefined) updateData.activityLevel = data.activity_level;
  if (data.profile_image !== undefined) updateData.profileImage = data.profile_image;
  if (data.daily_water_goal_ml !== undefined) updateData.dailyWaterGoal = data.daily_water_goal_ml;
  if (data.daily_calorie_goal !== undefined) updateData.dailyCalorieGoal = data.daily_calorie_goal;
  if (data.daily_steps_goal !== undefined) updateData.dailyStepsGoal = data.daily_steps_goal;

  updateData.updatedAt = new Date();

  const result = await db.update(usersTable).set(updateData).where(eq(usersTable.id, userId)).returning();

  if (result.length === 0) {
    throw new Error(`User with id ${userId} not found`);
  }

  const user = result[0];

  // Convert back to API format
  return {
    id: user.id,
    target_weight: Number(user.targetWeight),
    current_weight: Number(user.currentWeight),
    height: Number(user.height),
    gender: user.gender,
    activity_level: user.activityLevel,
    profile_image: user.profileImage,
    daily_water_goal_ml: user.dailyWaterGoal,
    daily_calorie_goal: user.dailyCalorieGoal,
    daily_steps_goal: user.dailyStepsGoal,
    created_at: user.createdAt?.toISOString(),
    updated_at: user.updatedAt?.toISOString(),
  };
}
