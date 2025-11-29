"use client";
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createPageUrl } from "@/utils";
import { Calendar, TrendingUp, Target, Flame, Apple, Dumbbell, Heart, Trophy, Plus, Sparkles, Sun, Smile } from "lucide-react";
import { format } from "date-fns";

import WelcomeCard from "@/components/dashboard/WelcomeCard";
import TodayStats from "@/components/dashboard/TodayStats";
import QuickActions from "@/components/dashboard/QuickActions";
import ProgressOverview from "@/components/dashboard/ProgressOverview";
import UpcomingSchedule from "@/components/dashboard/UpcomingSchedule";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [todayMeals, setTodayMeals] = useState([]);
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [todayWater, setTodayWater] = useState(0);
  const [todaySteps, setTodaySteps] = useState(0); // Added new state variable
  const [recentWeight, setRecentWeight] = useState(null);
  const [startWeight, setStartWeight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const currentUser = await base44.auth.me();
      const today = format(new Date(), "yyyy-MM-dd");

      const [meals, workouts, weights, waterLogs, stepsLogs] = await Promise.all([
        base44.entities.Meal.filter({ meal_date: today }),
        base44.entities.WorkoutSession.filter({ session_date: today }), // Changed from Workout to WorkoutSession
        base44.entities.WeightLog.list("-log_date", 100),
        base44.entities.WaterLog.filter({ log_date: today }),
        base44.entities.StepsLog.filter({ log_date: today }), // Added stepsLogs fetch
      ]);

      const totalWater = waterLogs.reduce((sum, log) => sum + (log.amount_ml || 0), 0);
      const totalSteps = stepsLogs.reduce((sum, log) => sum + (log.steps_count || 0), 0); // Calculate total steps

      // Get start weight (oldest record)
      const oldestWeight = weights.length > 0 ? weights[weights.length - 1] : null;

      setUser(currentUser);
      setTodayMeals(meals);
      setTodayWorkout(workouts[0] || null);
      setRecentWeight(weights[0] || null);
      setStartWeight(oldestWeight);
      setTodayWater(totalWater);
      setTodaySteps(totalSteps); // Set total steps
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const calculateTodayCalories = () => {
    return todayMeals.reduce((total, meal) => total + (meal.calories || 0), 0);
  };

  const getMealProgress = () => {
    const mealTypes = ["breakfast", "lunch", "dinner"];
    return mealTypes.map((type) => ({
      type,
      logged: todayMeals.some((meal) => meal.meal_type === type),
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="max-w-7xl mx-auto grid gap-6">
          <div className="h-48 bg-green-200 rounded-2xl"></div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="h-32 bg-green-200 rounded-xl"></div>
            <div className="h-32 bg-green-200 rounded-xl"></div>
            <div className="h-32 bg-green-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <WelcomeCard user={user} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TodayStats
              caloriesConsumed={calculateTodayCalories()}
              calorieGoal={user?.daily_calorie_goal || 2000}
              mealsProgress={getMealProgress()}
              workoutCompleted={todayWorkout?.completed || false}
              currentWeight={recentWeight?.weight}
              startWeight={startWeight?.weight}
              waterConsumed={todayWater}
              waterGoal={user?.daily_water_goal_ml || 2000}
              stepsToday={todaySteps} // Added new prop
              stepsGoal={user?.daily_steps_goal || 10000} // Added new prop
            />

            <QuickActions />
          </div>

          <div className="space-y-6">
            <ProgressOverview user={user} recentWeight={recentWeight} />
            <UpcomingSchedule />
          </div>
        </div>
      </div>
    </div>
  );
}
