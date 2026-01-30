import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
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
    <div className="flex justify-between gap-4 pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1 || isSubmitting}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("forms.previous")}
      </Button>

      <Button
        type="button"
        onClick={onNext}
        disabled={!canProceed || isSubmitting}
        className="gap-2 bg-primary hover:bg-primary/90"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("forms.processing")}
          </>
        ) : isLastStep ? (
          <>
            {t("forms.compare")}
            <ArrowRight className="h-4 w-4" />
          </>
        ) : (
          <>
            {t("forms.next")}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};

export default FormNavigation;
