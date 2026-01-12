/**
 * Integration Tests for Workout Tracking Feature
 * Tests the complete workout tracking workflow
 */

import { base44 } from '@/api/base44Client';

global.fetch = jest.fn();

describe('Workout Tracking Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('User creates a workout template', () => {
    it('should create a new workout template', async () => {
      const newWorkout = {
        workout_name: 'Full Body Strength',
        workout_type: 'strength',
        duration_minutes: 60,
        exercises: [
          { name: 'Squats', sets: 4, reps: 12 },
          { name: 'Bench Press', sets: 4, reps: 10 },
          { name: 'Deadlifts', sets: 3, reps: 8 },
        ],
        is_active: false,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...newWorkout, created_at: new Date().toISOString() }),
      });

      const result = await base44.entities.Workout.create(newWorkout);

      expect(result.workout_name).toBe('Full Body Strength');
      expect(result.id).toBeDefined();
    });

    it('should validate workout data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Duration must be positive' }),
      });

      await expect(
        base44.entities.Workout.create({
          workout_name: 'Test',
          duration_minutes: -30, // Invalid
        })
      ).rejects.toThrow();
    });
  });

  describe('User starts a workout', () => {
    it('should mark workout as active', async () => {
      const workoutId = '1';
      const updatedWorkout = {
        id: 1,
        workout_name: 'Full Body Strength',
        is_active: true,
        duration_minutes: 60,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedWorkout,
      });

      const result = await base44.entities.Workout.update(workoutId, { is_active: true });

      expect(result.is_active).toBe(true);
    });

    it('should deactivate other workouts when starting a new one', async () => {
      // First, deactivate existing workout
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, is_active: false }),
      });

      await base44.entities.Workout.update('1', { is_active: false });

      // Then, activate new workout
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 2, is_active: true }),
      });

      const result = await base44.entities.Workout.update('2', { is_active: true });

      expect(result.is_active).toBe(true);
    });
  });

  describe('User completes a workout', () => {
    it('should create a workout session log', async () => {
      const sessionData = {
        workout_id: 1,
        workout_name: 'Full Body Strength',
        session_date: '2024-01-15',
        duration_minutes: 65,
        calories_burned: 350,
        performance_notes: 'Great session! Increased weight on squats.',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...sessionData, created_at: new Date().toISOString() }),
      });

      const result = await base44.entities.WorkoutSession.create(sessionData);

      expect(result.workout_id).toBe(1);
      expect(result.duration_minutes).toBe(65);
      expect(result.calories_burned).toBe(350);
    });

    it('should update last performed date on workout', async () => {
      const today = '2024-01-15';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          workout_name: 'Full Body Strength',
          last_performed: today,
          is_active: false,
        }),
      });

      const result = await base44.entities.Workout.update('1', {
        last_performed: today,
        is_active: false,
      });

      expect(result.last_performed).toBe(today);
      expect(result.is_active).toBe(false);
    });
  });

  describe('User views workout history', () => {
    it('should fetch all workout sessions', async () => {
      const mockSessions = [
        {
          id: 1,
          workout_name: 'Full Body Strength',
          session_date: '2024-01-15',
          duration_minutes: 60,
        },
        {
          id: 2,
          workout_name: 'Cardio HIIT',
          session_date: '2024-01-14',
          duration_minutes: 30,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSessions,
      });

      const result = await base44.entities.WorkoutSession.list();

      expect(result).toHaveLength(2);
      expect(result[0].workout_name).toBe('Full Body Strength');
    });

    it('should filter sessions by date range', async () => {
      const mockSessions = [
        { id: 1, session_date: '2024-01-15', duration_minutes: 60 },
        { id: 2, session_date: '2024-01-16', duration_minutes: 45 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSessions,
      });

      const result = await base44.entities.WorkoutSession.filter({
        session_date: { $gte: '2024-01-15', $lte: '2024-01-16' },
      });

      expect(result).toHaveLength(2);
    });

    it('should calculate total workout time for the week', async () => {
      const mockSessions = [
        { id: 1, duration_minutes: 60 },
        { id: 2, duration_minutes: 45 },
        { id: 3, duration_minutes: 30 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSessions,
      });

      const sessions = await base44.entities.WorkoutSession.list();
      const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);

      expect(totalMinutes).toBe(135);
    });
  });

  describe('User manages workout templates', () => {
    it('should list all workout templates', async () => {
      const mockWorkouts = [
        { id: 1, workout_name: 'Strength Training', duration_minutes: 60 },
        { id: 2, workout_name: 'Cardio', duration_minutes: 30 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkouts,
      });

      const result = await base44.entities.Workout.list();

      expect(result).toHaveLength(2);
    });

    it('should update workout template', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          workout_name: 'Updated Workout',
          duration_minutes: 70,
        }),
      });

      const result = await base44.entities.Workout.update('1', {
        workout_name: 'Updated Workout',
        duration_minutes: 70,
      });

      expect(result.workout_name).toBe('Updated Workout');
      expect(result.duration_minutes).toBe(70);
    });

    it('should delete workout template', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await expect(base44.entities.Workout.delete('1')).resolves.not.toThrow();
    });
  });
});

