
import React, { useState, useEffect } from "react";
import { Dress } from "@/api/entities";
import { Follow } from "@/api/entities";
import { User } from "@/api/entities";
import { Member } from "@/api/entities";
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useTranslation } from "@/components/common/LanguageProvider"; // Updated import path

import DressCard from "../components/home/DressCard";
import HomeHeader from "../components/home/HomeHeader";
import InstallAppModal from "../components/common/InstallAppModal";

export default function Home() {
  const [dresses, setDresses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      const userFollowing = await Follow.filter({ follower_id: user.id });
      const followingIds = userFollowing.map(f => f.following_id);
      
      const allDresses = await Dress.filter({ is_available: true }, '-created_date', 50);
      
      let feedDresses;
      if (followingIds.length > 0) {
        feedDresses = allDresses.filter(dress => followingIds.includes(dress.owner_id));
      } else {
        feedDresses = allDresses;
      }
      
      const ownerIds = [...new Set(feedDresses.map(d => d.owner_id))];
      if (ownerIds.length === 0) {
        setDresses([]);
        setIsLoading(false);
        return;
      }
      
      const members = await Member.filter({ user_id: { $in: ownerIds } });
      const membersMap = new Map(members.map(m => [m.user_id, m]));

      const dressesWithOwners = feedDresses
        .map(dress => ({
          ...dress,
          owner: membersMap.get(dress.owner_id)
        }))
        .filter(dress => dress.owner);

      setDresses(dressesWithOwners);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
        <InstallAppModal />
        <HomeHeader />
        <div className="px-4 py-6 space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>
              <div className="h-80 bg-gray-200 rounded-xl mb-4" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <InstallAppModal />
      <HomeHeader />
      
      <div className="px-4 py-6 pb-24">
        {dresses.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-12 h-12 text-rose-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('Welcome to Switch! Feed')}</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {t('Start by adding dresses to your closet or discover other users to follow')}
            </p>
            <div className="flex gap-3 justify-center">
              <Link 
                to={createPageUrl("AddDress")}
                className="inline-flex items-center px-6 py-3 bg-rose-600 text-white rounded-full font-medium hover:bg-rose-700 transition-colors"
              >
                {t('Add Your First Dress')}
              </Link>
              <Link 
                to={createPageUrl("Search")}
                className="inline-flex items-center px-6 py-3 bg-white border border-rose-200 text-rose-600 rounded-full font-medium hover:bg-rose-50 transition-colors"
              >
                {t('Discover Users')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {dresses.map((dress) => (
              <DressCard 
                key={dress.id} 
                dress={dress} 
                currentUser={currentUser}
                onRefresh={loadData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
