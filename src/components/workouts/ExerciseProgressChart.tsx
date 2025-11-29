"use client";
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function ExerciseProgressChart({ exerciseName, workouts }) {
  const chartData = useMemo(() => {
    // Filter workouts that have this exercise
    const relevantWorkouts = workouts
      .filter(w => w.exercises && w.exercises.some(ex => ex.exercise_name === exerciseName))
      .sort((a, b) => new Date(a.workout_date) - new Date(b.workout_date));

    return relevantWorkouts.map(workout => {
      const exercise = workout.exercises.find(ex => ex.exercise_name === exerciseName);
      return {
        date: format(new Date(workout.workout_date), 'dd/MM'),
        weight: exercise.weight,
        fullDate: format(new Date(workout.workout_date), 'dd/MM/yyyy')
      };
    });
  }, [exerciseName, workouts]);

  if (chartData.length < 2) {
    return null; // Don't show chart if less than 2 data points
  }

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border-2 border-orange-200">
      <h6 className="font-bold text-orange-800 mb-3">התקדמות במשקל 📈</h6>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 shadow-lg rounded-lg border-2 border-orange-200">
                      <p className="text-xs font-bold">{payload[0].payload.fullDate}</p>
                      <p className="text-orange-700 font-bold">
                        {payload[0].value} ק"ג
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#ea580c" 
              strokeWidth={2}
              dot={{ fill: '#ea580c', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-center text-gray-600 mt-2">
        משקל התחלתי: {chartData[0].weight} ק"ג → נוכחי: {chartData[chartData.length - 1].weight} ק"ג
        {chartData[chartData.length - 1].weight > chartData[0].weight && (
          <span className="text-green-600 font-bold mr-2">
            (+{(chartData[chartData.length - 1].weight - chartData[0].weight).toFixed(1)} ק"ג! 🎉)
          </span>
        )}
      </p>
    </div>
  );
}