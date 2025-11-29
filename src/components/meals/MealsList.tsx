"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, CalendarPlus, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parse } from 'date-fns';

const MEAL_TYPE_LABELS = {
  breakfast: 'ארוחת בוקר',
  lunch: 'ארוחת צהריים',
  dinner: 'ארוחת ערב',
  snack: 'בין לבין'
};

export default function MealsList({ meals, mealType, onEdit, onDelete, onAddMeal, isLoading }) {

  const createGoogleCalendarLink = (meal) => {
    const title = encodeURIComponent(`${meal.food_name} (${MEAL_TYPE_LABELS[meal.meal_type]})`);
    
    let startTime, endTime;
    if (meal.meal_date && meal.meal_time) {
      const startDateTime = parse(`${meal.meal_date} ${meal.meal_time}`, 'yyyy-MM-dd HH:mm', new Date());
      startTime = format(startDateTime, "yyyyMMdd'T'HHmmss");
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);
      endTime = format(endDateTime, "yyyyMMdd'T'HHmmss");
    } else {
      return '#';
    }
    
    const details = encodeURIComponent(
      `ארוחה: ${meal.food_name}\nקלוריות: ${meal.calories || 'לא צוין'} kcal\nחלבון: ${meal.protein || 'לא צוין'}g\nפחמימות: ${meal.carbs || 'לא צוין'}g\nשומן: ${meal.fat || 'לא צוין'}g\n\nזכור לתעד את התחושות שלך אחרי הארוחה באפליקציה!`
    );
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&reminders.useDefault=false&reminders.overrides[0].method=popup&reminders.overrides[0].minutes=60`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-gray-200 rounded"></div>
                <div className="h-4 w-60 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <AnimatePresence>
        {meals.length > 0 ? (
          <div className="space-y-4">
            {meals.map((meal) => (
              <motion.div
                key={meal.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="card-hover">
                  <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{meal.food_name}</h3>
                        {meal.meal_time && <Badge variant="outline">{meal.meal_time}</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-2">
                        <span><strong className="text-orange-500">{meal.calories || 0}</strong> קלוריות</span>
                        <span><strong className="text-blue-500">{meal.protein || 0}g</strong> חלבון</span>
                        <span><strong className="text-green-500">{meal.carbs || 0}g</strong> פחמימות</span>
                        <span><strong className="text-purple-500">{meal.fat || 0}g</strong> שומן</span>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end sm:self-center">
                      <a href={createGoogleCalendarLink(meal)} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" aria-label="הוסף ליומן">
                          <CalendarPlus className="w-4 h-4 text-blue-600" />
                        </Button>
                      </a>
                      <Button variant="outline" size="icon" onClick={() => onEdit(meal)} aria-label="ערוך ארוחה">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => onDelete(meal.id)} aria-label="מחק ארוחה">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="text-center p-8 border-2 border-dashed">
              <Utensils className="mx-auto w-12 h-12 text-gray-300" />
              <CardTitle className="mt-4">עדיין לא תיעדת {MEAL_TYPE_LABELS[mealType]}</CardTitle>
              <CardDescription className="mt-2 mb-4">הגיע הזמן לעקוב אחרי הארוחה שלך!</CardDescription>
              <Button onClick={onAddMeal}>
                <Plus className="w-4 h-4 mr-2" />
                הוסף {MEAL_TYPE_LABELS[mealType]}
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}