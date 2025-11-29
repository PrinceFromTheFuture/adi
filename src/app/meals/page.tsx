"use client";
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, UtensilsCrossed, ChefHat, Settings } from "lucide-react";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

import MealForm from "@/components/meals/MealForm";
import MealsList from "@/components/meals/MealsList";
import MealSummary from "@/components/meals/MealSummary";
import CalendarIntegration from "@/components/meals/CalendarIntegration";
import MealBuilder from "@/components/meals/MealBuilder";
import FoodItemManager from "@/components/meals/FoodItemManager";
import SavedMealsSelector from "@/components/meals/SavedMealsSelector";

export default function Meals() {
  const [meals, setMeals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showMealBuilder, setShowMealBuilder] = useState(false);
  const [showFoodManager, setShowFoodManager] = useState(false);
  const [showSavedMeals, setShowSavedMeals] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activeMealType, setActiveMealType] = useState("breakfast");
  const [isLoading, setIsLoading] = useState(true);

  const loadMeals = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      const dayMeals = await base44.entities.Meal.filter({
        meal_date: selectedDate,
        created_by: user.email,
      });
      setMeals(dayMeals);
    } catch (error) {
      console.error("Error loading meals:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const handleSubmit = async (mealData) => {
    try {
      if (editingMeal) {
        await base44.entities.Meal.update(editingMeal.id, mealData);
      } else {
        await base44.entities.Meal.create({
          ...mealData,
          meal_date: selectedDate,
          meal_type: activeMealType,
        });
      }
      setShowForm(false);
      setEditingMeal(null);
      loadMeals();
    } catch (error) {
      console.error("Error saving meal:", error);
    }
  };

  const handleEdit = (meal) => {
    setEditingMeal(meal);
    setActiveMealType(meal.meal_type);
    setShowForm(true);
  };

  const handleDelete = async (mealId) => {
    try {
      await base44.entities.Meal.delete(mealId);
      loadMeals();
    } catch (error) {
      console.error("Error deleting meal:", error);
    }
  };

  const handleSaveMealBuilder = async (mealData, mealType) => {
    try {
      await base44.entities.Meal.create({
        meal_type: mealType,
        food_name: mealData.meal_name,
        calories: mealData.total_calories,
        protein: mealData.total_protein,
        carbs: mealData.total_carbs,
        fat: mealData.total_fat,
        meal_date: selectedDate,
        serving_size: `${mealData.items.length} מרכיבים`,
      });
      setShowMealBuilder(false);
      loadMeals();
    } catch (error) {
      console.error("Error saving built meal:", error);
    }
  };

  const handleSelectSavedMeal = async (savedMeal) => {
    try {
      await base44.entities.Meal.create({
        meal_type: activeMealType,
        food_name: savedMeal.meal_name,
        calories: savedMeal.total_calories,
        protein: savedMeal.total_protein,
        carbs: savedMeal.total_carbs,
        fat: savedMeal.total_fat,
        meal_date: selectedDate,
        serving_size: `${savedMeal.items.length} מרכיבים`,
      });
      setShowSavedMeals(false);
      loadMeals();
    } catch (error) {
      console.error("Error adding saved meal:", error);
    }
  };

  const mealsByType = meals.reduce((acc, meal) => {
    const type = meal.meal_type || "other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(meal);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">מעקב ארוחות</h1>
            <p className="text-gray-600">עקוב אחרי התזונה היומית שלך והשג את היעדים</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setShowFoodManager(!showFoodManager)}
              variant="outline"
              className="border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              <Settings className="w-4 h-4 ml-2" />
              נהל מנות
            </Button>
            <Button onClick={() => setShowSavedMeals(!showSavedMeals)} className="bg-indigo-500 hover:bg-indigo-600 text-white">
              <UtensilsCrossed className="w-5 h-5 ml-2" />
              ארוחות שמורות
            </Button>
            <Button onClick={() => setShowMealBuilder(!showMealBuilder)} className="bg-purple-500 hover:bg-purple-600 text-white">
              <ChefHat className="w-5 h-5 ml-2" />
              הרכב ארוחה
            </Button>
            <Button onClick={() => setShowForm(!showForm)} className="bg-green-500 hover:bg-green-600 text-white">
              <Plus className="w-5 h-5 ml-2" />
              הוסף ארוחה
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <MealSummary selectedDate={selectedDate} onDateChange={setSelectedDate} meals={meals} />

            <AnimatePresence>
              {showFoodManager && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <FoodItemManager onClose={() => setShowFoodManager(false)} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showSavedMeals && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <SavedMealsSelector onSelectMeal={handleSelectSavedMeal} onClose={() => setShowSavedMeals(false)} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showMealBuilder && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <MealBuilder selectedMealType={activeMealType} onSave={handleSaveMealBuilder} onCancel={() => setShowMealBuilder(false)} />
                </motion.div>
              )}
            </AnimatePresence>

            {showForm && (
              <MealForm
                meal={editingMeal}
                mealType={activeMealType}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingMeal(null);
                }}
              />
            )}

            <Tabs value={activeMealType} onValueChange={setActiveMealType}>
              <TabsList className="grid w-full grid-cols-4 bg-white">
                <TabsTrigger value="breakfast">ארוחת בוקר</TabsTrigger>
                <TabsTrigger value="lunch">ארוחת צהריים</TabsTrigger>
                <TabsTrigger value="dinner">ארוחת ערב</TabsTrigger>
                <TabsTrigger value="snack">בין לבין</TabsTrigger>
              </TabsList>

              {["breakfast", "lunch", "dinner", "snack"].map((mealType) => (
                <TabsContent key={mealType} value={mealType} className="mt-6">
                  <MealsList
                    meals={mealsByType[mealType] || []}
                    mealType={mealType}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAddMeal={() => {
                      setActiveMealType(mealType);
                      setShowForm(true);
                    }}
                    isLoading={isLoading}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="space-y-6">
            <CalendarIntegration meals={meals} selectedDate={selectedDate} />
          </div>
        </div>
      </div>
    </div>
  );
}
