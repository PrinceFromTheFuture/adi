"use client";
import React, { useState, useEffect, useCallback } from "react";

import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileView from "@/components/profile/ProfileView";
import ProfileForm from "@/components/profile/ProfileForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const currentUser = await response.json();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Handle not logged in case if needed
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      // Filter out non-updatable fields just in case
      const { id, email, full_name, role, ...updatableData } = formData;
      
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatableData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      // Refetch user to show updated data
      await fetchUser();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
      // Here you could show an error toast to the user
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto text-center">
        <h2 className="text-xl font-semibold">Could not load user profile.</h2>
        <p className="text-gray-600">Please try refreshing the page or logging in again.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <ProfileHeader user={user} onEdit={() => setIsEditing(true)} isEditing={isEditing} />

      {isEditing ? (
        <ProfileForm initialData={user} onSave={handleSave} onCancel={() => setIsEditing(false)} isSaving={isSaving} />
      ) : (
        <ProfileView user={user} />
      )}
    </div>
  );
}
