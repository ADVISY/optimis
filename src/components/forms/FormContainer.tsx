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
    <Card className="w-full max-w-3xl mx-auto shadow-2xl border-0 bg-[#1a3d2a] rounded-3xl overflow-hidden min-h-[520px] ring-2 ring-primary/30 animate-fade-in text-white">
      <CardHeader className="space-y-6 pb-8 px-8 pt-10">
        {/* Trust badges with LED glow effect */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-base">
          <div className="flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-full bg-white/15 shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-pulse backdrop-blur-sm">
            <div className="p-1.5 rounded-lg bg-white/20 shadow-[0_0_12px_rgba(255,255,255,0.5)]">
              <Shield className="h-4 w-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>
            <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">{t("forms.free")}</span>
          </div>
          <div className="flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-full bg-white/15 shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-pulse backdrop-blur-sm" style={{ animationDelay: '0.2s' }}>
            <div className="p-1.5 rounded-lg bg-white/20 shadow-[0_0_12px_rgba(255,255,255,0.5)]">
              <Lock className="h-4 w-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>
            <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">{t("forms.secure")}</span>
          </div>
          <div className="flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-full bg-white/15 shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-pulse backdrop-blur-sm" style={{ animationDelay: '0.4s' }}>
            <div className="p-1.5 rounded-lg bg-white/20 shadow-[0_0_12px_rgba(255,255,255,0.5)]">
              <CheckCircle className="h-4 w-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>
            <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">{t("forms.noCommitment")}</span>
          </div>
        </div>
        
        <FormProgress currentStep={currentStep} totalSteps={totalSteps} />
        
        <div className="space-y-3">
          <CardTitle className="text-2xl md:text-3xl font-bold text-white leading-tight">{title}</CardTitle>
          {description && (
            <CardDescription className="text-lg text-white/80 leading-relaxed">{description}</CardDescription>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-8 pb-8 text-white">
        {children}
      </CardContent>
    </Card>
  );
};

export default FormContainer;
