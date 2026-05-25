import { motion } from "framer-motion";
import { Loader2, Search, Shield, CheckCircle, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import mascotExplaining from "@/assets/mascot-explaining.png";

interface LoadingComparisonProps {
  step?: "analyzing" | "comparing" | "preparing";
}

const LoadingComparison = ({ step = "analyzing" }: LoadingComparisonProps) => {
  const { t } = useTranslation();

  const steps = [
    { key: "analyzing", icon: Search, label: t("forms.loading.analyzing") },
    { key: "comparing", icon: Shield, label: t("forms.loading.comparing") },
    { key: "preparing", icon: Sparkles, label: t("forms.loading.preparing") },
  ];

  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-10">
      {/* Animated mascot */}
      <motion.img
        src={mascotExplaining}
        alt="Optimis analyse votre profil"
        className="h-40 w-auto"
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />

      <div className="space-y-6 text-center">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {t("forms.loading.title")}
        </motion.h2>
        
        <div className="space-y-4 max-w-sm mx-auto">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isActive || isCompleted ? 1 : 0.4,
                  x: 0,
                  scale: isActive ? 1.02 : 1,
                }}
                transition={{ delay: index * 0.2 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold" 
                    : isCompleted 
                      ? "bg-green-50 text-green-700" 
                      : "text-muted-foreground"
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isCompleted ? "bg-green-100" : isActive ? "bg-primary/20" : "bg-muted"
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="h-6 w-6 text-primary" />
                    </motion.div>
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                <span className="text-lg">{s.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.p 
        className="text-base text-muted-foreground max-w-md text-center leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {t("forms.loading.message")}
      </motion.p>
    </div>
  );
};

export default LoadingComparison;
