import { ReactNode, useState, useRef, useCallback } from "react";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [gradientPos, setGradientPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGradientPos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setGradientPos({ x: 50, y: 50 });
  }, []);

  return (
    <Card 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full max-w-3xl mx-auto shadow-2xl border-2 md:border-4 border-emerald-800 rounded-2xl md:rounded-3xl overflow-hidden min-h-[420px] md:min-h-[520px] ring-2 ring-emerald-400/30 animate-fade-in text-white relative"
      style={{
        background: `radial-gradient(circle at ${gradientPos.x}% ${gradientPos.y}%, rgba(72, 140, 100, 0.95) 0%, rgba(52, 115, 80, 0.95) 40%, rgba(45, 100, 70, 1) 100%)`,
        transition: 'background 0.15s ease-out'
      }}
    >
      {/* Subtle animated glow overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: `radial-gradient(circle at ${gradientPos.x}% ${gradientPos.y}%, rgba(130, 200, 160, 0.5) 0%, transparent 45%)`,
          transition: 'background 0.15s ease-out'
        }}
      />
      
      <CardHeader className="space-y-4 md:space-y-6 pb-4 md:pb-8 px-4 md:px-8 pt-6 md:pt-10 relative z-10">
        {/* Trust badges with LED glow effect - responsive */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-xs md:text-base">
          <div className="flex items-center gap-1.5 md:gap-2 text-white font-semibold px-2.5 md:px-4 py-1.5 md:py-2 rounded-full bg-white/15 shadow-[0_0_20px_rgba(255,255,255,0.25)] animate-pulse backdrop-blur-sm border border-white/20">
            <div className="p-1 md:p-1.5 rounded-lg bg-white/20 shadow-[0_0_12px_rgba(255,255,255,0.4)]">
              <Shield className="h-3 w-3 md:h-4 md:w-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
            </div>
            <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{t("forms.free")}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 text-white font-semibold px-2.5 md:px-4 py-1.5 md:py-2 rounded-full bg-white/15 shadow-[0_0_20px_rgba(255,255,255,0.25)] animate-pulse backdrop-blur-sm border border-white/20" style={{ animationDelay: '0.2s' }}>
            <div className="p-1 md:p-1.5 rounded-lg bg-white/20 shadow-[0_0_12px_rgba(255,255,255,0.4)]">
              <Lock className="h-3 w-3 md:h-4 md:w-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
            </div>
            <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{t("forms.secure")}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 text-white font-semibold px-2.5 md:px-4 py-1.5 md:py-2 rounded-full bg-white/15 shadow-[0_0_20px_rgba(255,255,255,0.25)] animate-pulse backdrop-blur-sm border border-white/20" style={{ animationDelay: '0.4s' }}>
            <div className="p-1 md:p-1.5 rounded-lg bg-white/20 shadow-[0_0_12px_rgba(255,255,255,0.4)]">
              <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
            </div>
            <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{t("forms.noCommitment")}</span>
          </div>
        </div>
        
        <FormProgress currentStep={currentStep} totalSteps={totalSteps} />
        
        <div className="space-y-2 md:space-y-3">
          <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm md:text-lg text-white/80 leading-relaxed">{description}</CardDescription>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-4 md:px-8 pb-4 md:pb-8 text-white relative z-10">
        {children}
      </CardContent>
    </Card>
  );
};

export default FormContainer;
