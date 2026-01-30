import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const FormProgress = ({ currentStep, totalSteps, className }: FormProgressProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Étape {currentStep} sur {totalSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default FormProgress;
