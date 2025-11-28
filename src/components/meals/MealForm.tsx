import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Save, XCircle } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const MEAL_TYPE_LABELS = {
  breakfast: 'ארוחת בוקר',
  lunch: 'ארוחת צהריים',
  dinner: 'ארוחת ערב',
  snack: 'בין לבין'
};

export default function MealForm({ meal, mealType, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    food_name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    serving_amount: '',
    serving_unit: 'gram'
  });

  useEffect(() => {
    if (meal) {
      setFormData({
        food_name: meal.food_name || '',
        calories: meal.calories || '',
        protein: meal.protein || '',
        carbs: meal.carbs || '',
        fat: meal.fat || '',
        serving_amount: meal.serving_amount || '',
        serving_unit: meal.serving_unit || 'gram'
      });
    } else {
      setFormData({
        food_name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        serving_amount: '',
        serving_unit: 'gram'
      });
    }
  }, [meal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      calories: Number(formData.calories) || 0,
      protein: Number(formData.protein) || 0,
      carbs: Number(formData.carbs) || 0,
      fat: Number(formData.fat) || 0,
      serving_amount: Number(formData.serving_amount) || 0,
      serving_size: `${formData.serving_amount} ${formData.serving_unit}`
    };
    onSubmit(processedData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="gradient-text">
            {meal ? 'עריכת ארוחה' : `הוסף ${MEAL_TYPE_LABELS[mealType] || mealType}`}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="food_name">שם המזון</Label>
                <Input 
                  id="food_name" 
                  name="food_name" 
                  value={formData.food_name} 
                  onChange={handleChange} 
                  placeholder="למשל: תפוח, חזה עוף" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serving_amount">כמות</Label>
                <Input 
                  id="serving_amount" 
                  name="serving_amount" 
                  type="number"
                  step="0.5"
                  value={formData.serving_amount} 
                  onChange={handleChange} 
                  placeholder="1" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serving_unit">יחידת מידה</Label>
                <Select
                  value={formData.serving_unit}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, serving_unit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spoon">כף</SelectItem>
                    <SelectItem value="teaspoon">כפית</SelectItem>
                    <SelectItem value="gram">גרם</SelectItem>
                    <SelectItem value="piece">יחידה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">קלוריות (kcal)</Label>
                <Input 
                  id="calories" 
                  name="calories" 
                  type="number" 
                  value={formData.calories} 
                  onChange={handleChange} 
                  placeholder="0" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein">חלבון (גרם)</Label>
                <Input 
                  id="protein" 
                  name="protein" 
                  type="number" 
                  value={formData.protein} 
                  onChange={handleChange} 
                  placeholder="0" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">פחמימות (גרם)</Label>
                <Input 
                  id="carbs" 
                  name="carbs" 
                  type="number" 
                  value={formData.carbs} 
                  onChange={handleChange} 
                  placeholder="0" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">שומן (גרם)</Label>
                <Input 
                  id="fat" 
                  name="fat" 
                  type="number" 
                  value={formData.fat} 
                  onChange={handleChange} 
                  placeholder="0" 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              <XCircle className="w-4 h-4 mr-2" />
              ביטול
            </Button>
            <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">
              <Save className="w-4 h-4 mr-2" />
              שמור ארוחה
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}