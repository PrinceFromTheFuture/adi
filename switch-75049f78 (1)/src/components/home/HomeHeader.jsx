
import React from "react";
import { Bell, Settings, Sparkles } from "lucide-react";
import LanguageSelector from "@/components/common/LanguageSelector";
import { useTranslation } from "@/components/common/LanguageProvider";

export default function HomeHeader() {
  const { t } = useTranslation();
  return (
    <div className="bg-white/80 backdrop-blur-lg border-b border-rose-100 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-fuchsia-500 via-red-500 to-orange-400 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-600 via-red-600 to-orange-500 bg-clip-text text-transparent">
            {t('Switch')}
          </h1>
        </div>
        
        <div className="flex items-center gap-1">
          <LanguageSelector />
          <button className="p-2 rounded-full hover:bg-rose-50 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-rose-50 transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
