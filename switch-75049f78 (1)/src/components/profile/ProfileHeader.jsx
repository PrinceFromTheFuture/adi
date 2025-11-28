
import React from "react";
import { MapPin, UserPlus, UserMinus, Instagram, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/common/LanguageProvider";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const WhatsAppIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.75 13.96c-.25.13-.58.25-.83.38-.25.13-1.42.69-1.64.75-.23.06-.41.04-.58-.13-.18-.16-.69-1.31-.69-1.31s-.1-.16-.25-.34c-.15-.18-.3-.21-.43-.21-.13,0-.28.03-.41.13-.13.1-.25.21-.38.31s-.25.25-.38.38c-.13.13-.21.2-.31.28-.1.08-.18.13-.28.13-.1,0-.23-.03-.34-.06a1.98 1.98 0 01-1.04-.52 5.48 5.48 0 01-1.7-1.83c-.08-.16-.16-.31-.25-.47-.28-.53-.56-1.06-.56-1.06s-.03-.08-.06-.13c-.03-.05-.06-.08-.1-.13-.1-.1-.21-.13-.31-.1-.1,0-.21.03-.31.06-.1.03-.23.08-.34.13-.1.05-.21.1-.31.18-.1.08-.16.15-.21.23-.05.08-.08.16-.1.25-.03.08-.03.16-.03.23,0,.1.03.2.06.28.18.41.36.82.56 1.23.2.41.41.82.64 1.23.23.41.48.8.75 1.15.28.35.58.68.91.96.33.28.69.53 1.06.73.38.2.78.36 1.18.48.4.13.81.2 1.23.2.41,0,.8-.05,1.15-.15.35-.1.68-.23.99-.41.3-.18.58-.38.81-.64.23-.25.43-.53.58-.86.15-.33.23-.69.23-1.06,0-.1-.03-.2-.05-.28-.03-.08-.06-.15-.1-.21z M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
  </svg>
);

export default function ProfileHeader({ 
  member, 
  dressCount, 
  isOwnProfile, 
  isFollowing, 
  followLoading,
  onFollowToggle,
  onFollowersClick,
  onFollowingClick
}) {
  const { t } = useTranslation();
  const handleContactClick = (contactMethod) => {
    if (!member) return;

    let url = '';

    switch (contactMethod) {
      case 'whatsapp':
        if (member.phone_number) {
          const cleanNumber = member.phone_number.replace(/\D/g, '');
          const message = encodeURIComponent(t("Hi! I found you on Switch and I'm interested in your dress collection."));
          url = `https://wa.me/${cleanNumber}?text=${message}`;
        }
        break;
      case 'instagram':
        if (member.instagram_handle) {
          const handle = member.instagram_handle.replace('@', '');
          url = `https://instagram.com/${handle}`;
        }
        break;
      case 'email':
        if (member.contact_email) {
          const subject = encodeURIComponent(t('Hi from Switch!'));
          const body = encodeURIComponent(t('Hi {name}!\n\nI found you on Switch and I\'m interested in your dress collection.', {name: member.full_name}));
          url = `mailto:${member.contact_email}?subject=${subject}&body=${body}`;
        }
        break;
      default:
        return;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert(t("{name} hasn't set up their contact information for this method yet.", {name: member.full_name}));
    }
  };
  
  const getContactMethods = () => {
    const methods = [];
    if (member?.instagram_handle) methods.push('instagram');
    if (member?.phone_number) methods.push('whatsapp');
    if (member?.contact_email) methods.push('email');
    return methods;
  };

  const contactMethods = getContactMethods();

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6 mb-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
          {member.profile_image ? (
            <img 
              src={member.profile_image} 
              alt={member.full_name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-2xl">
              {member.full_name?.charAt(0) || 'U'}
            </span>
          )}
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{member.full_name}</h2>
          {(member.city || member.country) && (
            <div className="flex items-center gap-1 text-gray-500 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{[member.city, member.country].filter(Boolean).join(', ')}</span>
            </div>
          )}
          
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{dressCount}</p>
              <p className="text-sm text-gray-500">{t('Dresses')}</p>
            </div>
            <button 
              onClick={onFollowersClick} 
              className="text-center hover:opacity-75 transition-opacity"
            >
              <p className="text-2xl font-bold text-gray-900">{member.followers_count || 0}</p>
              <p className="text-sm text-gray-500">{t('Followers')}</p>
            </button>
            <button 
              onClick={onFollowingClick} 
              className="text-center hover:opacity-75 transition-opacity"
            >
              <p className="text-2xl font-bold text-gray-900">{member.following_count || 0}</p>
              <p className="text-sm text-gray-500">{t('Following')}</p>
            </button>
          </div>
        </div>
      </div>

      {member.bio && (
        <p className="text-gray-600 mb-6 leading-relaxed">{member.bio}</p>
      )}
      
      {!isOwnProfile && (
        <div className="space-y-3">
          <Button 
            onClick={onFollowToggle}
            disabled={followLoading}
            className={`w-full transition-all duration-200 ${
              isFollowing 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-rose-600 text-white hover:bg-rose-700'
            }`}
          >
            {followLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current me-2" />
                {isFollowing ? t('Unfollowing...') : t('Following...')}
              </>
            ) : isFollowing ? (
              <>
                <UserMinus className="w-4 h-4 me-2" />
                {t('Following')}
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 me-2" />
                {t('Follow')}
              </>
            )}
          </Button>
          
          {contactMethods.length > 0 && (
            <div className="space-y-2 pt-4">
              <p className="text-sm font-medium text-gray-700">{t('Contact {name}:', {name: member.full_name})}</p>
              <div className="flex gap-2">
                {contactMethods.includes('instagram') && (
                  <Button 
                    onClick={() => handleContactClick('instagram')} 
                    variant="outline" 
                    className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    <Instagram className="w-4 h-4 me-2" />
                    {t('Instagram')}
                  </Button>
                )}
                {contactMethods.includes('whatsapp') && (
                  <Button 
                    onClick={() => handleContactClick('whatsapp')} 
                    variant="outline" 
                    className="flex-1 border-green-300 text-green-600 hover:bg-green-50"
                  >
                    <WhatsAppIcon className="w-4 h-4 me-2" />
                    {t('WhatsApp')}
                  </Button>
                )}
                {contactMethods.includes('email') && (
                  <Button 
                    onClick={() => handleContactClick('email')} 
                    variant="outline" 
                    className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Mail className="w-4 h-4 me-2" />
                    {t('Email')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
