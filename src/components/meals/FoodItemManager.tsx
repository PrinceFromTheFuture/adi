"use client";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_LABELS = {
  protein: "חלבון",
  carb: "פחמימה",
  vegetable: "ירק טרי",
  addition: "תוספת",
};

const UNIT_LABELS = {
  spoon: "כף",
  gram: "גרם",
  piece: "יחידה",
};

export default function FoodItemManager({ onClose }) {
  const [foodItems, setFoodItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "protein",
    calories_per_unit: "",
    protein_per_unit: "",
    carbs_per_unit: "",
    fat_per_unit: "",
    unit_type: "spoon",
    default_amount: 1,
  });

  useEffect(() => {
    loadFoodItems();
  }, []);

  const loadFoodItems = async () => {
    try {
      const items = await base44.entities.FoodItem.list("-created_date", 200);
      setFoodItems(items);
    } catch (error) {
      console.error("Error loading food items:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const processedData = {
        ...formData,
        calories_per_unit: Number(formData.calories_per_unit) || 0,
        protein_per_unit: Number(formData.protein_per_unit) || 0,
        carbs_per_unit: Number(formData.carbs_per_unit) || 0,
        fat_per_unit: Number(formData.fat_per_unit) || 0,
        default_amount: Number(formData.default_amount) || 1,
      };

      if (editingItem) {
        await base44.entities.FoodItem.update(editingItem.id, processedData);
      } else {
        await base44.entities.FoodItem.create(processedData);
      }

      setShowForm(false);
      setEditingItem(null);
      setFormData({
        name: "",
        category: "protein",
        calories_per_unit: "",
        protein_per_unit: "",
        carbs_per_unit: "",
        fat_per_unit: "",
        unit_type: "spoon",
        default_amount: 1,
      });
      loadFoodItems();
    } catch (error) {
      console.error("Error saving food item:", error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      calories_per_unit: item.calories_per_unit,
      protein_per_unit: item.protein_per_unit || "",
      carbs_per_unit: item.carbs_per_unit || "",
      fat_per_unit: item.fat_per_unit || "",
      unit_type: item.unit_type,
      default_amount: item.default_amount || 1,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.FoodItem.delete(id);
      loadFoodItems();
    } catch (error) {
      console.error("Error deleting food item:", error);
    }
  };

  const groupedItems = foodItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <Card className="bg-white shadow-xl max-h-[80vh] overflow-auto">
      <CardHeader className="bg-gradient-to-l from-purple-50 to-pink-50 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <CardTitle>ניהול מנות 🥗</CardTitle>
          <div className="flex gap-2">
            <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-green-500">
              <Plus className="w-4 h-4 ml-2" />
              מנה חדשה
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 space-y-4"
            >
              <h3 className="font-bold text-lg">{editingItem ? "ערוך מנה" : "מנה חדשה"}</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>שם המנה</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>

                <div>
                  <Label>קטגוריה</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(CATEGORY_LABELS).map((key) => (
                        <SelectItem key={key} value={key}>
                          {CATEGORY_LABELS[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>יחידת מידה</Label>
                  <Select value={formData.unit_type} onValueChange={(value) => setFormData({ ...formData, unit_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(UNIT_LABELS).map((key) => (
                        <SelectItem key={key} value={key}>
                          {UNIT_LABELS[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>קלוריות ליחידה</Label>
                  <Input
                    type="number"
                    value={formData.calories_per_unit}
                    onChange={(e) => setFormData({ ...formData, calories_per_unit: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>חלבון (גרם)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.protein_per_unit}
                    onChange={(e) => setFormData({ ...formData, protein_per_unit: e.target.value })}
                  />
                </div>

                <div>
                  <Label>פחמימות (גרם)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.carbs_per_unit}
                    onChange={(e) => setFormData({ ...formData, carbs_per_unit: e.target.value })}
                  />
                </div>

                <div>
                  <Label>שומן (גרם)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.fat_per_unit}
                    onChange={(e) => setFormData({ ...formData, fat_per_unit: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                >
                  ביטול
                </Button>
                <Button type="submit" className="bg-green-500">
                  <Save className="w-4 h-4 ml-2" />
                  שמור
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {Object.keys(CATEGORY_LABELS).map((category) => (
          <div key={category}>
            <h3 className="font-bold text-lg mb-3 text-green-800">{CATEGORY_LABELS[category]}</h3>
            <div className="space-y-2">
              {(groupedItems[category] || []).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-xs text-gray-600">
                      {item.calories_per_unit} קל' / {UNIT_LABELS[item.unit_type]}
                      {item.protein_per_unit > 0 && ` • ${item.protein_per_unit}g חלבון`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(item)} variant="ghost" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(item.id)} variant="ghost" size="sm" className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!groupedItems[category] || groupedItems[category].length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">אין מנות בקטגוריה זו</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
