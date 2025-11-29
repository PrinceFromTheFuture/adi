"use client";
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Scale, TrendingDown, TrendingUp, Target, Plus, Trophy, CheckCircle, Edit2, Save, X } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, startOfYear } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

export default function ProgressPage() {
  const [user, setUser] = useState(null);
  const [weightLogs, setWeightLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [showEditTarget, setShowEditTarget] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [weightDate, setWeightDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [targetWeight, setTargetWeight] = useState("");

  const loadProgressData = useCallback(async () => {
    try {
      const currentUser = await base44.auth.me();
      const weights = await base44.entities.WeightLog.list("-log_date", 50);

      setUser(currentUser);
      setWeightLogs(weights);
      setTargetWeight(currentUser.target_weight || "");
    } catch (error) {
      console.error("Error loading progress data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  const handleAddWeight = async () => {
    if (!newWeight) return;
    try {
      await base44.entities.WeightLog.create({
        weight: Number(newWeight),
        log_date: weightDate,
      });
      setNewWeight("");
      setWeightDate(format(new Date(), "yyyy-MM-dd"));
      setShowAddWeight(false);
      loadProgressData();
    } catch (error) {
      console.error("Error adding weight:", error);
    }
  };

  const handleUpdateTarget = async () => {
    if (!targetWeight) return;
    try {
      await base44.auth.updateMe({
        target_weight: Number(targetWeight),
      });
      setShowEditTarget(false);
      loadProgressData();
    } catch (error) {
      console.error("Error updating target:", error);
    }
  };

  const currentWeight = weightLogs.length > 0 ? weightLogs[0].weight : null;
  const startWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : null;
  const target = user?.target_weight;

  const weightLoss = startWeight && currentWeight ? startWeight - currentWeight : 0;
  const remainingWeight = target && currentWeight ? Math.abs(currentWeight - target) : 0;
  const progressToTarget = startWeight && target && currentWeight ? Math.min(((startWeight - currentWeight) / (startWeight - target)) * 100, 100) : 0;

  // Prepare weekly chart data
  const getWeeklyChartData = () => {
    if (weightLogs.length === 0) return [];

    const now = new Date();
    const yearStart = startOfYear(now);
    const weeks = eachWeekOfInterval({ start: yearStart, end: now }, { weekStartsOn: 0 });

    const weeklyData = weeks.slice(-12).map((weekDate) => {
      const weekStartDate = startOfWeek(weekDate, { weekStartsOn: 0 });
      const weekEndDate = endOfWeek(weekDate, { weekStartsOn: 0 });

      const logsInWeek = weightLogs.filter((log) => {
        const logDate = new Date(log.log_date);
        return logDate >= weekStartDate && logDate <= weekEndDate;
      });

      const avgWeight = logsInWeek.length > 0 ? logsInWeek.reduce((sum, log) => sum + log.weight, 0) / logsInWeek.length : null;

      return {
        week: format(weekStartDate, "dd/MM"),
        weight: avgWeight ? avgWeight.toFixed(1) : null,
      };
    });

    return weeklyData.filter((d) => d.weight !== null);
  };

  const chartData = getWeeklyChartData();

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 animate-pulse">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-64 bg-green-200 rounded-2xl"></div>
          <div className="h-96 bg-green-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold gradient-text mb-2 flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            ההתקדמות שלי 📈
          </h1>
          <p className="text-gray-600 text-lg">עקוב אחרי המסע שלך להצלחה! 💪</p>
        </div>

        {/* Current Status Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="card-hover bg-gradient-to-br from-blue-100 to-cyan-100 shadow-xl ring-4 ring-blue-200">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <Scale className="w-12 h-12 mx-auto text-blue-600" />
                <p className="text-sm font-bold text-blue-800">משקל נוכחי</p>
                <p className="text-5xl font-bold text-blue-900">
                  {currentWeight ? currentWeight.toFixed(1) : "--"}
                  <span className="text-2xl mr-2">ק"ג</span>
                </p>
                {weightLogs.length > 1 && (
                  <Badge className="bg-blue-500 text-white">עדכון אחרון: {format(new Date(weightLogs[0].log_date), "dd/MM/yyyy")}</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-gradient-to-br from-green-100 to-emerald-100 shadow-xl ring-4 ring-green-200">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <TrendingDown className="w-12 h-12 mx-auto text-green-600" />
                <p className="text-sm font-bold text-green-800">ירדת בסך הכל</p>
                <p className="text-5xl font-bold text-green-900">
                  {weightLoss > 0 ? weightLoss.toFixed(1) : "0.0"}
                  <span className="text-2xl mr-2">ק"ג</span>
                </p>
                {weightLoss > 0 && <Badge className="bg-green-500 text-white animate-pulse">🎉 כל הכבוד!</Badge>}
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-gradient-to-br from-purple-100 to-pink-100 shadow-xl ring-4 ring-purple-200">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <Target className="w-12 h-12 mx-auto text-purple-600" />
                <p className="text-sm font-bold text-purple-800">משקל יעד</p>
                {showEditTarget ? (
                  <div className="space-y-2">
                    <Input
                      type="number"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value)}
                      className="text-center text-2xl font-bold"
                      placeholder="הזן יעד"
                    />
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" onClick={handleUpdateTarget} className="bg-purple-500">
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowEditTarget(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-5xl font-bold text-purple-900">
                        {target ? target.toFixed(1) : "--"}
                        <span className="text-2xl mr-2">ק"ג</span>
                      </p>
                      <Button size="sm" variant="ghost" onClick={() => setShowEditTarget(true)} className="text-purple-600">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {target && currentWeight && <Badge className="bg-purple-500 text-white">נשאר: {remainingWeight.toFixed(1)} ק"ג</Badge>}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar to Target */}
        {target && currentWeight && startWeight && (
          <Card className="card-hover bg-gradient-to-l from-green-50 to-emerald-50 shadow-xl ring-4 ring-green-200">
            <CardHeader>
              <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                התקדמות ליעד 🎯
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-bold text-gray-700">
                  <span>משקל התחלתי: {startWeight.toFixed(1)} ק"ג</span>
                  <span>יעד: {target.toFixed(1)} ק"ג</span>
                </div>
                <Progress value={progressToTarget} className="h-6" />
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-800">{progressToTarget.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {progressToTarget >= 100 ? (
                      <span className="text-green-700 font-bold flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        השגת את היעד! מדהים! 🎉🎊
                      </span>
                    ) : (
                      `עוד ${remainingWeight.toFixed(1)} ק"ג ליעד!`
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Weight Chart */}
        {chartData.length > 0 && (
          <Card className="card-hover bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">התקדמות שבועית 📊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="week" tick={{ fontSize: 14, fill: "#4B5563" }} stroke="#9CA3AF" tickLine={false} />
                    <YAxis
                      domain={[
                        Math.floor(Math.min(...chartData.map((d) => parseFloat(d.weight))) - 1),
                        Math.ceil(Math.max(...chartData.map((d) => parseFloat(d.weight))) + 1),
                      ]}
                      tick={{ fontSize: 14, fill: "#4B5563" }}
                      stroke="#9CA3AF"
                      tickLine={false}
                      label={{ value: 'משקל (ק"ג)', angle: -90, position: "insideLeft", style: { fill: "#6B7280" } }}
                    />
                    <Bar dataKey="weight" radius={[12, 12, 0, 0]} maxBarSize={60}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? "#10b981" : "#60a5fa"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between mt-4 px-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">משקל התחלה</p>
                  <p className="text-xl font-bold text-blue-600">{startWeight?.toFixed(1)} ק"ג</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">משקל נוכחי</p>
                  <p className="text-xl font-bold text-green-600">{currentWeight?.toFixed(1)} ק"ג</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Weight Button */}
        <Card className="card-hover bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-2xl text-gray-800">רישום משקל חדש</span>
              <Button
                onClick={() => setShowAddWeight(!showAddWeight)}
                className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600"
              >
                <Plus className="w-5 h-5 ml-2" />
                הוסף משקל
              </Button>
            </CardTitle>
          </CardHeader>
          <AnimatePresence>
            {showAddWeight && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <CardContent className="space-y-4 border-t pt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newWeight" className="text-lg font-bold">
                        משקל (ק"ג)
                      </Label>
                      <Input
                        id="newWeight"
                        type="number"
                        step="0.1"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        className="text-2xl font-bold text-center mt-2"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weightDate" className="text-lg font-bold">
                        תאריך השקילה
                      </Label>
                      <Input
                        id="weightDate"
                        type="date"
                        value={format(new Date(), "yyyy-MM-dd")}
                        onChange={(e) => setWeightDate(e.target.value)}
                        className="text-lg text-center mt-2"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddWeight} className="bg-green-500 hover:bg-green-600 w-full h-12" disabled={!newWeight}>
                    <Save className="w-5 h-5 ml-2" />
                    שמור
                  </Button>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Weight History List */}
        <Card className="card-hover bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800">היסטוריית שקילות 📅</CardTitle>
          </CardHeader>
          <CardContent>
            {weightLogs.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {weightLogs.map((log, index) => {
                    const prevWeight = index < weightLogs.length - 1 ? weightLogs[index + 1].weight : log.weight;
                    const change = log.weight - prevWeight;

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-l from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                            <Scale className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-xl text-gray-900">{log.weight.toFixed(1)} ק"ג</p>
                            <p className="text-sm text-gray-600">{format(new Date(log.log_date), "dd/MM/yyyy")}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          {index < weightLogs.length - 1 && change !== 0 && (
                            <Badge className={change < 0 ? "bg-green-500" : "bg-orange-500"}>
                              {change < 0 ? (
                                <>
                                  <TrendingDown className="w-4 h-4 ml-1" />
                                  {Math.abs(change).toFixed(1)} ק"ג
                                </>
                              ) : (
                                <>
                                  <TrendingUp className="w-4 h-4 ml-1" />+{change.toFixed(1)} ק"ג
                                </>
                              )}
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Scale className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                <p className="text-lg">עדיין אין שקילות 📊</p>
                <p className="text-sm">התחל לעקוב אחרי המשקל שלך!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
