import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldWrapperProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: ReactNode;
  className?: string;
}

const FormFieldWrapper = ({
  label,
  htmlFor,
  required = false,
  error,
  helpText,
  children,
  className,
}: FormFieldWrapperProps) => {
  return (
    <div className={cn("space-y-1 md:space-y-2", className)}>
      <Label htmlFor={htmlFor} className="text-xs md:text-sm font-medium text-white">
        {label}
        {required && <span className="text-red-300 ml-1">*</span>}
      </Label>
      
      {children}
      
      {helpText && !error && (
        <p className="text-xs md:text-sm text-white/70">{helpText}</p>
      )}
      
      {error && (
        <p className="text-xs md:text-sm text-red-300">{error}</p>
      )}
    </div>
  );
};

export default FormFieldWrapper;
