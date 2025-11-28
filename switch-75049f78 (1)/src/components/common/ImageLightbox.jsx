import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

export default function ImageLightbox({ images, startIndex = 0, open, onOpenChange }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentIndex(startIndex);
      setIsZoomed(false); // Reset zoom on open
    }
  }, [open, startIndex]);
  
  if (!images || images.length === 0) return null;

  const goToPrevious = (e) => {
    e.stopPropagation();
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setIsZoomed(false);
  };

  const goToNext = (e) => {
    e.stopPropagation();
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setIsZoomed(false);
  };

  const toggleZoom = (e) => {
    e.stopPropagation();
    setIsZoomed(!isZoomed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 bg-black/80 backdrop-blur-sm border-none w-full h-full max-w-full max-h-full flex items-center justify-center">
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 z-50"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 z-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Image Container */}
        <div 
          className="w-full h-full flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={toggleZoom}
        >
          <img 
            src={images[currentIndex]} 
            alt={`Enlarged view ${currentIndex + 1}`} 
            className={`transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'} max-w-full max-h-full object-contain`}
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 z-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
        
        {/* Zoom & Counter Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 text-white p-2 rounded-full z-50">
           <button onClick={toggleZoom} className="p-1">
            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>
          {images.length > 1 && (
            <span className="text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}