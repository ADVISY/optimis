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
    <div className="flex justify-between gap-4 pt-8">
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onPrevious}
        disabled={currentStep === 1 || isSubmitting}
        className="gap-2.5 min-w-[140px]"
      >
        <ArrowLeft className="h-5 w-5" />
        {t("forms.previous")}
      </Button>

      <Button
        type="button"
        size="lg"
        onClick={onNext}
        disabled={!canProceed || isSubmitting}
        className={`gap-2.5 min-w-[180px] ${isLastStep ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70' : ''}`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {t("forms.processing")}
          </>
        ) : isLastStep ? (
          <>
            <Sparkles className="h-5 w-5" />
            {t("forms.seeMyOffers", { defaultValue: t("forms.compare") })}
          </>
        ) : (
          <>
            {t("forms.next")}
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </Button>
    </div>
  );
};

export default FormNavigation;
