/**
 * End-to-End User Workflow Tests
 * Tests complete user journeys through the application
 */

import { base44 } from '@/api/base44Client';

global.fetch = jest.fn();

describe('Complete User Workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Daily Health Tracking Workflow', () => {
    it('should complete a full day of health tracking', async () => {
      const userId = '1';
      const today = '2024-01-15';

      // 1. User logs morning weight
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          weight: 79.5,
          log_date: today,
          body_fat_percentage: 18.5,
        }),
      });

      const weightLog = await base44.entities.WeightLog.create({
        weight: 79.5,
        log_date: today,
        body_fat_percentage: 18.5,
      });

      expect(weightLog.weight).toBe(79.5);

      // 2. User logs breakfast
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          meal_type: 'breakfast',
          food_name: 'Oatmeal with Berries',
          calories: 350,
          meal_date: today,
        }),
      });

      const breakfast = await base44.entities.Meal.create({
        meal_type: 'breakfast',
        food_name: 'Oatmeal with Berries',
        calories: 350,
        protein: 12,
        carbs: 55,
        fat: 8,
        meal_date: today,
      });

      expect(breakfast.meal_type).toBe('breakfast');

      // 3. User logs water intake (morning)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, amount_ml: 500, log_date: today }),
      });

      await base44.entities.WaterLog.create({
        amount_ml: 500,
        log_date: today,
        log_time: '08:00:00',
      });

      // 4. User logs lunch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 2,
          meal_type: 'lunch',
          food_name: 'Chicken Salad',
          calories: 450,
          meal_date: today,
        }),
      });

      await base44.entities.Meal.create({
        meal_type: 'lunch',
        food_name: 'Chicken Salad',
        calories: 450,
        protein: 35,
        carbs: 30,
        fat: 15,
        meal_date: today,
      });

      // 5. User completes a workout
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          workout_name: 'Strength Training',
          session_date: today,
          duration_minutes: 60,
          calories_burned: 350,
        }),
      });

      const workoutSession = await base44.entities.WorkoutSession.create({
        workout_id: 1,
        workout_name: 'Strength Training',
        session_date: today,
        duration_minutes: 60,
        calories_burned: 350,
      });

      expect(workoutSession.calories_burned).toBe(350);

      // 6. User logs steps
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          steps_count: 10500,
          log_date: today,
          distance_km: 8,
        }),
      });

      await base44.entities.StepsLog.create({
        steps_count: 10500,
        log_date: today,
        distance_km: 8,
        calories_burned: 420,
      });

      // 7. User logs dinner
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 3,
          meal_type: 'dinner',
          food_name: 'Grilled Salmon with Vegetables',
          calories: 550,
          meal_date: today,
        }),
      });

      await base44.entities.Meal.create({
        meal_type: 'dinner',
        food_name: 'Grilled Salmon with Vegetables',
        calories: 550,
        protein: 40,
        carbs: 35,
        fat: 20,
        meal_date: today,
      });

      // 8. User logs evening water
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 2, amount_ml: 700, log_date: today }),
      });

      await base44.entities.WaterLog.create({
        amount_ml: 700,
        log_date: today,
        log_time: '20:00:00',
      });

      // Verify the workflow completed successfully
      expect(global.fetch).toHaveBeenCalledTimes(8);
    });
  });

  describe('Weekly Meal Planning Workflow', () => {
    it('should create and use meal templates for the week', async () => {
      // 1. User creates a saved meal template
      const savedMealData = {
        meal_name: 'My Favorite Breakfast',
        total_calories: 400,
        total_protein: 20,
        total_carbs: 50,
        total_fat: 12,
        items: [
          { food_name: 'Eggs', amount: 2, calories: 140 },
          { food_name: 'Whole Wheat Toast', amount: 2, calories: 160 },
          { food_name: 'Avocado', amount: 0.5, calories: 100 },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...savedMealData }),
      });

      const savedMeal = await base44.entities.SavedMeal.create(savedMealData);
      expect(savedMeal.meal_name).toBe('My Favorite Breakfast');

      // 2. User uses this template for multiple days
      const dates = ['2024-01-15', '2024-01-16', '2024-01-17'];

      for (const date of dates) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: Math.random(),
            meal_type: 'breakfast',
            food_name: savedMeal.meal_name,
            calories: savedMeal.total_calories,
            meal_date: date,
          }),
        });

        await base44.entities.Meal.create({
          meal_type: 'breakfast',
          food_name: savedMeal.meal_name,
          calories: savedMeal.total_calories,
          protein: savedMeal.total_protein,
          carbs: savedMeal.total_carbs,
          fat: savedMeal.total_fat,
          meal_date: date,
        });
      }

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Progress Tracking Workflow', () => {
    it('should track weight loss progress over time', async () => {
      // User logs weight over 4 weeks
      const weightLogs = [
        { weight: 85, log_date: '2024-01-01' }, // Week 1
        { weight: 84, log_date: '2024-01-08' }, // Week 2
        { weight: 82.5, log_date: '2024-01-15' }, // Week 3
        { weight: 81, log_date: '2024-01-22' }, // Week 4
      ];

      for (const log of weightLogs) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: Math.random(), ...log }),
        });

        await base44.entities.WeightLog.create(log);
      }

      // Fetch all weight logs
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => weightLogs.map((log, i) => ({ id: i + 1, ...log })),
      });

      const allLogs = await base44.entities.WeightLog.list('-log_date');

      const startWeight = allLogs[allLogs.length - 1].weight;
      const currentWeight = allLogs[0].weight;
      const totalWeightLoss = startWeight - currentWeight;
      const weeksTracked = allLogs.length;
      const avgWeeklyLoss = totalWeightLoss / weeksTracked;

      expect(totalWeightLoss).toBe(4); // Lost 4 kg
      expect(avgWeeklyLoss).toBe(1); // 1 kg per week on average
    });
  });

  describe('Workout Program Workflow', () => {
    it('should create workout program and track sessions', async () => {
      // 1. User creates multiple workout templates
      const workouts = [
        {
          workout_name: 'Upper Body Strength',
          workout_type: 'strength',
          duration_minutes: 45,
        },
        {
          workout_name: 'Lower Body Strength',
          workout_type: 'strength',
          duration_minutes: 45,
        },
        {
          workout_name: 'Cardio HIIT',
          workout_type: 'cardio',
          duration_minutes: 30,
        },
      ];

      for (let i = 0; i < workouts.length; i++) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: i + 1, ...workouts[i] }),
        });

        await base44.entities.Workout.create(workouts[i]);
      }

      // 2. User performs workouts throughout the week
      const sessions = [
        {
          workout_id: 1,
          workout_name: 'Upper Body Strength',
          session_date: '2024-01-15',
          duration_minutes: 50,
        },
        {
          workout_id: 3,
          workout_name: 'Cardio HIIT',
          session_date: '2024-01-16',
          duration_minutes: 35,
        },
        {
          workout_id: 2,
          workout_name: 'Lower Body Strength',
          session_date: '2024-01-18',
          duration_minutes: 48,
        },
      ];

      for (let i = 0; i < sessions.length; i++) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: i + 1, ...sessions[i] }),
        });

        await base44.entities.WorkoutSession.create(sessions[i]);
      }

      // 3. Calculate weekly workout stats
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => sessions.map((s, i) => ({ id: i + 1, ...s })),
      });

      const weeklySessions = await base44.entities.WorkoutSession.filter({
        session_date: { $gte: '2024-01-15', $lte: '2024-01-21' },
      });

      const totalWorkoutTime = weeklySessions.reduce((sum, s) => sum + s.duration_minutes, 0);

      expect(weeklySessions).toHaveLength(3);
      expect(totalWorkoutTime).toBe(133); // 50 + 35 + 48
    });
  });

  describe('Food Database Management Workflow', () => {
    it('should add custom foods and use them in meals', async () => {
      // 1. User adds custom food items
      const customFood = {
        food_name: 'My Protein Shake',
        calories_per_unit: 250,
        protein_per_unit: 30,
        carbs_per_unit: 20,
        fat_per_unit: 5,
        unit_type: 'serving',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...customFood }),
      });

      const foodItem = await base44.entities.FoodItem.create(customFood);

      expect(foodItem.food_name).toBe('My Protein Shake');

      // 2. User uses custom food in a meal
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          meal_type: 'snack',
          food_name: foodItem.food_name,
          calories: foodItem.calories_per_unit,
          protein: foodItem.protein_per_unit,
          meal_date: '2024-01-15',
        }),
      });

      const meal = await base44.entities.Meal.create({
        meal_type: 'snack',
        food_name: foodItem.food_name,
        calories: foodItem.calories_per_unit,
        protein: foodItem.protein_per_unit,
        carbs: foodItem.carbs_per_unit,
        fat: foodItem.fat_per_unit,
        meal_date: '2024-01-15',
      });

      expect(meal.food_name).toBe('My Protein Shake');
      expect(meal.calories).toBe(250);
    });
  });

  describe('Reminders and Scheduling Workflow', () => {
    it('should set up daily reminders and rest days', async () => {
      // 1. User creates water reminder
      const waterReminder = {
        reminder_type: 'water',
        reminder_time: '09:00',
        is_active: true,
        days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...waterReminder }),
      });

      await base44.entities.DailyReminder.create(waterReminder);

      // 2. User creates workout reminder
      const workoutReminder = {
        reminder_type: 'workout',
        reminder_time: '18:00',
        is_active: true,
        days_of_week: ['monday', 'wednesday', 'friday'],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 2, ...workoutReminder }),
      });

      await base44.entities.DailyReminder.create(workoutReminder);

      // 3. User schedules rest days
      const restDays = ['2024-01-20', '2024-01-21']; // Weekend

      for (const date of restDays) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: Math.random(),
            rest_date: date,
            notes: 'Weekend rest',
          }),
        });

        await base44.entities.RestDay.create({
          rest_date: date,
          notes: 'Weekend rest',
        });
      }

      expect(global.fetch).toHaveBeenCalled();
    });
  });
});

