/**
 * Utility Functions Tests
 * Tests helper functions and calculations
 */

describe('Health Calculations', () => {
  describe('BMI Calculation', () => {
    const calculateBMI = (weightKg: number, heightCm: number): number => {
      const heightM = heightCm / 100;
      return weightKg / (heightM * heightM);
    };

    it('should calculate BMI correctly', () => {
      const bmi = calculateBMI(70, 170);
      expect(bmi).toBeCloseTo(24.22, 1);
    });

    it('should categorize BMI as underweight', () => {
      const bmi = calculateBMI(50, 170);
      expect(bmi).toBeLessThan(18.5);
    });

    it('should categorize BMI as normal weight', () => {
      const bmi = calculateBMI(70, 180);
      expect(bmi).toBeGreaterThanOrEqual(18.5);
      expect(bmi).toBeLessThan(25);
    });

    it('should categorize BMI as overweight', () => {
      const bmi = calculateBMI(85, 170);
      expect(bmi).toBeGreaterThanOrEqual(25);
      expect(bmi).toBeLessThan(30);
    });

    it('should categorize BMI as obese', () => {
      const bmi = calculateBMI(95, 170);
      expect(bmi).toBeGreaterThanOrEqual(30);
    });
  });

  describe('Calorie Calculations', () => {
    // BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
    const calculateBMR = (
      weight: number,
      height: number,
      age: number,
      gender: 'male' | 'female'
    ): number => {
      if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
      }
    };

    it('should calculate BMR for male', () => {
      const bmr = calculateBMR(80, 180, 30, 'male');
      expect(bmr).toBeCloseTo(1825, 0);
    });

    it('should calculate BMR for female', () => {
      const bmr = calculateBMR(65, 165, 28, 'female');
      expect(bmr).toBeCloseTo(1401.25, 0);
    });

    it('should calculate TDEE with activity level', () => {
      const bmr = calculateBMR(75, 175, 25, 'male');
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
      };

      const tdee = bmr * activityMultipliers.moderate;
      expect(tdee).toBeGreaterThan(bmr);
      expect(tdee).toBeCloseTo(2640, 0);
    });

    it('should calculate deficit for weight loss', () => {
      const tdee = 2500;
      const deficitPercent = 0.2; // 20% deficit
      const targetCalories = tdee * (1 - deficitPercent);

      expect(targetCalories).toBe(2000);
    });
  });

  describe('Macro Calculations', () => {
    it('should calculate macros from calories', () => {
      const proteinCalories = 120 * 4; // 120g protein * 4 cal/g
      const carbsCalories = 200 * 4; // 200g carbs * 4 cal/g
      const fatCalories = 60 * 9; // 60g fat * 9 cal/g

      const totalCalories = proteinCalories + carbsCalories + fatCalories;

      expect(totalCalories).toBe(2020);
    });

    it('should calculate macro percentages', () => {
      const totalCalories = 2000;
      const proteinCalories = 600; // 30%
      const carbsCalories = 800; // 40%
      const fatCalories = 600; // 30%

      const proteinPercent = (proteinCalories / totalCalories) * 100;
      const carbsPercent = (carbsCalories / totalCalories) * 100;
      const fatPercent = (fatCalories / totalCalories) * 100;

      expect(proteinPercent).toBe(30);
      expect(carbsPercent).toBe(40);
      expect(fatPercent).toBe(30);
      expect(proteinPercent + carbsPercent + fatPercent).toBe(100);
    });

    it('should calculate grams from calories', () => {
      const proteinCalories = 800;
      const proteinGrams = proteinCalories / 4;

      expect(proteinGrams).toBe(200);
    });
  });

  describe('Progress Calculations', () => {
    it('should calculate weight loss percentage', () => {
      const startWeight = 90;
      const currentWeight = 85;
      const weightLoss = startWeight - currentWeight;
      const lossPercentage = (weightLoss / startWeight) * 100;

      expect(lossPercentage).toBeCloseTo(5.56, 1);
    });

    it('should calculate remaining weight to goal', () => {
      const currentWeight = 85;
      const goalWeight = 75;
      const remaining = currentWeight - goalWeight;

      expect(remaining).toBe(10);
    });

    it('should calculate progress percentage to goal', () => {
      const startWeight = 90;
      const currentWeight = 85;
      const goalWeight = 75;

      const totalToLose = startWeight - goalWeight;
      const lostSoFar = startWeight - currentWeight;
      const progressPercent = (lostSoFar / totalToLose) * 100;

      expect(progressPercent).toBeCloseTo(33.33, 1);
    });
  });

  describe('Water Intake Calculations', () => {
    it('should calculate recommended water intake based on weight', () => {
      const weightKg = 70;
      const mlPerKg = 35; // Standard recommendation
      const recommendedWater = weightKg * mlPerKg;

      expect(recommendedWater).toBe(2450);
    });

    it('should adjust water intake for activity level', () => {
      const baseWater = 2500; // ml
      const workoutDuration = 60; // minutes
      const additionalWater = (workoutDuration / 30) * 250; // 250ml per 30 min

      const totalWater = baseWater + additionalWater;

      expect(totalWater).toBe(3000);
    });

    it('should calculate water intake progress', () => {
      const consumed = 1800;
      const goal = 2500;
      const progress = (consumed / goal) * 100;

      expect(progress).toBe(72);
    });
  });

  describe('Steps and Distance Calculations', () => {
    it('should calculate distance from steps', () => {
      const steps = 10000;
      const averageStrideLengthM = 0.75; // 75cm
      const distanceKm = (steps * averageStrideLengthM) / 1000;

      expect(distanceKm).toBe(7.5);
    });

    it('should estimate calories burned from steps', () => {
      const steps = 10000;
      const caloriesPerStep = 0.04; // Average
      const caloriesBurned = steps * caloriesPerStep;

      expect(caloriesBurned).toBe(400);
    });

    it('should calculate steps goal progress', () => {
      const currentSteps = 7500;
      const goal = 10000;
      const progress = (currentSteps / goal) * 100;

      expect(progress).toBe(75);
    });
  });

  describe('Date and Time Calculations', () => {
    it('should calculate days between dates', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-15');
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      expect(diffDays).toBe(14);
    });

    it('should calculate weeks in a tracking period', () => {
      const days = 28;
      const weeks = days / 7;

      expect(weeks).toBe(4);
    });

    it('should determine if date is today', () => {
      const today = new Date();
      const testDate = new Date();

      const isToday =
        today.getFullYear() === testDate.getFullYear() &&
        today.getMonth() === testDate.getMonth() &&
        today.getDate() === testDate.getDate();

      expect(isToday).toBe(true);
    });
  });
});

