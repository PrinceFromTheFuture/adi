"use client";
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Droplets, Plus, Minus, Trophy, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function WaterPage() {
  const [user, setUser] = useState(null);
  const [todayWater, setTodayWater] = useState(0);
  const [waterLogs, setWaterLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const loadWaterData = useCallback(async () => {
    try {
      const currentUser = await base44.auth.me();
      const today = format(new Date(), "yyyy-MM-dd");

      const logs = await base44.entities.WaterLog.filter({ log_date: today });
      const totalWater = logs.reduce((sum, log) => sum + (log.amount_ml || 0), 0);

      setUser(currentUser);
      setWaterLogs(logs);
      setTodayWater(totalWater);
    } catch (error) {
      console.error("Error loading water data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWaterData();
  }, [loadWaterData]);

  const addWater = async (amount) => {
    try {
      await base44.entities.WaterLog.create({
        amount_ml: amount,
        log_date: format(new Date(), "yyyy-MM-dd"),
        log_time: format(new Date(), "HH:mm"),
      });
      loadWaterData();
    } catch (error) {
      console.error("Error adding water:", error);
    }
  };

  const waterGoal = user?.daily_water_goal_ml || 2000;
  const waterProgress = Math.min((todayWater / waterGoal) * 100, 100);
  const glassesConsumed = Math.floor(todayWater / 250);
  const glassesGoal = Math.ceil(waterGoal / 250);

  const quickAmounts = [
    { ml: 250, label: "כוס", emoji: "🥤" },
    { ml: 500, label: "בקבוק קטן", emoji: "💧" },
    { ml: 750, label: "3 כוסות", emoji: "🍶" },
    { ml: 1000, label: "בקבוק גדול", emoji: "💦" },
  ];

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 animate-pulse">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-64 bg-cyan-200 rounded-2xl"></div>
          <div className="h-96 bg-cyan-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center justify-center gap-3">
            <Droplets className="w-10 h-10 text-cyan-500" />
            מעקב שתייה 💧
          </h1>
          <p className="text-gray-600 text-lg">שמור על הגוף שלך מהודרט! 🌊</p>
        </div>

        {/* Main Progress Card */}
        <Card className="card-hover bg-gradient-to-br from-cyan-100 to-blue-100 shadow-2xl ring-4 ring-cyan-300">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <div className="w-48 h-48 mx-auto relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.3)" strokeWidth="16" fill="none" />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="url(#gradient)"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${2 * Math.PI * 88 * (1 - waterProgress / 100)}`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Droplets className="w-12 h-12 text-cyan-600 mb-2 animate-bounce" />
                    <span className="text-4xl font-bold text-cyan-800">{(todayWater / 1000).toFixed(1)}</span>
                    <span className="text-sm text-cyan-700 font-medium">ליטר</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-cyan-900">
                  {waterProgress >= 100 ? "מדהים! השגת את היעד! 🎉" : `עוד ${((waterGoal - todayWater) / 1000).toFixed(1)} ליטר ליעד`}
                </h3>
                <div className="flex items-center justify-center gap-4 text-lg">
                  <Badge className="bg-cyan-500 text-white px-4 py-2 text-base">
                    {glassesConsumed} / {glassesGoal} כוסות 🥤
                  </Badge>
                  <Badge className="bg-blue-500 text-white px-4 py-2 text-base">{waterProgress.toFixed(0)}% מהיעד 🎯</Badge>
                </div>
                {waterProgress >= 100 && (
                  <div className="flex items-center justify-center gap-2 text-yellow-600 animate-bounce">
                    <Trophy className="w-6 h-6" />
                    <span className="font-bold">עבודה מצוינת! המשך כך!</span>
                    <Sparkles className="w-6 h-6" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Add Buttons */}
        <Card className="card-hover bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-cyan-800">🥤 הוסף מים במהירות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount.ml}
                  onClick={() => addWater(amount.ml)}
                  className="h-auto py-6 bg-gradient-to-br from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white shadow-lg hover:shadow-2xl transition-all hover:scale-105"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">{amount.emoji}</span>
                    <span className="font-bold text-lg">{amount.ml} מ"ל</span>
                    <span className="text-xs opacity-90">{amount.label}</span>
                  </div>
                </Button>
              ))}
            </div>

            <div className="pt-4 border-t">
              {!showCustomInput ? (
                <Button onClick={() => setShowCustomInput(true)} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 ml-2" />
                  הזן כמות מותאמת אישית
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder='הזן כמות במ"ל'
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      if (customAmount) {
                        addWater(Number(customAmount));
                        setCustomAmount("");
                        setShowCustomInput(false);
                      }
                    }}
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    הוסף
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomAmount("");
                    }}
                    variant="outline"
                  >
                    ביטול
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Log */}
        <Card className="card-hover bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-800">📊 היסטוריית שתייה היום</CardTitle>
          </CardHeader>
          <CardContent>
            {waterLogs.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {waterLogs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg border-2 border-cyan-200"
                    >
                      <div className="flex items-center gap-3">
                        <Droplets className="w-6 h-6 text-cyan-600" />
                        <div>
                          <p className="font-bold text-cyan-900">{log.amount_ml} מ"ל</p>
                          <p className="text-sm text-cyan-600">{log.log_time}</p>
                        </div>
                      </div>
                      <Badge className="bg-cyan-100 text-cyan-800">{(log.amount_ml / 250).toFixed(1)} כוסות</Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Droplets className="w-16 h-16 mx-auto mb-3 text-cyan-300" />
                <p className="text-lg">עדיין לא שתית היום 💧</p>
                <p className="text-sm">בוא נתחיל!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
