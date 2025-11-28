import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Trophy
} from "lucide-react";



export default function ProgressOverview({ user, recentWeight }) {
  const calculateProgress = () => {
    if (!user?.current_weight || !user?.target_weight) return null;
    
    const start = user.current_weight;
    const target = user.target_weight;
    const current = recentWeight?.weight || user.current_weight;
    
    const totalDistance = Math.abs(target - start);
    const progress = Math.abs(start - current);
    const percentage = Math.min((progress / totalDistance) * 100, 100);
    
    return {
      percentage,
      remaining: Math.abs(target - current),
      trend: current < start ? 'down' : current > start ? 'up' : 'stable'
    };
  };

  const progress = calculateProgress();

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend) => {
    return trend === 'down' ? 'text-green-600' : trend === 'up' ? 'text-orange-600' : 'text-gray-600';
  };

  return (
    <Card className="card-hover bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-yellow-600" />
          סקירת התקדמות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {progress ? (
          <>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">התקדמות למטרה</span>
              </div>
              <Progress value={progress.percentage} className="h-3" />
              <p className="text-xs text-gray-500">
                {progress.percentage.toFixed(1)}% מהדרך ליעד
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">נוכחי</p>
                <p className="text-lg font-bold text-gray-900">
                  {recentWeight?.weight || user.current_weight || '--'} ק"ג
                </p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">יעד</p>
                <p className="text-lg font-bold text-blue-600">
                  {user.target_weight || '--'} ק"ג
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
              {(() => {
                const TrendIcon = getTrendIcon(progress.trend);
                return (
                  <>
                    <TrendIcon className={`w-4 h-4 ${getTrendColor(progress.trend)}`} />
                    <span className="text-sm font-medium text-gray-700">
                      עוד {progress.remaining.toFixed(1)} ק"ג ליעד
                    </span>
                  </>
                );
              })()}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <Target className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-3">הגדר את יעדי המשקל שלך לעקוב אחרי ההתקדמות</p>
            <Badge variant="outline" className="text-xs">
              השלם את הפרופיל שלך
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}