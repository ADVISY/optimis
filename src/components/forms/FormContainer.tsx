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
  size?: "default" | "large";
}

const FormContainer = ({
  title,
  description,
  currentStep,
  totalSteps,
  children,
  size = "default",
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

  const isLarge = size === "large";

  return (
    <Card 
      ref={cardRef}
      data-form-container
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`w-full mx-auto shadow-2xl border-2 md:border-4 border-emerald-800 rounded-xl md:rounded-3xl overflow-hidden ring-2 ring-emerald-400/30 animate-fade-in text-white relative ${
        isLarge ? "max-w-4xl" : "max-w-3xl"
      }`}
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
      
      <CardHeader className={`space-y-1.5 md:space-y-4 pb-2 md:pb-6 relative z-10 ${
        isLarge ? "px-4 md:px-10 pt-4 md:pt-10" : "px-3 md:px-8 pt-3 md:pt-8"
      }`}>
        {/* Trust badges - ultra compact on mobile */}
        <div className={`flex flex-wrap items-center justify-center gap-1 md:gap-4 ${
          isLarge ? "text-[10px] md:text-base" : "text-[9px] md:text-base"
        }`}>
          <div className={`flex items-center text-white font-semibold rounded-full bg-white/15 shadow-[0_0_20px_rgba(255,255,255,0.25)] backdrop-blur-sm border border-white/20 ${
            isLarge ? "gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2" : "gap-0.5 md:gap-2 px-1.5 md:px-4 py-0.5 md:py-2"
          }`}>
            <Shield className={isLarge ? "h-2.5 w-2.5 md:h-4 md:w-4 text-white" : "h-2 w-2 md:h-4 md:w-4 text-white"} />
            <span>{t("forms.free")}</span>
          </div>
          <div className={`flex items-center text-white font-semibold rounded-full bg-white/15 shadow-[0_0_20px_rgba(255,255,255,0.25)] backdrop-blur-sm border border-white/20 ${
            isLarge ? "gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2" : "gap-0.5 md:gap-2 px-1.5 md:px-4 py-0.5 md:py-2"
          }`}>
            <Lock className={isLarge ? "h-2.5 w-2.5 md:h-4 md:w-4 text-white" : "h-2 w-2 md:h-4 md:w-4 text-white"} />
            <span>{t("forms.secure")}</span>
          </div>
          <div className={`flex items-center text-white font-semibold rounded-full bg-white/15 shadow-[0_0_20px_rgba(255,255,255,0.25)] backdrop-blur-sm border border-white/20 ${
            isLarge ? "gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2" : "gap-0.5 md:gap-2 px-1.5 md:px-4 py-0.5 md:py-2"
          }`}>
            <CheckCircle className={isLarge ? "h-2.5 w-2.5 md:h-4 md:w-4 text-white" : "h-2 w-2 md:h-4 md:w-4 text-white"} />
            <span>{t("forms.noCommitment")}</span>
          </div>
        </div>
        
        <FormProgress currentStep={currentStep} totalSteps={totalSteps} className={
          isLarge 
            ? "[&_*]:text-[11px] md:[&_*]:text-base [&_.h-3]:h-2 md:[&_.h-3]:h-3" 
            : "[&_*]:text-[10px] md:[&_*]:text-base [&_.h-3]:h-1.5 md:[&_.h-3]:h-3"
        } />
        
        <div className="space-y-0.5 md:space-y-3">
          <CardTitle className={`font-bold text-white leading-tight ${
            isLarge ? "text-base md:text-2xl lg:text-3xl" : "text-sm md:text-2xl lg:text-3xl"
          }`}>{title}</CardTitle>
          {description && (
            <CardDescription className={`text-white/80 leading-relaxed ${
              isLarge ? "text-xs md:text-lg line-clamp-2 md:line-clamp-none" : "text-[10px] md:text-lg line-clamp-1 md:line-clamp-none"
            }`}>{description}</CardDescription>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={`pt-0 text-white relative z-10 ${
        isLarge ? "px-3 md:px-10 pb-3 md:pb-10" : "px-2.5 md:px-8 pb-2.5 md:pb-8"
      }`}>
        {children}
      </CardContent>
    </Card>
  );
};

export default FormContainer;
