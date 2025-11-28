import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, Share, Plus, Download, X } from "lucide-react";
import { useTranslation } from "@/components/common/LanguageProvider";
import { motion } from "framer-motion";

export default function InstallAppModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [deviceType, setDeviceType] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    // Check if running in standalone mode (PWA)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    // Check if user has already seen the popup
    const hasSeenInstallPopup = localStorage.getItem('switch-install-popup-seen');
    
    if (!hasSeenInstallPopup && !isPWA) {
      // Detect device type
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      
      if (isIOS) {
        setDeviceType('ios');
      } else if (isAndroid) {
        setDeviceType('android');
      }
      
      // Show popup only for mobile devices
      if (isIOS || isAndroid) {
        setTimeout(() => {
          setIsOpen(true);
        }, 1500);
      }
    }
  }, []);

  const handleCloseAndDontShowAgain = () => {
    setIsOpen(false);
    localStorage.setItem('switch-install-popup-seen', 'true');
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const renderInstructions = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">{t('Add to Home Screen')}</h3>
        <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: t('To use Switch like a real app:') }}></p>
      </div>
      
      <div className="text-left text-sm space-y-3">
        <p dangerouslySetInnerHTML={{ __html: t('iPhone (Safari): Tap the Share button → choose Add to Home Screen') }}></p>
        <p dangerouslySetInnerHTML={{ __html: t('Android (Chrome): Tap the ⋮ menu → Add to Home screen') }}></p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{t('Welcome to Switch!')} 👗</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          {renderInstructions()}
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCloseAndDontShowAgain}
            className="flex-1"
          >
            {t("Don't show again")}
          </Button>
          <Button
            onClick={handleClose}
            className="flex-1 bg-rose-600 hover:bg-rose-700"
          >
            {t("OK")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}