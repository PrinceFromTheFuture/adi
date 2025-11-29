"use client";
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Plus, Trophy, Play, Square } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import WorkoutForm from "@/components/workouts/WorkoutForm";
import WorkoutsList from "@/components/workouts/WorkoutsList";
import WorkoutStats from "@/components/workouts/WorkoutStats";
import RestTimer from "@/components/workouts/RestTimer";

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null);

  const loadWorkouts = useCallback(async () => {
    try {
      const workoutsList = await base44.entities.Workout.list("-updated_date", 100);
      setWorkouts(workoutsList);

      // Check if there's an active workout
      const active = workoutsList.find((w) => w.is_active);
      setActiveWorkout(active || null);
    } catch (error) {
      console.error("Error loading workouts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const handleSubmit = async (workoutData) => {
    try {
      if (editingWorkout) {
        await base44.entities.Workout.update(editingWorkout.id, workoutData);
      } else {
        await base44.entities.Workout.create({
          ...workoutData,
          is_active: false,
        });
      }
      setShowForm(false);
      setEditingWorkout(null);
      loadWorkouts();
    } catch (error) {
      console.error("Error saving workout:", error);
    }
  };

  const handleEdit = (workout) => {
    setEditingWorkout(workout);
    setShowForm(true);
  };

  const handleDelete = async (workoutId) => {
    try {
      await base44.entities.Workout.delete(workoutId);
      loadWorkouts();
    } catch (error) {
      console.error("Error deleting workout:", error);
    }
  };

  const handleStartWorkout = async (workout) => {
    try {
      // Deactivate any other active workout
      if (activeWorkout && activeWorkout.id !== workout.id) {
        await base44.entities.Workout.update(activeWorkout.id, { is_active: false });
      }

      // Activate this workout
      await base44.entities.Workout.update(workout.id, { is_active: true });
      setActiveWorkout(workout);
      loadWorkouts();
    } catch (error) {
      console.error("Error starting workout:", error);
    }
  };

  const handleFinishWorkout = async (workout) => {
    try {
      // Create a session log
      await base44.entities.WorkoutSession.create({
        workout_id: workout.id,
        workout_name: workout.workout_name,
        session_date: format(new Date(), "yyyy-MM-dd"),
        duration_minutes: workout.duration_minutes,
        completed: true,
      });

      // Deactivate and update last performed date
      await base44.entities.Workout.update(workout.id, {
        is_active: false,
        last_performed: format(new Date(), "yyyy-MM-dd"),
      });

      setActiveWorkout(null);
      loadWorkouts();
    } catch (error) {
      console.error("Error finishing workout:", error);
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-3">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">תבניות האימונים שלי</span>
            <Dumbbell className="w-8 h-8 text-purple-600" />
          </h1>
          <p className="text-gray-600 text-base">התחילי אימון! 💪</p>
        </div>

        {/* Stats Overview */}
        <WorkoutStats workouts={workouts} />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Active Workout Alert */}
            {activeWorkout && (
              <Card className="card-hover bg-gradient-to-r from-green-100 to-emerald-100 shadow-xl ring-4 ring-green-300 animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-green-900 mb-1">🔥 אימון פעיל: {activeWorkout.workout_name}</h3>
                      <p className="text-green-700">עכשיו זה הזמן לשדרג את עצמך!</p>
                    </div>
                    <Button
                      onClick={() => handleFinishWorkout(activeWorkout)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                      size="lg"
                    >
                      <Square className="w-5 h-5 ml-2" />
                      סיים אימון
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Workout Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <WorkoutForm
                    workout={editingWorkout}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingWorkout(null);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Workouts List */}
            <WorkoutsList
              workouts={workouts}
              activeWorkout={activeWorkout}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStart={handleStartWorkout}
              onFinish={handleFinishWorkout}
              isLoading={isLoading}
            />

            {/* Add Workout Button - at the bottom */}
            {!activeWorkout && (
              <Card className="card-hover bg-gradient-to-r from-orange-100 to-red-100 shadow-xl ring-4 ring-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-orange-900 mb-1">צור תבנית אימון חדשה</h3>
                      <p className="text-sm text-orange-700">שמור את האימונים שלך!</p>
                    </div>
                    <Button
                      onClick={() => setShowForm(!showForm)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      תבנית חדשה
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rest Timer */}
            <RestTimer />

            <Card className="card-hover bg-gradient-to-br from-yellow-100 to-orange-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  טיפים לאימון
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white/60 rounded-lg">
                  <p className="text-sm font-medium text-orange-900">💪 תמיד התחמם לפני אימון</p>
                </div>
                <div className="p-3 bg-white/60 rounded-lg">
                  <p className="text-sm font-medium text-orange-900">💧 שתה הרבה מים</p>
                </div>
                <div className="p-3 bg-white/60 rounded-lg">
                  <p className="text-sm font-medium text-orange-900">📈 תעקוב אחרי ההתקדמות</p>
                </div>
                <div className="p-3 bg-white/60 rounded-lg">
                  <p className="text-sm font-medium text-orange-900">😴 תנוח מספיק בין אימונים</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
