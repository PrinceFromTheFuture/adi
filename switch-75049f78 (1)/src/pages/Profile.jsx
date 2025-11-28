
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { Dress } from "@/api/entities";
import { Follow } from "@/api/entities";
import { Member } from "@/api/entities";
import { Settings, Grid, Calendar as CalendarIcon, UserPlus, UserMinus, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/components/common/LanguageProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ProfileHeader from "../components/profile/ProfileHeader";
import DressGrid from "../components/profile/DressGrid";
import FollowListModal from "../components/profile/FollowListModal";
import PublicCalendarView from "../components/profile/PublicCalendarView";

export default function Profile() {
  const { t } = useTranslation();
  const [member, setMember] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [dresses, setDresses] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [modalState, setModalState] = useState({ open: false, listType: 'followers' });
  const [profileUpdateMessage, setProfileUpdateMessage] = useState('');
  
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');
  const isOwnProfile = !userId;

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const current = await User.me();
      setCurrentUser(current);
      
      const profileUserId = isOwnProfile ? current.id : userId;
      
      const members = await Member.filter({ user_id: profileUserId });
      if (members.length === 0) {
        if(isOwnProfile) {
          window.location.href = createPageUrl("ProfileSetup");
        } else {
          setMember(null);
        }
        setIsLoading(false);
        return;
      }
      
      const profileMember = members[0];
      
      // Load followers/following counts
      const followersCount = await Follow.filter({ following_id: profileUserId });
      const followingCount = await Follow.filter({ follower_id: profileUserId });
      
      setMember({
        ...profileMember,
        followers_count: followersCount.length,
        following_count: followingCount.length
      });
      
      if (!isOwnProfile) {
        const followRecord = await Follow.filter({ 
          follower_id: current.id, 
          following_id: profileUserId 
        });
        setIsFollowing(followRecord.length > 0);
      }
      
      const userDresses = await Dress.filter({ owner_id: profileUserId }, 'displayOrder');
      setDresses(userDresses || []);

    } catch (error) {
      console.error("Error loading profile:", error);
    }
    setIsLoading(false);
  }, [isOwnProfile, userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Check for profile update message from localStorage
  useEffect(() => {
    const updateMessage = localStorage.getItem('profile-update-message');
    if (updateMessage) {
      setProfileUpdateMessage(updateMessage);
      localStorage.removeItem('profile-update-message');
      setTimeout(() => setProfileUpdateMessage(''), 3000);
    }
  }, []);

  const handleFollowToggle = async () => {
    if (!currentUser || !member || followLoading || isOwnProfile) return;

    setFollowLoading(true);
    try {
      const [currentUserMemberArr, targetUserMemberArr] = await Promise.all([
        Member.filter({ user_id: currentUser.id }),
        Member.filter({ user_id: member.user_id })
      ]);
      const currentUserMember = currentUserMemberArr[0];
      const targetUserMember = targetUserMemberArr[0];

      if (isFollowing) {
        // Unfollow
        const followRecords = await Follow.filter({ 
          follower_id: currentUser.id, 
          following_id: member.user_id 
        });
        if (followRecords.length > 0) {
          await Follow.delete(followRecords[0].id);
        }
        // Update counts
        if (currentUserMember) await Member.update(currentUserMember.id, { following_count: (currentUserMember.following_count || 1) - 1 });
        if (targetUserMember) await Member.update(targetUserMember.id, { followers_count: (targetUserMember.followers_count || 1) - 1 });

      } else {
        // Follow - Check if a follow record already exists to prevent duplicates
        const existingFollow = await Follow.filter({
          follower_id: currentUser.id,
          following_id: member.user_id
        });

        if (existingFollow.length === 0) {
            await Follow.create({
              follower_id: currentUser.id,
              following_id: member.user_id
            });
            // Update counts
            if (currentUserMember) await Member.update(currentUserMember.id, { following_count: (currentUserMember.following_count || 0) + 1 });
            if (targetUserMember) await Member.update(targetUserMember.id, { followers_count: (targetUserMember.followers_count || 0) + 1 });
        }
      }
      
      // Reload to get accurate data
      await loadProfile();
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
    setFollowLoading(false);
  };
  
  const openFollowersModal = (listType) => {
    setModalState({ open: true, listType });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-2xl" />
          <div className="h-24 bg-gray-200 rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('User Not Found')}</h2>
          <p className="text-gray-500 mt-2">{t('The profile you are looking for does not exist.')}</p>
          <Link to={createPageUrl("Home")}>
            <Button className="mt-6 bg-rose-600 hover:bg-rose-700">{t('Go to Home')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <div className="bg-white/80 backdrop-blur-lg border-b border-rose-100 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900 truncate">
            {isOwnProfile ? t('My Profile') : member.full_name}
          </h1>
          {isOwnProfile && (
            <Link to={createPageUrl("EditProfile")}>
              <Button variant="ghost" size="icon" className="text-rose-600 hover:bg-rose-50">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="p-4 pb-24">
        {profileUpdateMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded-2xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {profileUpdateMessage}
            </div>
          </div>
        )}
        
        <ProfileHeader 
          member={member} 
          dressCount={dresses.length}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          followLoading={followLoading}
          onFollowToggle={handleFollowToggle}
          onFollowersClick={() => openFollowersModal('followers')}
          onFollowingClick={() => openFollowersModal('following')}
        />
        
        <Tabs defaultValue="dresses" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 mb-6">
            <TabsTrigger value="dresses">
              <Grid className="w-4 h-4 mr-2" />
              {t('Dresses')}
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {t('Calendar')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dresses">
            <DressGrid 
              dresses={dresses} 
              isOwnProfile={isOwnProfile}
              onRefresh={loadProfile}
            />
          </TabsContent>
          <TabsContent value="calendar">
            <PublicCalendarView 
              ownerId={member.user_id}
              isOwnProfile={isOwnProfile}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <FollowListModal
        open={modalState.open}
        onOpenChange={(open) => setModalState(prev => ({ ...prev, open }))}
        userId={member.user_id}
        listType={modalState.listType}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
}
