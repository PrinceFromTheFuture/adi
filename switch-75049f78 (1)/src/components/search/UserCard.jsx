
import React from "react";
import { MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/components/common/LanguageProvider";

export default function UserCard({ user }) {
  const { t } = useTranslation();
  return (
    <Link to={createPageUrl(`Profile?userId=${user.user_id}`)}>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
            {user.profile_image ? (
              <img 
                src={user.profile_image} 
                alt={user.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-xl">
                {user.full_name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{user.full_name}</h3>
            {(user.city || user.country) && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPin className="w-3 h-3" />
                <span>{[user.city, user.country].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {user.bio && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{user.bio}</p>
            )}
            
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{user.followers_count || 0} {t('followers')}</span>
              </div>
              {user.instagram_handle && (
                <Badge variant="outline" className="text-xs">
                  @{user.instagram_handle}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
