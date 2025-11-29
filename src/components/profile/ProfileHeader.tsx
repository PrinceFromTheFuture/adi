"use client";
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

export default function ProfileHeader({ user, onEdit, isEditing }) {
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name[0];
  };

  return (
    <Card className="relative overflow-hidden card-hover">
      <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500" />
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-20">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
            {user.profile_image ? (
              <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              getInitials(user.full_name)
            )}
          </div>
          <div className="flex-1 text-center sm:text-right">
            <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
          </div>
          {!isEditing && (
            <Button onClick={onEdit}>
              <Pencil className="w-4 h-4 ml-2" />
              ערוך פרופיל
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}