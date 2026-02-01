import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const FormProgress = ({ currentStep, totalSteps, className }: FormProgressProps) => {
  const { t } = useTranslation();
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn("w-full space-y-1.5 md:space-y-3", className)}>
      <div className="flex justify-between items-center text-xs md:text-base">
        <span className="font-semibold text-foreground">
          {t("forms.stepOf", { current: currentStep, total: totalSteps, defaultValue: `Étape ${currentStep} sur ${totalSteps}` })}
        </span>
        <span className="text-sm md:text-lg font-bold text-primary">{Math.round(progress)}%</span>
      </div>
      <div className="relative">
        <Progress value={progress} className="h-2 md:h-3 rounded-full" />
        {/* Animated glow effect */}
        <div 
          className="absolute top-0 left-0 h-2 md:h-3 rounded-full bg-gradient-to-r from-primary to-accent opacity-50 blur-sm transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default FormProgress;
