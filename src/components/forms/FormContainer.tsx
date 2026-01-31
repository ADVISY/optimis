import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import FormProgress from "./FormProgress";

interface FormContainerProps {
  title: string;
  description?: string;
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
}

const FormContainer = ({
  title,
  description,
  currentStep,
  totalSteps,
  children,
}: FormContainerProps) => {
  const { t } = useTranslation();

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-0 bg-white/95 backdrop-blur">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span>{t("forms.free")}</span>
          <span className="text-muted-foreground/50">•</span>
          <Lock className="h-4 w-4 text-primary" />
          <span>{t("forms.secure")}</span>
          <span className="text-muted-foreground/50">•</span>
          <CheckCircle className="h-4 w-4 text-primary" />
          <span>{t("forms.noCommitment")}</span>
        </div>
        
        <FormProgress currentStep={currentStep} totalSteps={totalSteps} />
        
        <div>
          <CardTitle className="text-2xl font-bold text-foreground">{title}</CardTitle>
          {description && (
            <CardDescription className="text-base mt-2">{description}</CardDescription>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
};

export default FormContainer;
