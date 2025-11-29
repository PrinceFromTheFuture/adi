"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { startOfWeek, endOfWeek } from 'date-fns';

export default function WorkoutStats({ workouts }) {
  const [weeklyGoal, setWeeklyGoal] = useState(4);
  const [weeklyCompleted, setWeeklyCompleted] = useState(0);
  
  useEffect(() => {
    const loadWeeklyData = async () => {
      try {
        const user = await base44.auth.me();
        setWeeklyGoal(user.weekly_workouts_goal || 4);
        
        // Get this week's workout sessions
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
        
        const sessions = await base44.entities.WorkoutSession.list("-session_date", 100);
        const thisWeekSessions = sessions.filter(s => {
          const sessionDate = new Date(s.session_date);
          return s.completed && sessionDate >= weekStart && sessionDate <= weekEnd;
        });
        
        setWeeklyCompleted(thisWeekSessions.length);
      } catch (error) {
        console.error("Error loading weekly data:", error);
      }
    };
    loadWeeklyData();
  }, []);

  return (
    <div className="max-w-md mx-auto">
      <Card className="card-hover bg-white ring-2 ring-green-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100 shadow-md">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 mb-1">אימונים השבוע</p>
              <p className="text-3xl font-bold text-gray-900">{weeklyCompleted}/{weeklyGoal}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}