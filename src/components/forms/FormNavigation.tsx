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
    <div className="flex justify-between gap-4 pt-10">
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onPrevious}
        disabled={currentStep === 1 || isSubmitting}
        className="gap-2.5 min-w-[140px] h-14 text-base font-semibold border-2 hover:bg-muted/50 transition-all duration-200"
      >
        <ArrowLeft className="h-5 w-5" />
        {t("forms.previous")}
      </Button>

      <Button
        type="button"
        size="lg"
        onClick={onNext}
        disabled={!canProceed || isSubmitting}
        className={`
          gap-2.5 min-w-[200px] h-14 text-base font-bold
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
            <Loader2 className="h-5 w-5 animate-spin" />
            {t("forms.processing")}
          </>
        ) : isLastStep ? (
          <>
            <Sparkles className="h-5 w-5 animate-bounce" />
            {t("forms.seeMyOffers", { defaultValue: t("forms.compare") })}
          </>
        ) : (
          <>
            {t("forms.next")}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </div>
  );
};

export default FormNavigation;
