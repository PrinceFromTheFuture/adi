"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Scale, Droplets, TrendingDown, TrendingUp, Footprints } from "lucide-react";

export default function TodayStats({
  caloriesConsumed = 0,
  calorieGoal = 2000,
  currentWeight,
  startWeight,
  waterConsumed = 0,
  waterGoal = 2000,
  stepsToday = 0,
  stepsGoal = 10000,
}) {
  // Convert weight values to numbers (they may come as strings from the database)
  const currentWeightNum = currentWeight ? Number(currentWeight) : null;
  const startWeightNum = startWeight ? Number(startWeight) : null;

  const calorieProgress = Math.min((caloriesConsumed / calorieGoal) * 100, 100);
  const waterProgress = Math.min((waterConsumed / waterGoal) * 100, 100);
  const stepsProgress = Math.min((stepsToday / stepsGoal) * 100, 100);

  const weightLoss = startWeightNum && currentWeightNum ? startWeightNum - currentWeightNum : 0;
  const weightChange = weightLoss >= 0 ? weightLoss : Math.abs(weightLoss);
  const isWeightLoss = weightLoss >= 0;

  const stats = [
    {
      title: "משקל נוכחי",
      value: currentWeightNum ? `${currentWeightNum.toFixed(1)}` : "--",
      subtitle:
        currentWeightNum && startWeightNum ? (
          <span className="flex items-center gap-1">
            {isWeightLoss ? (
              <>
                <TrendingDown className="w-3 h-3 text-green-600" />
                <span className="text-green-600 font-bold">-{weightChange.toFixed(1)} ק"ג</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3 h-3 text-orange-600" />
                <span className="text-orange-600 font-bold">+{weightChange.toFixed(1)} ק"ג</span>
              </>
            )}
          </span>
        ) : (
          'ק"ג'
        ),
      progress: currentWeightNum ? 100 : 0,
      icon: Scale,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      ringColor: "ring-blue-200",
    },
    {
      title: "קלוריות היום",
      value: `${Math.round(Number(caloriesConsumed))}`,
      subtitle: `/ ${calorieGoal}`,
      progress: calorieProgress,
      icon: Flame,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      ringColor: "ring-pink-200",
    },
    {
      title: "שתייה",
      value: `${(waterConsumed / 1000).toFixed(1)}L`,
      subtitle: `/ ${(waterGoal / 1000).toFixed(1)}L`,
      progress: waterProgress,
      icon: Droplets,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
      ringColor: "ring-cyan-200",
    },
    {
      title: "צעדים",
      value: stepsToday.toLocaleString(),
      subtitle: `/ ${stepsGoal.toLocaleString()}`,
      progress: stepsProgress,
      icon: Footprints,
      color: "text-green-600",
      bgColor: "bg-green-100",
      ringColor: "ring-green-200",
    },
  ];

  const strokeColor = {
    "text-blue-600": "#2563eb",
    "text-pink-600": "#db2777",
    "text-cyan-600": "#0891b2",
    "text-green-600": "#16a34a",
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => (
        <Card key={index} className={`card-hover bg-white/90 backdrop-blur-sm ring-2 ${stat.ringColor} shadow-lg`}>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="28" cy="28" r="24" stroke="#e5e7eb" strokeWidth="5" fill="none" />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke={strokeColor[stat.color]}
                    strokeWidth="5"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - (stat.progress || 0) / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-600 truncate">{stat.title}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
