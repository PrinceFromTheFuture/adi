/**
 * Integration Tests for Water and Steps Tracking
 * Tests daily water intake and step counting features
 */

import { base44 } from '@/api/base44Client';

global.fetch = jest.fn();

describe('Water and Steps Tracking Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Water Intake Tracking', () => {
    it('should log water intake', async () => {
      const waterLog = {
        amount_ml: 250,
        log_date: '2024-01-15',
        log_time: '09:30:00',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...waterLog }),
      });

      const result = await base44.entities.WaterLog.create(waterLog);

      expect(result.amount_ml).toBe(250);
      expect(result.log_date).toBe('2024-01-15');
    });

    it('should fetch water logs for a specific date', async () => {
      const mockWaterLogs = [
        { id: 1, amount_ml: 250, log_date: '2024-01-15', log_time: '09:00:00' },
        { id: 2, amount_ml: 500, log_date: '2024-01-15', log_time: '12:00:00' },
        { id: 3, amount_ml: 300, log_date: '2024-01-15', log_time: '15:00:00' },
        { id: 4, amount_ml: 400, log_date: '2024-01-15', log_time: '18:00:00' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaterLogs,
      });

      const result = await base44.entities.WaterLog.filter({ log_date: '2024-01-15' });

      expect(result).toHaveLength(4);
    });

    it('should calculate total water intake for the day', async () => {
      const mockWaterLogs = [
        { id: 1, amount_ml: 250 },
        { id: 2, amount_ml: 500 },
        { id: 3, amount_ml: 300 },
        { id: 4, amount_ml: 400 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaterLogs,
      });

      const logs = await base44.entities.WaterLog.filter({ log_date: '2024-01-15' });
      const totalWater = logs.reduce((sum, log) => sum + log.amount_ml, 0);

      expect(totalWater).toBe(1450);
    });

    it('should calculate water goal progress percentage', async () => {
      const dailyGoal = 2500; // ml
      const mockWaterLogs = [{ id: 1, amount_ml: 1500 }];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWaterLogs,
      });

      const logs = await base44.entities.WaterLog.filter({ log_date: '2024-01-15' });
      const totalWater = logs.reduce((sum, log) => sum + log.amount_ml, 0);
      const progressPercent = (totalWater / dailyGoal) * 100;

      expect(progressPercent).toBe(60);
    });

    it('should delete water log entry', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await expect(base44.entities.WaterLog.delete('1')).resolves.not.toThrow();
    });

    it('should fetch water intake history for the week', async () => {
      const mockWeeklyLogs = [
        { id: 1, amount_ml: 2000, log_date: '2024-01-15' },
        { id: 2, amount_ml: 2200, log_date: '2024-01-16' },
        { id: 3, amount_ml: 1800, log_date: '2024-01-17' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeeklyLogs,
      });

      const result = await base44.entities.WaterLog.filter({
        log_date: { $gte: '2024-01-15', $lte: '2024-01-21' },
      });

      expect(result).toHaveLength(3);
    });
  });

  describe('Steps Tracking', () => {
    it('should log daily steps', async () => {
      const stepsLog = {
        steps_count: 8500,
        log_date: '2024-01-15',
        distance_km: 6.5,
        calories_burned: 350,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...stepsLog }),
      });

      const result = await base44.entities.StepsLog.create(stepsLog);

      expect(result.steps_count).toBe(8500);
      expect(result.distance_km).toBe(6.5);
      expect(result.calories_burned).toBe(350);
    });

    it('should fetch steps for a specific date', async () => {
      const mockStepsLog = {
        id: 1,
        steps_count: 10000,
        log_date: '2024-01-15',
        distance_km: 7.5,
        calories_burned: 400,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockStepsLog],
      });

      const result = await base44.entities.StepsLog.filter({ log_date: '2024-01-15' });

      expect(result[0].steps_count).toBe(10000);
    });

    it('should calculate steps goal progress', async () => {
      const dailyStepsGoal = 10000;
      const mockStepsLog = { id: 1, steps_count: 7500, log_date: '2024-01-15' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockStepsLog],
      });

      const logs = await base44.entities.StepsLog.filter({ log_date: '2024-01-15' });
      const totalSteps = logs.reduce((sum, log) => sum + log.steps_count, 0);
      const progressPercent = (totalSteps / dailyStepsGoal) * 100;

      expect(progressPercent).toBe(75);
      expect(totalSteps).toBeLessThan(dailyStepsGoal);
    });

    it('should handle step goal achievement', async () => {
      const dailyStepsGoal = 10000;
      const mockStepsLog = { id: 1, steps_count: 12500, log_date: '2024-01-15' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockStepsLog],
      });

      const logs = await base44.entities.StepsLog.filter({ log_date: '2024-01-15' });
      const totalSteps = logs.reduce((sum, log) => sum + log.steps_count, 0);
      const goalAchieved = totalSteps >= dailyStepsGoal;

      expect(goalAchieved).toBe(true);
      expect(totalSteps).toBeGreaterThan(dailyStepsGoal);
    });

    it('should update steps count', async () => {
      const updatedSteps = {
        id: 1,
        steps_count: 15000,
        distance_km: 11.25,
        calories_burned: 600,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedSteps,
      });

      const result = await base44.entities.StepsLog.update('1', {
        steps_count: 15000,
        distance_km: 11.25,
        calories_burned: 600,
      });

      expect(result.steps_count).toBe(15000);
    });

    it('should fetch weekly steps summary', async () => {
      const mockWeeklySteps = [
        { id: 1, steps_count: 10000, log_date: '2024-01-15' },
        { id: 2, steps_count: 12000, log_date: '2024-01-16' },
        { id: 3, steps_count: 8000, log_date: '2024-01-17' },
        { id: 4, steps_count: 11000, log_date: '2024-01-18' },
        { id: 5, steps_count: 9500, log_date: '2024-01-19' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeeklySteps,
      });

      const result = await base44.entities.StepsLog.filter({
        log_date: { $gte: '2024-01-15', $lte: '2024-01-21' },
      });

      const totalSteps = result.reduce((sum, log) => sum + log.steps_count, 0);
      const averageSteps = totalSteps / result.length;

      expect(result).toHaveLength(5);
      expect(totalSteps).toBe(50500);
      expect(averageSteps).toBe(10100);
    });
  });

  describe('Combined Water and Steps Tracking', () => {
    it('should fetch both water and steps data for dashboard', async () => {
      const mockWaterLogs = [{ id: 1, amount_ml: 2000, log_date: '2024-01-15' }];
      const mockStepsLogs = [{ id: 1, steps_count: 10000, log_date: '2024-01-15' }];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWaterLogs,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStepsLogs,
        });

      const [waterLogs, stepsLogs] = await Promise.all([
        base44.entities.WaterLog.filter({ log_date: '2024-01-15' }),
        base44.entities.StepsLog.filter({ log_date: '2024-01-15' }),
      ]);

      const totalWater = waterLogs.reduce((sum, log) => sum + log.amount_ml, 0);
      const totalSteps = stepsLogs.reduce((sum, log) => sum + log.steps_count, 0);

      expect(totalWater).toBe(2000);
      expect(totalSteps).toBe(10000);
    });
  });
});

