import { forwardRef, useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  AsYouType,
  parsePhoneNumberFromString,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";

type PhoneInputCHProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> & {
  hasError?: boolean;
  value?: string;
  onChange?: (e: { target: { name?: string; value: string } }) => void;
  name?: string;
};

// Pays prioritaires (Suisse + voisins + diaspora fréquente)
const COUNTRIES: { code: CountryCode; label: string; flag: string }[] = [
  { code: "CH", label: "Suisse", flag: "🇨🇭" },
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "DE", label: "Allemagne", flag: "🇩🇪" },
  { code: "IT", label: "Italie", flag: "🇮🇹" },
  { code: "ES", label: "Espagne", flag: "🇪🇸" },
  { code: "PT", label: "Portugal", flag: "🇵🇹" },
  { code: "AT", label: "Autriche", flag: "🇦🇹" },
  { code: "BE", label: "Belgique", flag: "🇧🇪" },
  { code: "LU", label: "Luxembourg", flag: "🇱🇺" },
  { code: "NL", label: "Pays-Bas", flag: "🇳🇱" },
  { code: "GB", label: "Royaume-Uni", flag: "🇬🇧" },
  { code: "PL", label: "Pologne", flag: "🇵🇱" },
  { code: "TR", label: "Turquie", flag: "🇹🇷" },
  { code: "RS", label: "Serbie", flag: "🇷🇸" },
  { code: "XK", label: "Kosovo", flag: "🇽🇰" },
  { code: "AL", label: "Albanie", flag: "🇦🇱" },
  { code: "MA", label: "Maroc", flag: "🇲🇦" },
  { code: "TN", label: "Tunisie", flag: "🇹🇳" },
  { code: "DZ", label: "Algérie", flag: "🇩🇿" },
  { code: "US", label: "États-Unis", flag: "🇺🇸" },
];

function detectCountry(value: string): CountryCode {
  if (value?.startsWith("+")) {
    const parsed = parsePhoneNumberFromString(value);
    if (parsed?.country) return parsed.country;
  }
  return "CH";
}

export const PhoneInputCH = forwardRef<HTMLInputElement, PhoneInputCHProps>(
  ({ className, hasError, value = "", onChange, name, ...props }, ref) => {
    const [country, setCountry] = useState<CountryCode>(() => detectCountry(value));

    useEffect(() => {
      // Si la valeur externe contient déjà un indicatif, on aligne le pays
      if (value?.startsWith("+")) {
        const parsed = parsePhoneNumberFromString(value);
        if (parsed?.country && parsed.country !== country) setCountry(parsed.country);
      }
    }, [value]);

    const callingCode = useMemo(() => getCountryCallingCode(country), [country]);

    // On affiche le numéro formaté nationalement SANS le 0 de tête (l'indicatif est déjà visible à gauche)
    const displayValue = useMemo(() => {
      if (!value) return "";
      let national = "";
      if (value.startsWith("+")) {
        const parsed = parsePhoneNumberFromString(value);
        national = parsed?.nationalNumber?.toString() ?? value.replace(/\D/g, "");
      } else {
        national = value.replace(/\D/g, "").replace(/^0+/, "");
      }
      // Formate les chiffres nationaux sans réintroduire le 0
      const formatter = new AsYouType(country);
      const formatted = formatter.input(`+${callingCode}${national}`);
      // Retire le préfixe "+XX " du rendu international
      return formatted.replace(new RegExp(`^\\+${callingCode}\\s?`), "");
    }, [value, country, callingCode]);

    const emit = (raw: string, cc: CountryCode) => {
      const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
      const e164 = `+${getCountryCallingCode(cc)}${digits}`;
      onChange?.({ target: { name, value: e164 } });
    };

    return (
      <div className={cn("flex gap-2", className)}>
        <select
          aria-label="Indicatif pays"
          value={country}
          onChange={(e) => {
            const newCountry = e.target.value as CountryCode;
            setCountry(newCountry);
            emit(displayValue, newCountry);
          }}
          className={cn(
            "h-12 md:h-14 rounded-md border border-input bg-background px-2 text-sm font-medium text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500",
            hasError && "border-red-400"
          )}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} +{getCountryCallingCode(c.code)}
            </option>
          ))}
        </select>
        <Input
          ref={ref}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={displayValue}
          onChange={(e) => emit(e.target.value, country)}
          name={name}
          {...props}
          className={cn(
            "h-12 md:h-14 text-base md:text-lg flex-1",
            hasError && "border-red-400"
          )}
        />
      </div>
    );
  }
);

PhoneInputCH.displayName = "PhoneInputCH";
