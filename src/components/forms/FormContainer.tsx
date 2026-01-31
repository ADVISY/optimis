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
    <Card className="w-full max-w-2xl mx-auto shadow-premium border-0 bg-background/98 backdrop-blur-md rounded-3xl overflow-hidden">
      <CardHeader className="space-y-6 pb-6 px-8 pt-8">
        {/* Trust badges */}
        <div className="flex flex-wrap items-center gap-4 text-base">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">{t("forms.free")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Lock className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">{t("forms.secure")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">{t("forms.noCommitment")}</span>
          </div>
        </div>
        
        <FormProgress currentStep={currentStep} totalSteps={totalSteps} />
        
        <div className="space-y-3">
          <CardTitle className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{title}</CardTitle>
          {description && (
            <CardDescription className="text-lg text-muted-foreground leading-relaxed">{description}</CardDescription>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-8 pb-8">
        {children}
      </CardContent>
    </Card>
  );
};

export default FormContainer;
