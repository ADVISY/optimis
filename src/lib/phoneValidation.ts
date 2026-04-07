export type PhoneValidationReason =
  | "empty"
  | "invalid_prefix"
  | "too_short"
  | "too_long"
  | "invalid_mobile_prefix";

export interface PhoneValidationResult {
  digits: string;
  isValid: boolean;
  reason: PhoneValidationReason | null;
  expectedDigits: number | null;
  missingDigits: number;
  formatted: string;
  e164: string | null;
  kind: "ch-international" | "fr-international" | "ch-local" | "fr-local" | null;
}

const SWISS_MOBILE_PREFIXES = new Set(["75", "76", "77", "78", "79"]);

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const groupDigits = (digits: string, groups: number[]) => {
  const parts: string[] = [];
  let cursor = 0;

  for (const groupSize of groups) {
    if (cursor >= digits.length) break;
    parts.push(digits.slice(cursor, cursor + groupSize));
    cursor += groupSize;
  }

  if (cursor < digits.length) {
    parts.push(digits.slice(cursor));
  }

  return parts.join(" ").trim();
};

const formatSwissInternational = (nationalDigits: string) => {
  const grouped = groupDigits(nationalDigits.slice(0, 9), [2, 3, 2, 2]);
  return grouped ? `+41 ${grouped}` : "+41";
};

const formatFrenchInternational = (nationalDigits: string) => {
  const grouped = groupDigits(nationalDigits.slice(0, 9), [1, 2, 2, 2, 2]);
  return grouped ? `+33 ${grouped}` : "+33";
};

const formatSwissLocal = (digits: string) => groupDigits(digits.slice(0, 10), [3, 3, 2, 2]);
const formatFrenchLocal = (digits: string) => groupDigits(digits.slice(0, 10), [2, 2, 2, 2, 2]);

const isSwissMobileNationalNumber = (nationalDigits: string) =>
  nationalDigits.length >= 2 && SWISS_MOBILE_PREFIXES.has(nationalDigits.slice(0, 2));

const isFrenchMobileNationalNumber = (nationalDigits: string) =>
  nationalDigits.startsWith("6") || nationalDigits.startsWith("7");

const detectLocalKind = (digits: string): PhoneValidationResult["kind"] => {
  const nationalDigits = digits.slice(1);

  if (nationalDigits.startsWith("6")) return "fr-local";
  if (isSwissMobileNationalNumber(nationalDigits)) return "ch-local";
  if (nationalDigits.startsWith("7")) return "fr-local";

  return null;
};

export function formatPhoneInput(value: string): string {
  const digits = onlyDigits(value);

  if (!digits) return "";

  if (digits.startsWith("41")) {
    return formatSwissInternational(digits.slice(2));
  }

  if (digits.startsWith("33")) {
    return formatFrenchInternational(digits.slice(2));
  }

  if (digits.startsWith("0")) {
    const nationalDigits = digits.slice(1);

    if (nationalDigits.startsWith("6")) {
      return formatFrenchLocal(digits);
    }

    if (isSwissMobileNationalNumber(nationalDigits)) {
      return formatSwissLocal(digits);
    }

    if (nationalDigits.startsWith("7")) {
      return formatFrenchLocal(digits);
    }

    return formatSwissLocal(digits);
  }

  return digits;
}

export function getPhoneValidationResult(phone: string): PhoneValidationResult {
  const digits = onlyDigits(phone);
  const formatted = formatPhoneInput(phone);

  if (!digits) {
    return {
      digits,
      isValid: false,
      reason: "empty",
      expectedDigits: null,
      missingDigits: 0,
      formatted,
      e164: null,
      kind: null,
    };
  }

  if (digits.startsWith("41")) {
    const nationalDigits = digits.slice(2);
    const expectedDigits = 11;

    if (digits.length < expectedDigits) {
      return {
        digits,
        isValid: false,
        reason: "too_short",
        expectedDigits,
        missingDigits: expectedDigits - digits.length,
        formatted,
        e164: null,
        kind: "ch-international",
      };
    }

    if (digits.length > expectedDigits) {
      return {
        digits,
        isValid: false,
        reason: "too_long",
        expectedDigits,
        missingDigits: 0,
        formatted,
        e164: null,
        kind: "ch-international",
      };
    }

    if (!isSwissMobileNationalNumber(nationalDigits)) {
      return {
        digits,
        isValid: false,
        reason: "invalid_mobile_prefix",
        expectedDigits,
        missingDigits: 0,
        formatted,
        e164: null,
        kind: "ch-international",
      };
    }

    return {
      digits,
      isValid: true,
      reason: null,
      expectedDigits,
      missingDigits: 0,
      formatted,
      e164: `+${digits}`,
      kind: "ch-international",
    };
  }

  if (digits.startsWith("33")) {
    const nationalDigits = digits.slice(2);
    const expectedDigits = 11;

    if (digits.length < expectedDigits) {
      return {
        digits,
        isValid: false,
        reason: "too_short",
        expectedDigits,
        missingDigits: expectedDigits - digits.length,
        formatted,
        e164: null,
        kind: "fr-international",
      };
    }

    if (digits.length > expectedDigits) {
      return {
        digits,
        isValid: false,
        reason: "too_long",
        expectedDigits,
        missingDigits: 0,
        formatted,
        e164: null,
        kind: "fr-international",
      };
    }

    if (!isFrenchMobileNationalNumber(nationalDigits)) {
      return {
        digits,
        isValid: false,
        reason: "invalid_mobile_prefix",
        expectedDigits,
        missingDigits: 0,
        formatted,
        e164: null,
        kind: "fr-international",
      };
    }

    return {
      digits,
      isValid: true,
      reason: null,
      expectedDigits,
      missingDigits: 0,
      formatted,
      e164: `+${digits}`,
      kind: "fr-international",
    };
  }

  if (digits.startsWith("0")) {
    const nationalDigits = digits.slice(1);
    const expectedDigits = 10;
    const kind = detectLocalKind(digits);

    if (digits.length < expectedDigits) {
      return {
        digits,
        isValid: false,
        reason: "too_short",
        expectedDigits,
        missingDigits: expectedDigits - digits.length,
        formatted,
        e164: null,
        kind,
      };
    }

    if (digits.length > expectedDigits) {
      return {
        digits,
        isValid: false,
        reason: "too_long",
        expectedDigits,
        missingDigits: 0,
        formatted,
        e164: null,
        kind,
      };
    }

    if (!kind) {
      return {
        digits,
        isValid: false,
        reason: "invalid_mobile_prefix",
        expectedDigits,
        missingDigits: 0,
        formatted,
        e164: null,
        kind: null,
      };
    }

    return {
      digits,
      isValid: true,
      reason: null,
      expectedDigits,
      missingDigits: 0,
      formatted,
      e164: kind === "ch-local" ? `+41${nationalDigits}` : `+33${nationalDigits}`,
      kind,
    };
  }

  return {
    digits,
    isValid: false,
    reason: "invalid_prefix",
    expectedDigits: null,
    missingDigits: 0,
    formatted,
    e164: null,
    kind: null,
  };
}