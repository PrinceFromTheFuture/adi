"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RestTimer() {
  const [timeLeft, setTimeLeft] = useState(90);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime] = useState(90);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Create audio element for notification
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuFzvLZiToIFmi58+ibUBELTKXh8bllHAU2jdXvzIAyBSh+y+/bljkIClyy6OSjYB0ILojN79yTSgsZb8D33J5YEwpMpOH3tWccBzaPy+7OgzwHIXbG7tOORA0VW7Lm7aRhHwU0itDv2IhACxlruvLhlVkcClCp4/K2ZhoFN4/U7s2AOQcidM3v1ZhMBhdnu+3fp2QgBSyGzu7YjDwIF2i78+mcUxEITKXh8bplGgQ3jtXvzIEzBSZ+y+/cljgHCFuz5eSiXx0HLoXM79ySSQsYb8D33Z5ZEgpMpOH3tWccBzWPy+7OgzsGIXfG7tONRA0VXLLl7aRhHgU1i9Dv14hACxpquvLhlVkcClCp4/K2ZhkFOI/U7s2AOQZ3zu/ZmU4JGGe67+emZiIGLoTN7tiLPAcXZ7vy4ZVYGQlPqOPytmYaBDeO1e/NgDkGJ3/M79aXTQcWaLrv36plJQYthM3u2Is8BhdouO/flVkZCE6k4fG6ZBoEN43U78yAMwYnf8zv1pdNBhZouu/fqmUlBi2Ezu7Yijv');
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            playNotification();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
    // Vibrate if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
  };

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Card className="card-hover bg-gradient-to-br from-blue-100 to-cyan-100 shadow-xl ring-4 ring-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Clock className="w-5 h-5" />
          טיימר מנוחה ⏱️
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <svg className="w-full h-48" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 80}`}
              strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress / 100)}`}
              transform="rotate(-90 100 100)"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              key={timeLeft}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-bold text-blue-800"
            >
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </motion.div>
            <p className="text-sm text-blue-600 mt-2">
              {isRunning ? 'זמן מנוחה...' : timeLeft === 0 ? 'סיימת! 🎉' : 'מוכן?'}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-center">
          <Button
            onClick={handleStartPause}
            className={`${
              isRunning 
                ? 'bg-orange-500 hover:bg-orange-600' 
                : 'bg-green-500 hover:bg-green-600'
            } text-white px-8 py-3 text-base w-32`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 ml-2" />
                השהה
              </>
            ) : (
              <>
                <Play className="w-4 h-4 ml-2" />
                התחל
              </>
            )}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="px-8 py-3 text-base w-32"
          >
            <RotateCcw className="w-4 h-4 ml-2" />
            אפס
          </Button>
        </div>

        <AnimatePresence>
          {timeLeft === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center p-4 bg-green-100 rounded-lg border-2 border-green-300"
            >
              <p className="text-green-800 font-bold text-lg">
                זמן המנוחה נגמר! בואו נמשיך! 💪🔥
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}