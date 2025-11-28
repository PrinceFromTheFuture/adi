import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Plus, 
  UtensilsCrossed, 
  Dumbbell, 
  Droplets, 
  Calendar,
  Zap,
  Sparkles
} from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "רשום ארוחה",
      icon: UtensilsCrossed,
      color: "bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600",
      link: createPageUrl("Meals"),
      emoji: "🍽️"
    },
    {
      title: "שתה מים", 
      icon: Droplets,
      color: "bg-gradient-to-br from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600",
      link: createPageUrl("Water"),
      emoji: "💧"
    },
    {
      title: "התחל אימון",
      icon: Dumbbell,
      color: "bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600", 
      link: createPageUrl("Workouts"),
      emoji: "💪"
    },
    {
      title: "תכנן שבוע",
      icon: Calendar,
      color: "bg-gradient-to-br from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600",
      link: createPageUrl("Calendar"),
      emoji: "📅"
    }
  ];

  return (
    <Card className="card-hover bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg ring-2 ring-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl text-green-800">
          <Zap className="w-7 h-7 text-yellow-500 animate-pulse" />
          פעולות מהירות ⚡
          <Sparkles className="w-5 h-5 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Link key={index} to={action.link} className="block">
              <Button 
                className={`w-full h-auto p-6 ${action.color} text-white flex flex-col items-center gap-3 transition-all duration-300 hover:shadow-2xl hover:scale-105 shadow-lg`}
              >
                <div className="text-3xl">{action.emoji}</div>
                <action.icon className="w-7 h-7" />
                <div className="text-center">
                  <p className="font-bold text-base">{action.title}</p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}