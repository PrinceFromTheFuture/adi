"use client";
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Plus, Minus, ChefHat, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_LABELS = {
  protein: 'חלבון',
  carb: 'פחמימה',
  vegetable: 'ירק טרי',
  addition: 'תוספת'
};

const UNIT_LABELS = {
  spoon: 'כפות',
  gram: 'גרם',
  piece: 'יחידות'
};

export default function MealBuilder({ onSave, onCancel, selectedMealType }) {
  const [foodItems, setFoodItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [mealName, setMealName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFoodItems();
  }, []);

  const loadFoodItems = async () => {
    try {
      const items = await base44.entities.FoodItem.list('-created_date', 200);
      setFoodItems(items);
    } catch (error) {
      console.error('Error loading food items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = (category) => {
    setSelectedItems([...selectedItems, {
      id: Date.now(),
      category,
      food_item_id: '',
      amount: 1,
      food_name: '',
      unit_type: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    }]);
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === id) {
        if (field === 'food_item_id') {
          const foodItem = foodItems.find(f => f.id === value);
          if (foodItem) {
            return {
              ...item,
              food_item_id: value,
              food_name: foodItem.name,
              unit_type: foodItem.unit_type,
              calories: (foodItem.calories_per_unit || 0) * item.amount,
              protein: (foodItem.protein_per_unit || 0) * item.amount,
              carbs: (foodItem.carbs_per_unit || 0) * item.amount,
              fat: (foodItem.fat_per_unit || 0) * item.amount
            };
          }
        } else if (field === 'amount') {
          const foodItem = foodItems.find(f => f.id === item.food_item_id);
          if (foodItem) {
            return {
              ...item,
              amount: Number(value),
              calories: (foodItem.calories_per_unit || 0) * Number(value),
              protein: (foodItem.protein_per_unit || 0) * Number(value),
              carbs: (foodItem.carbs_per_unit || 0) * Number(value),
              fat: (foodItem.fat_per_unit || 0) * Number(value)
            };
          }
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    return selectedItems.reduce((acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const handleSave = async () => {
    if (!mealName || selectedItems.length === 0) return;

    const totals = calculateTotals();
    const savedMeal = {
      meal_name: mealName,
      items: selectedItems.map(item => ({
        food_item_id: item.food_item_id,
        food_name: item.food_name,
        category: item.category,
        amount: item.amount,
        unit_type: item.unit_type,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat
      })),
      total_calories: totals.calories,
      total_protein: totals.protein,
      total_carbs: totals.carbs,
      total_fat: totals.fat
    };

    try {
      await base44.entities.SavedMeal.create(savedMeal);
      onSave(savedMeal, selectedMealType);
    } catch (error) {
      console.error('Error saving meal:', error);
    }
  };

  const totals = calculateTotals();
  const categories = ['protein', 'carb', 'vegetable', 'addition'];

  if (isLoading) {
    return <div className="animate-pulse">טוען...</div>;
  }

  return (
    <Card className="bg-white shadow-xl">
      <CardHeader className="bg-gradient-to-l from-green-50 to-emerald-50">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <ChefHat className="w-6 h-6" />
          הרכבת ארוחה 🍽️
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <Label htmlFor="mealName" className="font-bold">שם הארוחה</Label>
          <Input
            id="mealName"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            placeholder="למשל: ארוחת בוקר בריאה"
            className="mt-2"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map(category => (
            <Button
              key={category}
              onClick={() => addItem(category)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {CATEGORY_LABELS[category]}
            </Button>
          ))}
        </div>

        <AnimatePresence>
          {selectedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-green-700">{CATEGORY_LABELS[item.category]}</span>
                <Button
                  onClick={() => removeItem(item.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid gap-3">
                <div>
                  <Label className="text-xs">בחר מנה</Label>
                  <Select
                    value={item.food_item_id}
                    onValueChange={(value) => updateItem(item.id, 'food_item_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר..." />
                    </SelectTrigger>
                    <SelectContent>
                      {foodItems
                        .filter(f => f.category === item.category)
                        .map(f => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {item.food_item_id && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">כמות</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={item.amount}
                        onChange={(e) => updateItem(item.id, 'amount', e.target.value)}
                        className="text-center"
                      />
                    </div>
                    <div className="flex items-end">
                      <span className="text-sm text-gray-600 pb-2">{UNIT_LABELS[item.unit_type]}</span>
                    </div>
                  </div>
                )}

                {item.food_item_id && (
                  <div className="text-xs text-gray-600 grid grid-cols-4 gap-1 pt-2 border-t">
                    <div><strong>{item.calories?.toFixed(0)}</strong> קל'</div>
                    <div><strong>{item.protein?.toFixed(1)}</strong>g חלבון</div>
                    <div><strong>{item.carbs?.toFixed(1)}</strong>g פחמ'</div>
                    <div><strong>{item.fat?.toFixed(1)}</strong>g שומן</div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {selectedItems.length > 0 && (
          <Card className="bg-gradient-to-l from-blue-50 to-cyan-50 border-2 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-bold text-blue-900 mb-2">סיכום תזונתי</h4>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-2xl font-bold text-pink-600">{totals.calories.toFixed(0)}</p>
                  <p className="text-xs text-gray-600">קלוריות</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{totals.protein.toFixed(1)}g</p>
                  <p className="text-xs text-gray-600">חלבון</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{totals.carbs.toFixed(1)}g</p>
                  <p className="text-xs text-gray-600">פחמימות</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{totals.fat.toFixed(1)}g</p>
                  <p className="text-xs text-gray-600">שומן</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 justify-end">
          <Button onClick={onCancel} variant="outline">
            <X className="w-4 h-4 ml-2" />
            ביטול
          </Button>
          <Button
            onClick={handleSave}
            disabled={!mealName || selectedItems.length === 0}
            className="bg-green-500 hover:bg-green-600"
          >
            <Save className="w-4 h-4 ml-2" />
            שמור ארוחה
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}