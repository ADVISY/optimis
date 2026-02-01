import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
  isLastStep?: boolean;
  canProceed?: boolean;
}

const FormNavigation = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  isSubmitting = false,
  isLastStep = false,
  canProceed = true,
}: FormNavigationProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4 pt-6 md:pt-10">
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onPrevious}
        disabled={currentStep === 1 || isSubmitting}
        className="gap-2 sm:gap-2.5 w-full sm:w-auto sm:min-w-[120px] md:min-w-[140px] h-12 md:h-14 text-sm md:text-base font-semibold border-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white/60 transition-all duration-200 backdrop-blur-sm"
      >
        <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
        {t("forms.previous")}
      </Button>

      <Button
        type="button"
        size="lg"
        onClick={onNext}
        disabled={!canProceed || isSubmitting}
        className={`
          gap-2 sm:gap-2.5 w-full sm:w-auto sm:min-w-[160px] md:min-w-[200px] h-12 md:h-14 text-sm md:text-base font-bold
          bg-gradient-to-r from-primary via-primary to-emerald-600 
          hover:from-emerald-600 hover:via-primary hover:to-primary
          shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40
          transform hover:scale-[1.02] active:scale-[0.98]
          transition-all duration-300 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
          ${isLastStep ? 'animate-pulse ring-2 ring-primary/50 ring-offset-2' : ''}
        `}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
            <span className="hidden sm:inline">{t("forms.processing")}</span>
            <span className="sm:hidden">...</span>
          </>
        ) : isLastStep ? (
          <>
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 animate-bounce" />
            {t("forms.seeMyOffers", { defaultValue: t("forms.compare") })}
          </>
        ) : (
          <>
            {t("forms.next")}
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </div>
  );
};

export default FormNavigation;
