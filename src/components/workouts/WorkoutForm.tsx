"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Save, XCircle, Plus, Trash2, Image as ImageIcon, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function WorkoutForm({ workout, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    workout_name: workout?.workout_name || "",
    workout_type: workout?.workout_type || "כוח",
    duration_minutes: workout?.duration_minutes || "",
    intensity: workout?.intensity || "בינונית",
    exercises: workout?.exercises || [],
    notes: workout?.notes || "",
  });

  const [uploadingImage, setUploadingImage] = useState(null);
  const [previousWorkouts, setPreviousWorkouts] = useState([]);

  useEffect(() => {
    // Load previous workouts to get exercise history
    const loadPreviousWorkouts = async () => {
      try {
        const response = await fetch("/api/entities/Workout?sortBy=-workout_date&limit=50");
        if (!response.ok) {
          throw new Error("Failed to load workouts");
        }
        const workouts = await response.json();
        setPreviousWorkouts(workouts);
      } catch (error) {
        console.error("Error loading previous workouts:", error);
      }
    };
    loadPreviousWorkouts();
  }, []);

  const getLastWeightForExercise = (exerciseName) => {
    // Find the most recent workout that has this exercise
    for (const w of previousWorkouts) {
      if (w.exercises) {
        const exercise = w.exercises.find((ex) => ex.exercise_name === exerciseName);
        if (exercise) {
          return exercise.weight;
        }
      }
    }
    return 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddExercise = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exercise_name: "",
          sets: 3,
          reps: 10,
          weight: 0,
          rest_time: "60 שניות",
          target_muscles: [],
          image_url: "",
          weight_progress: 0,
        },
      ],
    }));
  };

  const handleRemoveExercise = (index) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const handleExerciseChange = (index, field, value) => {
    setFormData((prev) => {
      const newExercises = [...prev.exercises];
      const exercise = { ...newExercises[index] };

      // If changing exercise name, auto-fill with last weight
      if (field === "exercise_name" && value) {
        const lastWeight = getLastWeightForExercise(value);
        if (lastWeight > 0) {
          exercise.weight = lastWeight;
          // Show a notification that we auto-filled
          setTimeout(() => {
            const badge = document.getElementById(`exercise-${index}-badge`);
            if (badge) badge.classList.add("animate-pulse");
          }, 100);
        }
      }

      // Calculate weight progress when weight changes
      if (field === "weight" && exercise.exercise_name) {
        const lastWeight = getLastWeightForExercise(exercise.exercise_name);
        const currentWeight = Number(value) || 0;
        exercise.weight_progress = Math.max(0, currentWeight - lastWeight);
      }

      exercise[field] = value;
      newExercises[index] = exercise;

      return { ...prev, exercises: newExercises };
    });
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;

    setUploadingImage(index);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      handleExerciseChange(index, "image_url", result.url);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      duration_minutes: Number(formData.duration_minutes) || 0,
      exercises: formData.exercises.map((ex) => ({
        ...ex,
        sets: Number(ex.sets) || 0,
        reps: Number(ex.reps) || 0,
        weight: Number(ex.weight) || 0,
        weight_progress: Number(ex.weight_progress) || 0,
      })),
    };
    onSubmit(processedData);
  };

  return (
    <Card className="bg-white shadow-2xl ring-4 ring-orange-200">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <CardTitle className="text-2xl">{workout ? "עריכת אימון" : "אימון חדש 💪"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 p-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workout_name" className="font-bold">
                שם האימון
              </Label>
              <Input
                id="workout_name"
                name="workout_name"
                value={formData.workout_name}
                onChange={handleChange}
                placeholder="למשל: אימון חזה וכתפיים"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workout_type" className="font-bold">
                סוג אימון
              </Label>
              <Select value={formData.workout_type} onValueChange={(value) => handleSelectChange("workout_type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="כוח">כוח 💪</SelectItem>
                  <SelectItem value="אירובי">אירובי 🏃</SelectItem>
                  <SelectItem value="גמישות">גמישות 🧘</SelectItem>
                  <SelectItem value="משולב">משולב 🔥</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration_minutes" className="font-bold">
                משך (דקות)
              </Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={handleChange}
                placeholder="60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intensity" className="font-bold">
                עוצמה
              </Label>
              <Select value={formData.intensity} onValueChange={(value) => handleSelectChange("intensity", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="נמוכה">נמוכה</SelectItem>
                  <SelectItem value="בינונית">בינונית</SelectItem>
                  <SelectItem value="גבוהה">גבוהה 🔥</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-bold text-orange-800">תרגילים</Label>
              <Button type="button" onClick={handleAddExercise} className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 ml-2" />
                הוסף תרגיל
              </Button>
            </div>

            <AnimatePresence>
              {formData.exercises.map((exercise, index) => {
                const lastWeight = exercise.exercise_name ? getLastWeightForExercise(exercise.exercise_name) : 0;
                const hasProgress = lastWeight > 0 && exercise.weight > lastWeight;

                return (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-orange-800">תרגיל #{index + 1}</h4>
                            {lastWeight > 0 && exercise.exercise_name && (
                              <Badge id={`exercise-${index}-badge`} className="bg-blue-100 text-blue-800">
                                משקל אחרון: {lastWeight} ק"ג
                              </Badge>
                            )}
                            {hasProgress && (
                              <Badge className="bg-green-500 text-white">
                                <TrendingUp className="w-3 h-3 ml-1" />+{(exercise.weight - lastWeight).toFixed(1)} ק"ג!
                              </Badge>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveExercise(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold">שם התרגיל</Label>
                          <Input
                            value={exercise.exercise_name}
                            onChange={(e) => handleExerciseChange(index, "exercise_name", e.target.value)}
                            placeholder="למשל: סקוואט"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="font-bold">סטים</Label>
                            <Input type="number" value={exercise.sets} onChange={(e) => handleExerciseChange(index, "sets", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">חזרות</Label>
                            <Input type="number" value={exercise.reps} onChange={(e) => handleExerciseChange(index, "reps", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">משקל (ק"ג)</Label>
                            <Input
                              type="number"
                              step="0.5"
                              value={exercise.weight}
                              onChange={(e) => handleExerciseChange(index, "weight", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold">שרירי יעד</Label>
                          <Input
                            value={exercise.target_muscles?.join(", ") || ""}
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                "target_muscles",
                                e.target.value.split(",").map((s) => s.trim())
                              )
                            }
                            placeholder="למשל: חזה, כתפיים, טרייספס"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold">תמונת התרגיל</Label>
                          <div className="flex gap-4 items-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(index, e.target.files[0])}
                              className="hidden"
                              id={`image-upload-${index}`}
                            />
                            <label
                              htmlFor={`image-upload-${index}`}
                              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                            >
                              <ImageIcon className="w-4 h-4" />
                              {uploadingImage === index ? "מעלה..." : "העלה תמונה"}
                            </label>
                            {exercise.image_url && (
                              <img
                                src={exercise.image_url}
                                alt={exercise.exercise_name}
                                className="w-20 h-20 object-cover rounded-lg border-2 border-orange-300"
                              />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="font-bold">
              הערות
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="הערות על האימון, תחושות, וכו'..."
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 bg-gray-50">
          <Button type="button" variant="outline" onClick={onCancel}>
            <XCircle className="w-4 h-4 mr-2" />
            ביטול
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
            <Save className="w-4 h-4 mr-2" />
            שמור אימון
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
