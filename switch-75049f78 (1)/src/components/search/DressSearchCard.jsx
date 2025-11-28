
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import ImageLightbox from "../common/ImageLightbox";
import { useTranslation } from "@/components/common/LanguageProvider";

export default function DressSearchCard({ dress }) {
  const { t } = useTranslation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

  const handleCardClick = (e) => {
    e.preventDefault();
    if (dress.images && dress.images.length > 0) {
      setLightboxStartIndex(0);
      setLightboxOpen(true);
    }
  };
  
  return (
    <>
      <ImageLightbox
        images={dress.images}
        startIndex={lightboxStartIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative" onClick={handleCardClick}>
          {dress.images && dress.images.length > 0 ? (
            <img 
              src={dress.images[0]} 
              alt={dress.name}
              className="w-full h-48 object-cover cursor-pointer"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center cursor-pointer">
              <span className="text-gray-400 text-sm">{t('No image available')}</span>
            </div>
          )}
          
          <div className="absolute top-2 end-2">
            <Badge className="bg-rose-600 text-white">
              ₪{dress.price_per_day}{t('per_day')}
            </Badge>
          </div>
        </div>
        
        <Link to={createPageUrl(`Profile?userId=${dress.owner?.user_id}`)}>
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 text-sm truncate">
                {dress.name}
              </h4>
              <Badge variant="outline" className="text-xs">
                {dress.size}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{t('by {name}', {name: dress.owner?.full_name})}</span>
              {dress.category && (
                <span className="capitalize">{t(dress.category.replace('_', ' '))}</span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}

