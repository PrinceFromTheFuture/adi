# Base44 Entity Manager

This directory contains the Base44 client configuration with mock entity managers for development and testing.

## Overview

Each entity follows a consistent interface with the following methods:

- `list(sortBy?, limit?)`: List all entities with optional sorting and limiting
- `filter(query, sortBy?, limit?)`: Filter entities based on query criteria
- `create(data)`: Create a new entity
- `bulkCreate(dataArray)`: Create multiple entities at once
- `update(id, data)`: Update an existing entity
- `delete(id)`: Delete an entity
- `schema()`: Get the JSON schema for the entity

## Available Entities

1. **User** - User profile and settings
2. **SavedMeal** - Saved meal templates
3. **FoodItem** - Individual food items with nutritional info
4. **WorkoutSession** - Completed workout sessions
5. **StepsLog** - Daily steps tracking
6. **DailyReminder** - Reminder configurations
7. **FoodDatabase** - General food database
8. **WaterLog** - Water intake tracking
9. **RestDay** - Rest day records
10. **WeightLog** - Weight measurements over time
11. **Workout** - Workout templates
12. **Meal** - Meal logs

## Usage Examples

### Basic List Operation

```typescript
import { entities } from '@/api/base44Client';

// List all users
const users = await entities.User.list();

// List first 5 workouts sorted by last_performed
const workouts = await entities.Workout.list('last_performed', 5);
```

### Filtering

```typescript
import { entities } from '@/api/base44Client';

// Filter meals by date
const todaysMeals = await entities.Meal.filter({
  meal_date: '2024-02-20'
});

// Filter water logs with operators
const morningWater = await entities.WaterLog.filter({
  log_date: '2024-02-20',
  log_time: { $gte: '06:00', $lt: '12:00' }
});

// Filter workouts by type
const strengthWorkouts = await entities.Workout.filter({
  workout_type: 'כוח'
});
```

### Creating Entities

```typescript
import { entities } from '@/api/base44Client';

// Create a new meal
const newMeal = await entities.Meal.create({
  meal_type: 'breakfast',
  food_name: 'Oatmeal',
  calories: 300,
  protein: 10,
  carbs: 50,
  fat: 5,
  serving_size: '1 bowl',
  meal_date: '2024-02-23',
  meal_time: '08:00'
});

// Create a new water log
const waterLog = await entities.WaterLog.create({
  amount_ml: 500,
  log_date: '2024-02-23',
  log_time: '10:00'
});
```

### Bulk Create

```typescript
import { entities } from '@/api/base44Client';

// Create multiple food items at once
const foodItems = await entities.FoodItem.bulkCreate([
  {
    name: 'Banana',
    category: 'carb',
    calories_per_unit: 89,
    protein_per_unit: 1.1,
    carbs_per_unit: 23,
    fat_per_unit: 0.3,
    unit_type: 'piece',
    default_amount: 1
  },
  {
    name: 'Almonds',
    category: 'addition',
    calories_per_unit: 7,
    protein_per_unit: 0.26,
    carbs_per_unit: 0.24,
    fat_per_unit: 0.61,
    unit_type: 'piece',
    default_amount: 10
  }
]);
```

### Updating Entities

```typescript
import { entities } from '@/api/base44Client';

// Update a user's weight
const updatedUser = await entities.User.update('user1', {
  current_weight: 83.5
});

// Update workout notes
const updatedWorkout = await entities.Workout.update('workout1', {
  notes: 'Added extra set on last exercise'
});
```

### Deleting Entities

```typescript
import { entities } from '@/api/base44Client';

// Delete a meal
await entities.Meal.delete('meal_log1');

// Delete a water log
await entities.WaterLog.delete('water1');
```

### Getting Entity Schema

```typescript
import { entities } from '@/api/base44Client';

// Get the schema for User entity
const userSchema = await entities.User.schema();
console.log(userSchema);
```

## Query Operators

When filtering, you can use the following operators:

- `$gt`: Greater than
- `$gte`: Greater than or equal
- `$lt`: Less than
- `$lte`: Less than or equal
- `$ne`: Not equal
- `$in`: Value in array

Example:

```typescript
// Find all weight logs above 80kg
const heavyWeights = await entities.WeightLog.filter({
  weight: { $gt: 80 }
});

// Find workouts with intensity in specific levels
const intenseWorkouts = await entities.Workout.filter({
  intensity: { $in: ['גבוהה', 'בינונית'] }
});
```

## Type Safety

All entities are fully typed. Import the types as needed:

```typescript
import { 
  type User, 
  type Meal, 
  type Workout,
  type WaterLog 
} from '@/api/base44Client';

const user: User = {
  id: 'user1',
  target_weight: 75,
  current_weight: 80,
  height: 175,
  gender: 'male',
  activity_level: 'moderately_active',
  profile_image: 'https://example.com/avatar.jpg',
  daily_water_goal: 2500,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};
```

## Mock Data

The mock data is located in `mockData.ts` and includes sample data for all entities. This data is used for development and testing purposes. In production, these entity managers should be replaced with actual API calls to the Base44 backend.

## Notes

- All entities automatically get `id`, `created_at`, and `updated_at` fields
- IDs are generated in the format: `{entityName}_{timestamp}_{random}`
- Data persists in memory during the session but resets on page reload
- The auth override is commented out due to type compatibility issues with the Base44 SDK

