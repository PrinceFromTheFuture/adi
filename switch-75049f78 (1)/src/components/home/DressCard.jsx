
import React, { useState } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import ImageLightbox from "../common/ImageLightbox";

export default function DressCard({ dress, currentUser, onRefresh }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

  const openLightbox = (index) => {
    setLightboxStartIndex(index);
    setLightboxOpen(true);
  };
  
  const handleImageSwipe = (e, direction) => {
    e.stopPropagation(); 
    if (!dress.images || dress.images.length <= 1) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentImageIndex + 1) % dress.images.length;
    } else {
      newIndex = (currentImageIndex - 1 + dress.images.length) % dress.images.length;
    }
    setCurrentImageIndex(newIndex);
  };

  const handleContactPress = () => {
    const owner = dress.owner;
    if (!owner) return;

    let contactMethod;
    if (owner.phone_number) contactMethod = 'whatsapp';
    else if (owner.instagram_handle) contactMethod = 'instagram';
    else if (owner.contact_email) contactMethod = 'email';
    
    let url = '';

    switch (contactMethod) {
      case 'whatsapp':
        const cleanNumber = owner.phone_number.replace(/\D/g, '');
        const message = encodeURIComponent(`Hi! I'm interested in renting your ${dress.name} dress from Switch`);
        url = `https://wa.me/${cleanNumber}?text=${message}`;
        break;
      case 'instagram':
        const handle = owner.instagram_handle.replace('@', '');
        url = `https://instagram.com/${handle}`;
        break;
      case 'email':
        const subject = encodeURIComponent(`Interested in renting ${dress.name}`);
        const body = encodeURIComponent(`Hi! I saw your ${dress.name} dress on Switch and would love to rent it.`);
        url = `mailto:${owner.contact_email}?subject=${subject}&body=${body}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'ILS': '₪',
      'USD': '$',
      'EUR': '€'
    };
    return symbols[currency] || '₪'; // Default to ILS if currency is not recognized or not provided
  };

  if (!dress.owner) return null;

  return (
    <>
      <ImageLightbox 
        images={dress.images}
        startIndex={lightboxStartIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
      <div className="bg-white rounded-3xl shadow-sm border border-rose-100 overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <Link 
            to={createPageUrl(`Profile?userId=${dress.owner.user_id}`)}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center">
              {dress.owner.profile_image ? (
                <img 
                  src={dress.owner.profile_image} 
                  alt={dress.owner.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {dress.owner.full_name?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{dress.owner.full_name}</p>
              {dress.owner.location && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{dress.owner.location}</span>
                </div>
              )}
            </div>
          </Link>
          
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div 
          className="relative" 
          onClick={() => dress.images?.length > 0 && openLightbox(currentImageIndex)}
        >
          {dress.images && dress.images.length > 0 ? (
            <>
              <img 
                src={dress.images[currentImageIndex]} 
                alt={dress.name}
                className="w-full h-96 object-cover cursor-pointer"
              />
              
              {dress.images.length > 1 && (
                <>
                  <div 
                    onClick={(e) => handleImageSwipe(e, 'prev')}
                    className="absolute left-0 top-0 w-1/4 h-full z-10"
                  />
                  <div 
                    onClick={(e) => handleImageSwipe(e, 'next')}
                    className="absolute right-0 top-0 w-1/4 h-full z-10"
                  />
                  
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {dress.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="transition-colors"
            >
              <Heart 
                className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} 
              />
            </button>
            <button 
              onClick={handleContactPress}
              className="transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-gray-700" />
            </button>
            <button className="transition-colors">
              <Share className="w-6 h-6 text-gray-700" />
            </button>
          </div>
          
          <div className="text-2xl font-bold text-rose-600">
            {getCurrencySymbol(dress.owner.currency)}{dress.price_per_day}/day
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg text-gray-900">{dress.name}</h3>
            <Badge variant="outline" className="text-xs">
              {dress.size}
            </Badge>
          </div>
          
          {dress.description && (
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {dress.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 flex-wrap">
            {dress.brand && (
              <Badge className="bg-rose-100 text-rose-700 border-rose-200">
                {dress.brand}
              </Badge>
            )}
            {dress.category && (
              <Badge variant="outline" className="text-xs capitalize">
                {dress.category.replace('_', ' ')}
              </Badge>
            )}
            {dress.color && (
              <Badge variant="outline" className="text-xs">
                {dress.color}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
