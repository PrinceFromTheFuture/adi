
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Member } from "@/api/entities";
import { Home, Search, Plus, UserIcon } from "lucide-react";
import { LanguageProvider, useTranslation } from "./components/common/LanguageProvider";

const AppContent = ({ children, currentPageName }) => {
  const location = useLocation();
  const [profileComplete, setProfileComplete] = useState(true);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const { t } = useTranslation();
  
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const user = await User.me();
        const members = await Member.filter({ user_id: user.id });
        const isComplete = members.length > 0;
        
        setProfileComplete(isComplete);
        
        if (!isComplete && !location.pathname.includes('ProfileSetup')) {
          window.location.href = createPageUrl("ProfileSetup");
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        setProfileComplete(false);
        if (error.message.includes("Object not found")) {
            // This is an auth error, user not logged in.
            // Let the page handle it.
        } else if (!location.pathname.includes('ProfileSetup')) {
            window.location.href = createPageUrl("ProfileSetup");
        }
      }
      setIsCheckingProfile(false);
    };

    if (!location.pathname.includes('ProfileSetup')) {
      checkProfile();
    } else {
      setIsCheckingProfile(false);
    }
  }, [location.pathname]);

  if (isCheckingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600" />
      </div>
    );
  }

  if (!profileComplete && !location.pathname.includes('ProfileSetup')) {
    return children;
  }
  
  const navItems = [
    { name: t("Home"), url: createPageUrl("Home"), icon: Home },
    { name: t("Search"), url: createPageUrl("Search"), icon: Search },
    { name: t("Add"), url: createPageUrl("AddDress"), icon: Plus, isAdd: true },
    { name: t("Profile"), url: createPageUrl("Profile"), icon: UserIcon }
  ];

  const isActive = (url) => location.pathname === url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <style>{`
        :root {
          --primary-rose: #8B5A5C;
          --secondary-blush: #F4E6E7;
          --accent-gold: #D4AF37;
          --warm-white: #FEFCFB;
          --soft-gray: #F8F6F5;
        }
      `}</style>
      
      <div className="pb-20 min-h-screen">
        {children}
      </div>

      {profileComplete && !location.pathname.includes('ProfileSetup') && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-rose-100 z-50">
          <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.url);
              
              return (
                <Link
                  key={item.name}
                  to={item.url}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                    active 
                      ? 'text-rose-700 bg-rose-50 scale-110' 
                      : 'text-gray-500 hover:text-rose-600 hover:bg-rose-25'
                  }`}
                >
                  <Icon 
                    className={`w-6 h-6 mb-1 ${
                      item.isAdd && active ? 'fill-current' : ''
                    }`} 
                  />
                  <span className="text-xs font-medium">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <AppContent currentPageName={currentPageName}>
        {children}
      </AppContent>
    </LanguageProvider>
  );
}
