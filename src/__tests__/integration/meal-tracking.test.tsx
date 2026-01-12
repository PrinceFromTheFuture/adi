/**
 * Integration Tests for Meal Tracking Feature
 * Tests the complete meal tracking workflow from the user perspective
 */

import { base44 } from '@/api/base44Client';

// Mock fetch
global.fetch = jest.fn();

describe('Meal Tracking Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('User creates a meal', () => {
    it('should successfully create a breakfast meal', async () => {
      const newMeal = {
        meal_type: 'breakfast',
        food_name: 'Oatmeal with Berries',
        calories: 350,
        protein: 12,
        carbs: 55,
        fat: 8,
        serving_size: '1 bowl',
        meal_date: '2024-01-15',
      };

      const mockResponse = {
        id: 1,
        ...newMeal,
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await base44.entities.Meal.create(newMeal);

      expect(global.fetch).toHaveBeenCalledWith('/api/entities/Meal', expect.any(Object));
      expect(result).toMatchObject(newMeal);
      expect(result.id).toBeDefined();
    });

    it('should handle meal creation errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Validation error' }),
      });

      await expect(
        base44.entities.Meal.create({
          meal_type: 'breakfast',
          food_name: '',
          calories: -100, // Invalid
        })
      ).rejects.toThrow();
    });
  });

  describe('User views their meals', () => {
    it('should fetch meals for a specific date', async () => {
      const mockMeals = [
        {
          id: 1,
          meal_type: 'breakfast',
          food_name: 'Oatmeal',
          calories: 350,
          meal_date: '2024-01-15',
        },
        {
          id: 2,
          meal_type: 'lunch',
          food_name: 'Chicken Salad',
          calories: 450,
          meal_date: '2024-01-15',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMeals,
      });

      const result = await base44.entities.Meal.filter({ meal_date: '2024-01-15' });

      expect(result).toHaveLength(2);
      expect(result[0].meal_type).toBe('breakfast');
      expect(result[1].meal_type).toBe('lunch');
    });

    it('should calculate total calories for the day', async () => {
      const mockMeals = [
        { id: 1, calories: 350, meal_date: '2024-01-15' },
        { id: 2, calories: 450, meal_date: '2024-01-15' },
        { id: 3, calories: 550, meal_date: '2024-01-15' },
        { id: 4, calories: 200, meal_date: '2024-01-15' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMeals,
      });

      const meals = await base44.entities.Meal.filter({ meal_date: '2024-01-15' });
      const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

      expect(totalCalories).toBe(1550);
    });
  });

  describe('User updates a meal', () => {
    it('should successfully update meal information', async () => {
      const updatedMeal = {
        id: 1,
        food_name: 'Oatmeal with Honey',
        calories: 380,
        protein: 12,
        carbs: 60,
        fat: 8,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedMeal,
      });

      const result = await base44.entities.Meal.update('1', {
        food_name: 'Oatmeal with Honey',
        calories: 380,
      });

      expect(result.food_name).toBe('Oatmeal with Honey');
      expect(result.calories).toBe(380);
    });
  });

  describe('User deletes a meal', () => {
    it('should successfully delete a meal', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await expect(base44.entities.Meal.delete('1')).resolves.not.toThrow();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/entities/Meal'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('User creates a saved meal template', () => {
    it('should create a saved meal with multiple food items', async () => {
      const savedMeal = {
        meal_name: 'My Favorite Breakfast',
        total_calories: 500,
        total_protein: 25,
        total_carbs: 60,
        total_fat: 15,
        items: [
          { food_name: 'Eggs', amount: 2 },
          { food_name: 'Toast', amount: 2 },
          { food_name: 'Avocado', amount: 0.5 },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...savedMeal }),
      });

      const result = await base44.entities.SavedMeal.create(savedMeal);

      expect(result.meal_name).toBe('My Favorite Breakfast');
      expect(result.total_calories).toBe(500);
    });

    it('should list all saved meal templates', async () => {
      const mockSavedMeals = [
        { id: 1, meal_name: 'Breakfast A', total_calories: 400 },
        { id: 2, meal_name: 'Breakfast B', total_calories: 500 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSavedMeals,
      });

      const result = await base44.entities.SavedMeal.list();

      expect(result).toHaveLength(2);
    });
  });

  describe('Bulk meal operations', () => {
    it('should bulk create multiple meals at once', async () => {
      const meals = [
        {
          meal_type: 'breakfast',
          food_name: 'Meal 1',
          calories: 300,
          meal_date: '2024-01-15',
        },
        {
          meal_type: 'lunch',
          food_name: 'Meal 2',
          calories: 500,
          meal_date: '2024-01-15',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => meals.map((m, i) => ({ id: i + 1, ...m })),
      });

      const result = await base44.entities.Meal.bulkCreate(meals);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBeDefined();
      expect(result[1].id).toBeDefined();
    });
  });
});

