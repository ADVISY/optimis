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
    <section className="py-12 bg-background border-b">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
