"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Play, Clock, Dumbbell, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import ExerciseProgressChart from './ExerciseProgressChart';

export default function WorkoutsList({ workouts, activeWorkout, onEdit, onDelete, onStart, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-orange-100 rounded-lg"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <Card className="card-hover bg-white shadow-lg">
        <CardContent className="p-12 text-center">
          <Dumbbell className="w-16 h-16 mx-auto mb-4 text-orange-300" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">עדיין אין תבניות אימון</h3>
          <p className="text-gray-500">צור את תבנית האימון הראשונה שלך!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {workouts.map((workout) => {
          const isActive = activeWorkout?.id === workout.id;
          
          return (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className={`card-hover shadow-lg ${isActive ? 'bg-gradient-to-r from-green-50 to-emerald-50 ring-4 ring-green-400' : 'bg-white'}`}>
                <CardHeader className="border-b border-orange-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-orange-800 mb-2 flex items-center gap-2">
                        {workout.workout_name}
                        {isActive && <Badge className="bg-green-500 text-white animate-pulse">פעיל כעת 🔥</Badge>}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-orange-100 text-orange-800 border border-orange-300">
                          {workout.workout_type}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800">
                          עוצמה: {workout.intensity}
                        </Badge>
                        {workout.duration_minutes && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {workout.duration_minutes} דקות
                          </Badge>
                        )}
                        {workout.last_performed && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            אחרון: {format(new Date(workout.last_performed), 'dd/MM/yyyy')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!isActive && (
                        <Button 
                          onClick={() => onStart(workout)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Play className="w-4 h-4 ml-2" />
                          התחל
                        </Button>
                      )}
                      <Button variant="outline" size="icon" onClick={() => onEdit(workout)} disabled={isActive}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => onDelete(workout.id)} disabled={isActive}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {workout.exercises && workout.exercises.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-lg text-orange-800 mb-3">תרגילים ({workout.exercises.length}):</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {workout.exercises.map((exercise, index) => (
                          <Card key={index} className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3 mb-2">
                                {exercise.image_url && (
                                  <img 
                                    src={exercise.image_url} 
                                    alt={exercise.exercise_name}
                                    className="w-20 h-20 object-cover rounded-lg border-2 border-orange-300"
                                  />
                                )}
                                <div className="flex-1">
                                  <h5 className="font-bold text-xl text-orange-900 mb-2">{exercise.exercise_name}</h5>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-white/60 p-2 rounded-lg text-center">
                                      <p className="text-xs text-gray-600">סטים</p>
                                      <p className="text-lg font-bold text-orange-800">{exercise.sets}</p>
                                    </div>
                                    <div className="bg-white/60 p-2 rounded-lg text-center">
                                      <p className="text-xs text-gray-600">חזרות</p>
                                      <p className="text-lg font-bold text-orange-800">{exercise.reps}</p>
                                    </div>
                                    <div className="bg-white/60 p-2 rounded-lg text-center">
                                      <p className="text-xs text-gray-600">משקל</p>
                                      <p className="text-lg font-bold text-orange-800">{exercise.weight} ק"ג</p>
                                    </div>
                                  </div>
                                  {exercise.target_muscles && exercise.target_muscles.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {exercise.target_muscles.map((muscle, idx) => (
                                        <Badge key={idx} className="bg-orange-100 text-orange-800 text-xs">
                                          {muscle}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {workout.notes && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                      <p className="font-semibold text-yellow-900 mb-1">הערות:</p>
                      <p className="text-gray-700">{workout.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}