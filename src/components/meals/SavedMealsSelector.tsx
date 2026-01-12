"use client";
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SavedMealsSelector({ onSelectMeal, onClose }) {
  const [savedMeals, setSavedMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedMeals();
  }, []);

  const loadSavedMeals = async () => {
    try {
      const meals = await base44.entities.SavedMeal.list('-created_date', 50);
      setSavedMeals(meals);
    } catch (error) {
      console.error('Error loading saved meals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">טוען...</div>;
  }

  return (
    <Card className="bg-white shadow-xl">
      <CardHeader className="bg-gradient-to-l from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-indigo-800">
          <Bookmark className="w-6 h-6" />
          הארוחות השמורות שלי 📚
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {savedMeals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bookmark className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p>עדיין אין ארוחות שמורות</p>
            <p className="text-sm">השתמשי ב"הרכב ארוחה" כדי ליצור ארוחות!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {savedMeals.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gradient-to-l from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => onSelectMeal(meal)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900">{meal.meal_name}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className="bg-orange-500 text-white">
                          {Number(meal.total_calories || 0).toFixed(0)} קל'
                        </Badge>
                        <Badge className="bg-blue-500 text-white">
                          {Number(meal.total_protein || 0).toFixed(1)}g חלבון
                        </Badge>
                        <Badge className="bg-green-500 text-white">
                          {Number(meal.total_carbs || 0).toFixed(1)}g פחמ'
                        </Badge>
                        <Badge className="bg-purple-500 text-white">
                          {Number(meal.total_fat || 0).toFixed(1)}g שומן
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {meal.items?.length || 0} מרכיבים
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-indigo-500 hover:bg-indigo-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMeal(meal);
                      }}
                    >
                      <Plus className="w-4 h-4 ml-1" />
                      בחר
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            סגור
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}