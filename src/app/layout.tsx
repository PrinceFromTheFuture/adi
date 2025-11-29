"use client";
import "./globals.css";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { createPageUrl } from "@/utils";
import { Home, UtensilsCrossed, Dumbbell, TrendingUp, Calendar, User, Droplets, Sparkles, Sun, Leaf } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "דף הבית",
    url: createPageUrl("Dashboard"),
    icon: Home,
    color: "text-green-600",
  },
  {
    title: "ארוחות",
    url: createPageUrl("Meals"),
    icon: UtensilsCrossed,
    color: "text-emerald-600",
  },
  {
    title: "אימונים",
    url: createPageUrl("Workouts"),
    icon: Dumbbell,
    color: "text-lime-600",
  },
  {
    title: "התקדמות",
    url: createPageUrl("Progress"),
    icon: TrendingUp,
    color: "text-teal-600",
  },
  {
    title: "שתייה",
    url: createPageUrl("Water"),
    icon: Droplets,
    color: "text-cyan-600",
  },
  {
    title: "פרופיל",
    url: createPageUrl("Profile"),
    icon: User,
    color: "text-green-700",
  },
];

export default function Layout({ children, currentPageName }) {
  const location = usePathname();

  return (
    <html>
      <body>
        <div dir="rtl">
          <style>
            {`
          :root {
            --primary-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
            --success-gradient: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
            --happy-gradient: linear-gradient(135deg, #ffeaa7 0%, #55efc4 100%);
            --fresh-gradient: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .card-hover {
            transition: all 0.3s ease;
          }
          
          .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.2), 0 10px 10px -5px rgba(16, 185, 129, 0.1);
          }

          @keyframes bounce-gentle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          .animate-bounce-gentle {
            animation: bounce-gentle 2s ease-in-out infinite;
          }
        `}
          </style>

          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
              <Sidebar className="border-l border-green-100 bg-white/90 backdrop-blur-xl" side="right">
                <SidebarHeader className="border-b border-green-100 p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
                      <Leaf className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-2xl gradient-text">בריאות שלי</h2>
                      <p className="text-xs text-green-600 font-medium">המאמן/ת האישי/ת שלך 🌟</p>
                    </div>
                  </div>
                </SidebarHeader>

                <SidebarContent className="p-4">
                  <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold text-green-700 uppercase tracking-wider px-2 py-3">
                      תפריט ראשי
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu className="space-y-2">
                        {navigationItems.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              className={`hover:bg-gradient-to-l hover:from-green-50 hover:to-emerald-50 transition-all duration-300 rounded-xl p-3 ${
                                location === item.url ? "bg-gradient-to-l from-green-100 to-emerald-100 shadow-sm" : ""
                              }`}
                            >
                              <Link href={item.url} className="flex items-center gap-3">
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                                <span className="font-medium text-gray-800">{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>

                  <SidebarGroup className="mt-8">
                    <SidebarGroupLabel className="text-xs font-semibold text-green-700 uppercase tracking-wider px-2 py-3">
                      💪 המוטיבציה שלך
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <div className="px-3 py-4 bg-gradient-to-l from-green-100 via-emerald-100 to-teal-100 rounded-xl border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Sun className="w-5 h-5 text-yellow-500" />
                          <span className="text-sm font-bold text-green-800">השראה יומית</span>
                        </div>
                        <p className="text-sm text-green-700 leading-relaxed font-medium">"כל יום הוא הזדמנות חדשה להיות בריא יותר! 🌱✨"</p>
                      </div>
                    </SidebarGroupContent>
                  </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="border-t border-green-100 p-4">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-l from-green-50 to-emerald-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center shadow-md">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-green-900 text-sm truncate">בואו נשמור על בריאות! 💚</p>
                      <p className="text-xs text-green-600 truncate">אתם עושים עבודה מעולה!</p>
                    </div>
                  </div>
                </SidebarFooter>
              </Sidebar>

              <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 px-6 py-4 md:hidden">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger className="hover:bg-green-100 p-2 rounded-lg transition-colors duration-200" />
                    <h1 className="text-xl font-bold gradient-text">בריאות שלי 🌿</h1>
                  </div>
                </header>

                <div className="flex-1 overflow-auto">{children}</div>
              </main>
            </div>
          </SidebarProvider>
        </div>
      </body>
    </html>
  );
}
