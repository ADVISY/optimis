import { motion } from "framer-motion";
import { Loader2, Search, Shield, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LoadingComparisonProps {
  step?: "analyzing" | "comparing" | "preparing";
}

const LoadingComparison = ({ step = "analyzing" }: LoadingComparisonProps) => {
  const { t } = useTranslation();

  const steps = [
    { key: "analyzing", icon: Search, label: t("comparison.loading.analyzing") },
    { key: "comparing", icon: Shield, label: t("comparison.loading.comparing") },
    { key: "preparing", icon: CheckCircle, label: t("comparison.loading.preparing") },
  ];

  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="h-16 w-16 text-primary" />
      </motion.div>

      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-bold text-foreground">
          {t("comparison.loading.title")}
        </h2>
        
        <div className="space-y-3">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <motion.div
                key={s.key}
                initial={{ opacity: 0.5 }}
                animate={{
                  opacity: isActive || isCompleted ? 1 : 0.5,
                  scale: isActive ? 1.05 : 1,
                }}
                className={`flex items-center gap-3 justify-center ${
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isCompleted ? "text-green-500" : isActive ? "text-primary" : ""
                  }`}
                />
                <span>{s.label}</span>
                {isCompleted && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-muted-foreground max-w-md text-center">
        {t("comparison.loading.message")}
      </p>
    </div>
  );
};

export default LoadingComparison;
