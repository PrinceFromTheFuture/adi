"use client";
import { Card } from "@/components/ui/card";
import { Sparkles, Sun, Moon, Heart, Smile } from "lucide-react";
import { format } from "date-fns";
import { getGenderedText } from "../utils/genderHelper";

export default function WelcomeCard({ user }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "בוקר טוב", icon: Sun, emoji: "☀️" };
    if (hour < 18) return { text: "צהריים טובים", icon: Sun, emoji: "🌤️" };
    return { text: "ערב טוב", icon: Moon, emoji: "🌙" };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const motivationalMessages = [
    "היום הוא יום מושלם להיות בריא! 🌱",
    getGenderedText(user?.gender, "כל צעד קטן מקרב אותך ליעד! 💪", "כל צעד קטן מקרב אותך ליעד! 💪"),
    getGenderedText(user?.gender, "אתה עושה עבודה מדהימה! המשך כך! ✨", "את עושה עבודה מדהימה! המשיכי כך! ✨"),
    getGenderedText(user?.gender, "הגוף שלך אוהב אותך על השמירה על בריאות! 💚", "הגוף שלך אוהב אותך על השמירה על בריאות! 💚"),
    getGenderedText(user?.gender, "היום תהיה החזק ביותר שלך! 🔥", "היום תהיי החזקה ביותר שלך! 🔥"),
  ];

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  const getDayName = () => {
    const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    return days[new Date().getDay()];
  };

  const getMonthName = () => {
    const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
    return months[new Date().getMonth()];
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white card-hover shadow-2xl">
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Fun decorative elements */}
      <div className="absolute top-4 right-4 opacity-20">
        <div className="w-32 h-32 rounded-full border-4 border-white/30 animate-pulse"></div>
        <div className="absolute top-8 left-8 w-16 h-16 rounded-full border-4 border-white/40"></div>
      </div>
      <div className="absolute bottom-4 left-4 opacity-20">
        <Heart className="w-24 h-24 animate-bounce-gentle" />
      </div>

      <div className="relative p-8">
        <div className="flex items-center gap-3 mb-4">
          <GreetingIcon className="w-8 h-8 text-yellow-300 animate-bounce" />
          <span className="text-2xl font-bold">
            {greeting.text} {greeting.emoji}
          </span>
          <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
        </div>

        <h1 className="text-4xl font-bold mb-3 drop-shadow-lg">
          {user?.full_name ? `${user.full_name.split(" ")[0]}! 🎉` : getGenderedText(user?.gender, "ברוך הבא! 🌟", "ברוכה הבאה! 🌟")}
        </h1>

        <p className="text-green-100 text-lg mb-4 font-medium">{randomMessage}</p>

        <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 w-fit">
          <Smile className="w-5 h-5 text-yellow-300" />
          <span className="text-sm font-medium">
            יום {getDayName()}, {format(new Date(), "d")} ב{getMonthName()} {format(new Date(), "yyyy")}
          </span>
        </div>
      </div>
    </Card>
  );
}
