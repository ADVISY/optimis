import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DateInputProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
}

/**
 * A keyboard-friendly date input that auto-formats to DD/MM/YYYY
 * Much easier than clicking through a calendar for birth dates!
 */
const DateInput = ({
  value,
  onChange,
  placeholder = "JJ/MM/AAAA",
  className,
  minYear = 1900,
  maxYear,
  disabled = false,
}: DateInputProps) => {
  const effectiveMaxYear = maxYear ?? new Date().getFullYear();
  
  // Format date to DD/MM/YYYY string
  const formatDateToString = (date: Date | null): string => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  };

  const [inputValue, setInputValue] = useState(formatDateToString(value));
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with external value changes
  useEffect(() => {
    const formatted = formatDateToString(value);
    if (formatted !== inputValue && !inputRef.current?.matches(":focus")) {
      setInputValue(formatted);
    }
  }, [value]);

  // Parse DD/MM/YYYY string to Date
  const parseStringToDate = (str: string): Date | null => {
    const cleaned = str.replace(/[^0-9]/g, "");
    if (cleaned.length !== 8) return null;

    const day = parseInt(cleaned.substring(0, 2), 10);
    const month = parseInt(cleaned.substring(2, 4), 10);
    const year = parseInt(cleaned.substring(4, 8), 10);

    // Validate ranges
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    if (year < minYear || year > effectiveMaxYear) return null;

    // Check for valid day in month
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  };

  // Auto-format input as user types
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove all non-digits
    const digits = value.replace(/[^0-9]/g, "");
    
    // Auto-add slashes
    let formatted = "";
    for (let i = 0; i < digits.length && i < 8; i++) {
      if (i === 2 || i === 4) {
        formatted += "/";
      }
      formatted += digits[i];
    }
    
    setInputValue(formatted);
    setError(null);

    // Try to parse when we have a complete date
    if (digits.length === 8) {
      const parsed = parseStringToDate(formatted);
      if (parsed) {
        onChange(parsed);
        setError(null);
      } else {
        setError("Date invalide");
        onChange(null);
      }
    } else if (digits.length === 0) {
      onChange(null);
      setError(null);
    }
  };

  // Validate on blur
  const handleBlur = () => {
    if (inputValue && inputValue.length > 0) {
      const parsed = parseStringToDate(inputValue);
      if (!parsed) {
        setError("Format: JJ/MM/AAAA");
      } else {
        setError(null);
        onChange(parsed);
      }
    } else {
      setError(null);
      onChange(null);
    }
  };

  return (
    <div className="space-y-1">
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        maxLength={10}
      />
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};

export default DateInput;
