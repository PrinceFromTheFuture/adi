"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { Calendar, Clock, Coffee, Dumbbell, Moon } from "lucide-react";
import { format, addDays } from "date-fns";

export default function UpcomingSchedule() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUpcomingSchedule();
  }, []);

  const loadUpcomingSchedule = async () => {
    try {
      const user = await base44.auth.me();
      const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
      const dayAfter = format(addDays(new Date(), 2), "yyyy-MM-dd");

      const [workouts, restDays] = await Promise.all([
        base44.entities.Workout.filter({
          created_by: user.email,
          completed: false,
        }),
        base44.entities.RestDay.list("-rest_date", 5),
      ]);

      // Sample upcoming events
      const events = [
        {
          type: "meal",
          title: "תזכורת לארוחת בוקר",
          time: "08:00",
          date: format(new Date(), "yyyy-MM-dd"),
          icon: Coffee,
          color: "bg-green-100 text-green-700",
        },
        {
          type: "workout",
          title: "אימון בוקר",
          time: "07:00",
          date: tomorrow,
          icon: Dumbbell,
          color: "bg-orange-100 text-orange-700",
        },
        {
          type: "meal",
          title: "ארוחת ערב בריאה",
          time: "19:00",
          date: tomorrow,
          icon: Moon,
          color: "bg-purple-100 text-purple-700",
        },
      ];

      setUpcomingEvents(events);
    } catch (error) {
      console.error("Error loading schedule:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="card-hover bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
            לוח הזמנים הקרוב
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-blue-600" />
          לוח הזמנים הקרוב
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`p-2 rounded-lg ${event.color}`}>
                  <event.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{event.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{event.time}</span>
                    <Badge variant="outline" className="text-xs">
                      {event.date === format(new Date(), "yyyy-MM-dd") ? "היום" : format(new Date(event.date), "dd/MM")}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">אין אירועים מתוכננים</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
