"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Save, XCircle, Loader2, Image, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

const GENDERS = [
  { value: "male", label: "גבר" },
  { value: "female", label: "אישה" }
];

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "מעט פעילות" },
  { value: "lightly_active", label: "פעילות קלה" },
  { value: "moderately_active", label: "פעילות בינונית" },
  { value: "very_active", label: "פעילות גבוהה" }
];

const PROFILE_IMAGES = [
  // חיות חמודות
  { id: 'bear', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=bear&backgroundColor=b6e3f4', name: 'דוב' },
  { id: 'cat', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=cat&backgroundColor=d1d4f9', name: 'חתול' },
  { id: 'dog', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=dog&backgroundColor=ffd5dc', name: 'כלב' },
  { id: 'fox', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=fox&backgroundColor=ffdfbf', name: 'שועל' },
  { id: 'lion', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=lion&backgroundColor=c0aede', name: 'אריה' },
  { id: 'panda', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=panda&backgroundColor=d5f4e6', name: 'פנדה' },
  { id: 'rabbit', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=rabbit&backgroundColor=fce7f3', name: 'ארנב' },
  { id: 'tiger', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=tiger&backgroundColor=fed7aa', name: 'נמר' },
  // איברים מאויירים
  { id: 'heart', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=heart&backgroundColor=fecaca&shape=circle', name: '❤️ לב' },
  { id: 'brain', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=brain&backgroundColor=fde68a&shape=circle', name: '🧠 מוח' },
  { id: 'muscle', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=muscle&backgroundColor=fed7aa&shape=circle', name: '💪 שריר' },
  { id: 'lungs', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=lungs&backgroundColor=bfdbfe&shape=circle', name: '🫁 ריאות' },
  { id: 'bone', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=bone&backgroundColor=e5e7eb&shape=circle', name: '🦴 עצם' },
  { id: 'stomach', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=stomach&backgroundColor=d9f99d&shape=circle', name: '🫃 בטן' },
  { id: 'eye', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=eye&backgroundColor=a5f3fc&shape=circle', name: '👁️ עין' },
  { id: 'tooth', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=tooth&backgroundColor=f5f5f4&shape=circle', name: '🦷 שן' }
];

export default function ProfileForm({ initialData, onSave, onCancel, isSaving }) {
  const [formData, setFormData] = useState({
    current_weight: initialData.current_weight || '',
    target_weight: initialData.target_weight || '',
    height: initialData.height || '',
    gender: initialData.gender || '',
    activity_level: initialData.activity_level || '',
    profile_image: initialData.profile_image || '',
    daily_water_goal: initialData.daily_water_goal || 2000,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        ['current_weight', 'target_weight', 'height', 'daily_water_goal'].includes(key) ? Number(value) || null : value,
      ])
    );
    onSave(processedData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <form onSubmit={handleSubmit}>
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>עריכת פרופיל</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                תמונת פרופיל
              </Label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {PROFILE_IMAGES.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => handleSelectChange('profile_image', img.url)}
                    className={`relative w-full aspect-square rounded-xl border-3 transition-all hover:scale-110 ${
                      formData.profile_image === img.url
                        ? 'border-green-500 ring-4 ring-green-200 shadow-lg'
                        : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full rounded-lg" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="current_weight">משקל נוכחי (ק"ג)</Label>
                <Input id="current_weight" name="current_weight" type="number" step="0.1" value={formData.current_weight} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_weight">משקל יעד (ק"ג)</Label>
                <Input id="target_weight" name="target_weight" type="number" step="0.1" value={formData.target_weight} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">גובה (ס"מ)</Label>
                <Input id="height" name="height" type="number" value={formData.height} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="daily_water_goal" className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-500" />
                יעד שתייה יומי (מ"ל)
              </Label>
              <Input 
                id="daily_water_goal" 
                name="daily_water_goal" 
                type="number" 
                step="100" 
                value={formData.daily_water_goal} 
                onChange={handleChange}
                placeholder="2000"
              />
              <p className="text-xs text-gray-500">מומלץ: 2000-3000 מ"ל ליום</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="gender">מגדר</Label>
                <Select name="gender" value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="בחר מגדר" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map(gender => (
                      <SelectItem key={gender.value} value={gender.value}>{gender.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity_level">רמת פעילות</Label>
                <Select name="activity_level" value={formData.activity_level} onValueChange={(value) => handleSelectChange('activity_level', value)}>
                  <SelectTrigger id="activity_level">
                    <SelectValue placeholder="בחר רמת פעילות" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              <XCircle className="w-4 h-4 mr-2" />
              ביטול
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              שמור שינויים
            </Button>
          </CardFooter>
        </Card>
      </form>
    </motion.div>
  );
}