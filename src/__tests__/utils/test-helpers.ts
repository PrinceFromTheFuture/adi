/**
 * Test Helper Utilities
 * Reusable functions and mocks for testing
 */

// Mock user data generator
export const createMockUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  full_name: 'Test User',
  age: 30,
  gender: 'male',
  height: 180,
  current_weight: 80,
  target_weight: 75,
  activity_level: 'moderate',
  daily_calorie_goal: 2000,
  daily_water_goal: 2500,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Mock meal data generator
export const createMockMeal = (overrides = {}) => ({
  id: 1,
  meal_type: 'breakfast',
  food_name: 'Oatmeal',
  calories: 350,
  protein: 12,
  carbs: 55,
  fat: 8,
  serving_size: '1 bowl',
  meal_date: '2024-01-15',
  meal_time: '08:00:00',
  created_at: '2024-01-15T08:00:00Z',
  updated_at: '2024-01-15T08:00:00Z',
  ...overrides,
});

// Mock workout data generator
export const createMockWorkout = (overrides = {}) => ({
  id: 1,
  workout_name: 'Full Body Strength',
  workout_type: 'strength',
  duration_minutes: 60,
  exercises: [],
  is_active: false,
  last_performed: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Mock workout session data generator
export const createMockWorkoutSession = (overrides = {}) => ({
  id: 1,
  workout_id: 1,
  workout_name: 'Full Body Strength',
  session_date: '2024-01-15',
  duration_minutes: 60,
  calories_burned: 350,
  performance_notes: '',
  created_at: '2024-01-15T10:00:00Z',
  ...overrides,
});

// Mock water log data generator
export const createMockWaterLog = (overrides = {}) => ({
  id: 1,
  amount_ml: 250,
  log_date: '2024-01-15',
  log_time: '09:00:00',
  created_at: '2024-01-15T09:00:00Z',
  ...overrides,
});

// Mock steps log data generator
export const createMockStepsLog = (overrides = {}) => ({
  id: 1,
  steps_count: 10000,
  log_date: '2024-01-15',
  distance_km: 7.5,
  calories_burned: 400,
  created_at: '2024-01-15T20:00:00Z',
  ...overrides,
});

// Mock weight log data generator
export const createMockWeightLog = (overrides = {}) => ({
  id: 1,
  weight: 80,
  log_date: '2024-01-15',
  body_fat_percentage: 18,
  muscle_mass: 32,
  created_at: '2024-01-15T07:00:00Z',
  ...overrides,
});

// Mock saved meal data generator
export const createMockSavedMeal = (overrides = {}) => ({
  id: 1,
  meal_name: 'My Favorite Breakfast',
  total_calories: 400,
  total_protein: 20,
  total_carbs: 50,
  total_fat: 12,
  items: [],
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Mock food item data generator
export const createMockFoodItem = (overrides = {}) => ({
  id: 1,
  food_name: 'Chicken Breast',
  calories_per_unit: 165,
  protein_per_unit: 31,
  carbs_per_unit: 0,
  fat_per_unit: 3.6,
  unit_type: '100g',
  default_amount: 100,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Mock API response helper
export const mockApiResponse = (data: any, ok = true) => ({
  ok,
  status: ok ? 200 : 500,
  json: async () => (ok ? data : { error: 'API Error' }),
  headers: new Headers({ 'Content-Type': 'application/json' }),
});

// Mock API error response helper
export const mockApiError = (message = 'API Error', status = 500) => ({
  ok: false,
  status,
  json: async () => ({ error: message }),
  headers: new Headers({ 'Content-Type': 'application/json' }),
});

// Setup fetch mock for successful response
export const setupFetchSuccess = (data: any) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(mockApiResponse(data, true));
};

// Setup fetch mock for error response
export const setupFetchError = (message?: string, status?: number) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(mockApiError(message, status));
};

// Generate date string
export const getDateString = (daysOffset = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

// Generate time string
export const getTimeString = (hour = 9, minute = 0): string => {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
};

// Calculate total calories from meals array
export const calculateTotalCalories = (meals: Array<{ calories: number }>): number => {
  return meals.reduce((sum, meal) => sum + meal.calories, 0);
};

// Calculate total macros from meals array
export const calculateTotalMacros = (
  meals: Array<{ protein?: number; carbs?: number; fat?: number }>
) => {
  return meals.reduce(
    (totals, meal) => ({
      protein: totals.protein + (meal.protein || 0),
      carbs: totals.carbs + (meal.carbs || 0),
      fat: totals.fat + (meal.fat || 0),
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );
};

// Wait for async operations
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Create multiple mock items
export const createMockArray = <T>(
  generator: (overrides?: any) => T,
  count: number,
  overridesArray?: Array<Partial<T>>
): T[] => {
  return Array.from({ length: count }, (_, i) => generator(overridesArray?.[i] || { id: i + 1 }));
};

// Batch mock meals for a week
export const createWeekOfMeals = (startDate: string): any[] => {
  const meals = [];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  for (let day = 0; day < 7; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    const dateString = date.toISOString().split('T')[0];

    mealTypes.forEach((type, index) => {
      meals.push(
        createMockMeal({
          id: day * 4 + index + 1,
          meal_type: type,
          meal_date: dateString,
        })
      );
    });
  }

  return meals;
};

// Batch mock workout sessions for a month
export const createMonthOfWorkouts = (startDate: string, sessionsPerWeek = 3): any[] => {
  const sessions = [];
  const workoutNames = [
    'Upper Body Strength',
    'Lower Body Strength',
    'Cardio HIIT',
    'Full Body',
  ];

  for (let week = 0; week < 4; week++) {
    for (let session = 0; session < sessionsPerWeek; session++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + week * 7 + session * 2);
      const dateString = date.toISOString().split('T')[0];

      sessions.push(
        createMockWorkoutSession({
          id: week * sessionsPerWeek + session + 1,
          workout_name: workoutNames[session % workoutNames.length],
          session_date: dateString,
        })
      );
    }
  }

  return sessions;
};

// Create weight log progression
export const createWeightProgression = (
  startWeight: number,
  targetWeight: number,
  weeks: number,
  startDate: string
): any[] => {
  const logs = [];
  const totalLoss = startWeight - targetWeight;
  const lossPerWeek = totalLoss / weeks;

  for (let week = 0; week < weeks; week++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + week * 7);
    const dateString = date.toISOString().split('T')[0];
    const weight = startWeight - lossPerWeek * week;

    logs.push(
      createMockWeightLog({
        id: week + 1,
        weight: Math.round(weight * 10) / 10,
        log_date: dateString,
      })
    );
  }

  return logs;
};

// Assert array contains object with properties
export const expectArrayContains = (array: any[], properties: Record<string, any>) => {
  const found = array.some((item) =>
    Object.entries(properties).every(([key, value]) => item[key] === value)
  );
  expect(found).toBe(true);
};

// Assert response structure
export const expectValidResponse = (response: any, requiredFields: string[]) => {
  expect(response).toBeDefined();
  requiredFields.forEach((field) => {
    expect(response).toHaveProperty(field);
  });
};

// Mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
};

// Mock console methods
export const mockConsole = () => {
  const originalConsole = { ...console };

  return {
    mock: () => {
      console.log = jest.fn();
      console.error = jest.fn();
      console.warn = jest.fn();
    },
    restore: () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
    },
  };
};

