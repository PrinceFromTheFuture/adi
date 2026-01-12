/**
 * Integration Tests for User Profile Management
 * Tests user profile operations and settings
 */

import { base44 } from '@/api/base44Client';

global.fetch = jest.fn();

describe('User Profile Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('User authentication and profile retrieval', () => {
    it('should fetch current user profile', async () => {
      const mockUser = {
        id: 1,
        email: 'john@test.com',
        full_name: 'John Doe',
        age: 30,
        gender: 'male',
        height: 180,
        current_weight: 80,
        target_weight: 75,
        activity_level: 'moderate',
        daily_calorie_goal: 2000,
        daily_water_goal: 2500,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const result = await base44.auth.me();

      expect(result.email).toBe('john@test.com');
      expect(result.full_name).toBe('John Doe');
      expect(result.current_weight).toBe(80);
    });

    it('should handle authentication errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await expect(base44.auth.me()).rejects.toThrow();
    });
  });

  describe('User updates profile information', () => {
    it('should update basic profile information', async () => {
      const updateData = {
        full_name: 'John Updated',
        age: 31,
        height: 182,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...updateData }),
      });

      const result = await base44.entities.User.update('1', updateData);

      expect(result.full_name).toBe('John Updated');
      expect(result.age).toBe(31);
    });

    it('should update weight goals', async () => {
      const updateData = {
        current_weight: 78,
        target_weight: 73,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...updateData }),
      });

      const result = await base44.entities.User.update('1', updateData);

      expect(result.current_weight).toBe(78);
      expect(result.target_weight).toBe(73);
    });

    it('should update activity level and calorie goals', async () => {
      const updateData = {
        activity_level: 'very_active',
        daily_calorie_goal: 2500,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...updateData }),
      });

      const result = await base44.entities.User.update('1', updateData);

      expect(result.activity_level).toBe('very_active');
      expect(result.daily_calorie_goal).toBe(2500);
    });

    it('should update water intake goal', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, daily_water_goal: 3000 }),
      });

      const result = await base44.entities.User.update('1', { daily_water_goal: 3000 });

      expect(result.daily_water_goal).toBe(3000);
    });
  });

  describe('Weight logging and tracking', () => {
    it('should log current weight', async () => {
      const weightLog = {
        weight: 79.5,
        log_date: '2024-01-15',
        body_fat_percentage: 18.5,
        muscle_mass: 32.5,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...weightLog }),
      });

      const result = await base44.entities.WeightLog.create(weightLog);

      expect(result.weight).toBe(79.5);
      expect(result.body_fat_percentage).toBe(18.5);
    });

    it('should fetch weight history', async () => {
      const mockWeightLogs = [
        { id: 1, weight: 80, log_date: '2024-01-10' },
        { id: 2, weight: 79.5, log_date: '2024-01-15' },
        { id: 3, weight: 79, log_date: '2024-01-20' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeightLogs,
      });

      const result = await base44.entities.WeightLog.list('-log_date', 100);

      expect(result).toHaveLength(3);
      expect(result[0].weight).toBe(80);
      expect(result[2].weight).toBe(79);
    });

    it('should calculate weight loss progress', async () => {
      const mockWeightLogs = [
        { id: 1, weight: 80, log_date: '2024-01-01' }, // Start
        { id: 2, weight: 78, log_date: '2024-01-30' }, // Current
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeightLogs,
      });

      const logs = await base44.entities.WeightLog.list('-log_date');
      const startWeight = logs[logs.length - 1].weight;
      const currentWeight = logs[0].weight;
      const weightLoss = startWeight - currentWeight;

      expect(weightLoss).toBe(2);
    });
  });

  describe('Profile image upload', () => {
    it('should update profile image URL', async () => {
      const imageUrl = 'https://example.com/profile.jpg';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, profile_image: imageUrl }),
      });

      const result = await base44.entities.User.update('1', { profile_image: imageUrl });

      expect(result.profile_image).toBe(imageUrl);
    });
  });

  describe('User preferences and settings', () => {
    it('should create daily reminder', async () => {
      const reminder = {
        reminder_type: 'water',
        reminder_time: '09:00',
        is_active: true,
        days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...reminder }),
      });

      const result = await base44.entities.DailyReminder.create(reminder);

      expect(result.reminder_type).toBe('water');
      expect(result.is_active).toBe(true);
    });

    it('should set rest days', async () => {
      const restDay = {
        rest_date: '2024-01-21',
        notes: 'Recovery day',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...restDay }),
      });

      const result = await base44.entities.RestDay.create(restDay);

      expect(result.rest_date).toBe('2024-01-21');
    });
  });
});

