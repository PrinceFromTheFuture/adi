"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { CalendarCheck, Info, CalendarPlus } from 'lucide-react';
import { format, parse } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const MEAL_TYPE_LABELS = {
  breakfast: 'ארוחת בוקר 🌅',
  lunch: 'ארוחת צהריים ☀️',
  dinner: 'ארוחת ערב 🌙',
  snack: 'חטיף 🍎'
};

export default function CalendarIntegration({ meals, selectedDate }) {
  const [showForm, setShowForm] = useState(false);
  const [mealType, setMealType] = useState('lunch');
  const [mealDate, setMealDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [mealTime, setMealTime] = useState('12:00');
  const [foodName, setFoodName] = useState('');
  const [notes, setNotes] = useState('');

  const createFutureMealCalendarLink = () => {
    const title = foodName 
      ? encodeURIComponent(`${MEAL_TYPE_LABELS[mealType]}: ${foodName}`)
      : encodeURIComponent(MEAL_TYPE_LABELS[mealType]);
    
    const startDateTime = parse(`${mealDate} ${mealTime}`, 'yyyy-MM-dd HH:mm', new Date());
    const startTime = format(startDateTime, "yyyyMMdd'T'HHmmss");
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);
    const endTime = format(endDateTime, "yyyyMMdd'T'HHmmss");
    
    let details = `תזכורת: ${MEAL_TYPE_LABELS[mealType]}\n`;
    if (foodName) {
      details += `מזון: ${foodName}\n`;
    }
    if (notes) {
      details += `הערות: ${notes}\n`;
    }
    details += '\nזכור לתעד את הארוחה באפליקציה אחרי שתאכל! 🍽️';
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${encodeURIComponent(details)}&reminders.useDefault=false&reminders.overrides[0].method=popup&reminders.overrides[0].minutes=30`;
  };

  const handleAddToCalendar = () => {
    const link = createFutureMealCalendarLink();
    window.open(link, '_blank');
    // Reset form
    setFoodName('');
    setNotes('');
    setShowForm(false);
  };

  return (
    <Card className="card-hover bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-blue-600" />
          תכנון ארוחות עתידיות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
          <Info className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
          <p className="text-xs text-gray-700">
            תכנן את הארוחות העתידיות שלך ליומן Google כדי לקבל תזכורות ולהישאר במסלול!
          </p>
        </div>

        <Button 
          onClick={() => setShowForm(!showForm)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
        >
          <CalendarPlus className="w-4 h-4 ml-2" />
          {showForm ? 'סגור טופס' : 'הוסף ארוחה ליומן'}
        </Button>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="mealType" className="font-bold">סוג ארוחה</Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger id="mealType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">{MEAL_TYPE_LABELS.breakfast}</SelectItem>
                    <SelectItem value="lunch">{MEAL_TYPE_LABELS.lunch}</SelectItem>
                    <SelectItem value="dinner">{MEAL_TYPE_LABELS.dinner}</SelectItem>
                    <SelectItem value="snack">{MEAL_TYPE_LABELS.snack}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mealDate" className="font-bold">תאריך</Label>
                  <Input 
                    id="mealDate"
                    type="date" 
                    value={mealDate} 
                    onChange={(e) => setMealDate(e.target.value)}
                    className="text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mealTime" className="font-bold">שעה</Label>
                  <Input 
                    id="mealTime"
                    type="time" 
                    value={mealTime} 
                    onChange={(e) => setMealTime(e.target.value)}
                    className="text-center"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="foodName" className="font-bold">שם המזון (אופציונלי)</Label>
                <Input 
                  id="foodName"
                  value={foodName} 
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="למשל: סלט עם חזה עוף"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="font-bold">הערות (אופציונלי)</Label>
                <Input 
                  id="notes"
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="הערות נוספות..."
                />
              </div>

              <Button 
                onClick={handleAddToCalendar}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold"
              >
                <CalendarCheck className="w-4 h-4 ml-2" />
                הוסף ליומן Google
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 pt-4 border-t border-purple-200">
          <p className="text-sm font-medium text-center text-gray-700">
            ארוחות שתועדו היום: <strong className="text-blue-600">{meals.length}</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}