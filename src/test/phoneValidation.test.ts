import { describe, expect, it } from "vitest";
import { formatPhoneInput, getPhoneValidationResult } from "@/lib/phoneValidation";

describe("phone validation", () => {
  it("accepts a valid Swiss international mobile number", () => {
    const result = getPhoneValidationResult("+41 78 123 45 67");

    expect(result.isValid).toBe(true);
    expect(result.e164).toBe("+41781234567");
  });

  it("accepts a valid Swiss local mobile number", () => {
    const result = getPhoneValidationResult("078 123 45 67");

    expect(result.isValid).toBe(true);
    expect(result.e164).toBe("+41781234567");
  });

  it("rejects an incomplete Swiss number when the country code is typed without plus", () => {
    const result = getPhoneValidationResult("417821223");

    expect(result.isValid).toBe(false);
    expect(result.reason).toBe("too_short");
    expect(result.missingDigits).toBe(2);
  });

  it("rejects an incomplete Swiss number when the country code is typed with plus", () => {
    const result = getPhoneValidationResult("+417821223");

    expect(result.isValid).toBe(false);
    expect(result.reason).toBe("too_short");
    expect(result.missingDigits).toBe(2);
  });

  it("formats a raw Swiss international mobile number consistently", () => {
    expect(formatPhoneInput("41781234567")).toBe("+41 78 123 45 67");
  });

  it("rejects Swiss fixed-line prefixes even at the correct length", () => {
    const result = getPhoneValidationResult("+41 71 123 45 67");

    expect(result.isValid).toBe(false);
    expect(result.reason).toBe("invalid_mobile_prefix");
  });
});