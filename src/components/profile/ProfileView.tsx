"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Target, Ruler, Activity, Award, User } from 'lucide-react';
import { motion } from 'framer-motion';

const GENDER_LABELS = {
  "male": "גבר",
  "female": "אישה"
};

const ACTIVITY_LEVEL_LABELS = {
  "sedentary": "מעט פעילות",
  "lightly_active": "פעילות קלה",
  "moderately_active": "פעילות בינונית",
  "very_active": "פעילות גבוהה"
};

const StatItem = ({ icon: Icon, label, value, unit, badge, colorClass }) => (
  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
    <div className={`p-3 rounded-full ${colorClass.bg}`}>
      <Icon className={`w-5 h-5 ${colorClass.text}`} />
    </div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      {badge ? (
         <Badge variant="secondary" className="mt-1 text-md">{value || 'לא הוגדר'}</Badge>
      ) : (
        <p className="text-xl font-bold text-gray-900">
          {value || 'לא הוגדר'} {value && <span className="text-base font-normal text-gray-500">{unit}</span>}
        </p>
      )}
    </div>
  </div>
);

export default function ProfileView({ user }) {
  const stats = [
    { 
      icon: Target, 
      label: 'משקל יעד', 
      value: user.target_weight, 
      unit: 'ק"ג', 
      colorClass: {bg: 'bg-green-100', text: 'text-green-600'} 
    },
    { 
      icon: Dumbbell, 
      label: 'משקל נוכחי', 
      value: user.current_weight, 
      unit: 'ק"ג', 
      colorClass: {bg: 'bg-blue-100', text: 'text-blue-600'} 
    },
    { 
      icon: Ruler, 
      label: 'גובה', 
      value: user.height, 
      unit: 'ס"מ', 
      colorClass: {bg: 'bg-purple-100', text: 'text-purple-600'} 
    },
    { 
      icon: User, 
      label: 'מגדר', 
      value: GENDER_LABELS[user.gender] || user.gender, 
      badge: true, 
      colorClass: user.gender === 'female' ? {bg: 'bg-pink-100', text: 'text-pink-600'} : {bg: 'bg-blue-100', text: 'text-blue-600'} 
    },
    { 
      icon: Activity, 
      label: 'רמת פעילות', 
      value: ACTIVITY_LEVEL_LABELS[user.activity_level] || user.activity_level, 
      badge: true, 
      colorClass: {bg: 'bg-orange-100', text: 'text-orange-600'} 
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="card-hover bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>הפרופיל שלי</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.map((stat, index) => <StatItem key={index} {...stat} />)}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}