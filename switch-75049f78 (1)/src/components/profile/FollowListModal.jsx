import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Follow } from "@/api/entities";
import { Member } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserIcon } from "lucide-react";

export default function FollowListModal({ open, onOpenChange, userId, listType, isOwnProfile }) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      if (!open || !userId) return;
      
      setIsLoading(true);
      try {
        const followFilter = listType === 'followers' ? { following_id: userId } : { follower_id: userId };
        const followRecords = await Follow.filter(followFilter);
        
        const userIds = followRecords.map(record => 
          listType === 'followers' ? record.follower_id : record.following_id
        );

        if (userIds.length > 0) {
          const memberRecords = await Member.filter({ user_id: { $in: userIds } });
          setMembers(memberRecords);
        } else {
          setMembers([]);
        }
      } catch (error) {
        console.error("Error loading follow list:", error);
        setMembers([]);
      }
      setIsLoading(false);
    };

    loadUsers();
  }, [open, userId, listType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {listType === 'followers' 
              ? (isOwnProfile ? 'My Followers' : 'Followers') 
              : (isOwnProfile ? 'Following' : 'Following')
            }
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No {listType} yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <Link
                  key={member.id}
                  to={createPageUrl(`Profile?userId=${member.user_id}`)}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                    {member.profile_image ? (
                      <img 
                        src={member.profile_image} 
                        alt={member.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold">
                        {member.full_name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{member.full_name}</p>
                    {member.location && (
                      <p className="text-sm text-gray-500">{member.location}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}