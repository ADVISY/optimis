import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PhoneInputCHProps = React.InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

/**
 * Swiss phone input with a fixed visual "+41" prefix.
 * The value/onChange behavior is unchanged — the prefix is purely visual.
 * Server normalization in send-otp converts "079..." → "+41 79...".
 */
export const PhoneInputCH = forwardRef<HTMLInputElement, PhoneInputCHProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-base md:text-lg font-semibold text-emerald-700"
        >
          +41
        </span>
        <Input
          ref={ref}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          {...props}
          className={cn(
            "pl-14 h-12 md:h-14 text-base md:text-lg",
            hasError && "border-red-400",
            className
          )}
        />
      </div>
    );
  }
);

PhoneInputCH.displayName = "PhoneInputCH";
