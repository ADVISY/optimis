import { Users, ThumbsUp, BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const StatsBar = () => {
  const { t } = useTranslation();

  const stats = [
    { 
      icon: Users, 
      value: "+10,000", 
      labelKey: "stats.usersLabel",
      sublabelKey: "stats.usersSublabel"
    },
    { 
      icon: ThumbsUp, 
      value: "95%", 
      labelKey: "stats.recommendLabel",
      sublabelKey: "stats.recommendSublabel"
    },
    { 
      icon: BadgeCheck, 
      value: "100%", 
      labelKey: "stats.freeLabel",
      sublabelKey: "stats.freeSublabel"
    },
  ];

  return (
    <section className="py-10 md:py-12 bg-background border-b">
      <div className="container">
        {/* Mobile: vertical centered layout */}
        <div className="md:hidden flex flex-col gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center gap-2">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value} {t(stat.labelKey)}</p>
              <p className="text-sm text-muted-foreground">{t(stat.sublabelKey)}</p>
            </div>
          ))}
        </div>
        {/* Desktop: horizontal layout */}
        <div className="hidden md:grid grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-4 justify-center md:justify-start">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value} {t(stat.labelKey)}</p>
                <p className="text-muted-foreground">{t(stat.sublabelKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
