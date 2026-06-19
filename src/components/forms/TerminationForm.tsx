import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import FormContainer from "@/components/forms/FormContainer";
import FormStep from "@/components/forms/FormStep";
import FormNavigation from "@/components/forms/FormNavigation";
import FormFieldWrapper from "@/components/forms/FormField";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { useLeadSubmission } from "@/hooks/useLeadSubmission";
import { fireLeadConversion, getLastLeadId } from "@/lib/leadTracking";
import { Input } from "@/components/ui/input";
import { PhoneInputCH } from "@/components/forms/PhoneInputCH";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Download, CheckCircle, FileText, Lock, User, Phone } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { fr, de, it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";
import { useOtpFormFlow } from "@/hooks/useOtpFormFlow";
import SmsVerificationModal from "@/components/forms/SmsVerificationModal";

interface TerminationFormData {
  contractType: string;
  currentInsurer: string;
  terminationDate: Date | null;
  cancellationReasons: string[];
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
}

const TOTAL_STEPS = 5;

const TerminationForm = () => {
  const { t, i18n } = useTranslation();
  const [showResults, setShowResults] = useState(false);
  const { attemptedNext, markAttempted, resetAttempted, formatSwissPhone, isValidEmail, isValidPhone, getContactErrors, getIdentityErrors, showValidationToast } = useFormValidation();

  const getDateLocale = () => {
    switch (i18n.language) {
      case "de": return de;
      case "it": return it;
      default: return fr;
    }
  };

  const initialData: TerminationFormData = {
    contractType: "",
    currentInsurer: "",
    terminationDate: null,
    cancellationReasons: [],
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
  };

  const { submitLead, isSubmitting } = useLeadSubmission({
    formType: "termination",
  });

  const {
    currentStep,
    formData,
    isLastStep,
    updateFormData,
    nextStep,
    previousStep,
  } = useMultiStepForm({
    initialData,
    totalSteps: TOTAL_STEPS,
    onSubmit: async (data) => {
      await submitLead(data as unknown as Record<string, unknown>);
    },
  });

  const performSubmit = useCallback(async () => {
    await submitLead(formData as unknown as Record<string, unknown>);
    setShowResults(true);
    fireLeadConversion({
      pageKey: "merci-resiliation",
      leadId: getLastLeadId(),
      googleAdsSendTo: "AW-16586911321/1MwiCK30gpAcENncoOU9",
    });
  }, [formData, submitLead]);

  const { startOtpFlow, otpModalProps } = useOtpFormFlow({
    onOtpVerified: performSubmit,
    getPhone: () => formData.phone,
  });

  const handleSubmit = async () => {
    await startOtpFlow();
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: return formData.contractType !== "";
      case 2: return formData.currentInsurer.trim() !== "";
      case 3: return formData.cancellationReasons.length > 0 && formData.firstName.trim() !== "" && formData.lastName.trim() !== "" && formData.address.trim() !== "" && formData.postalCode.replace(/\D/g, '').length >= 4 && formData.city.trim() !== "";
      case 4: return isValidEmail(formData.email) && isValidPhone(formData.phone);
      default: return true;
    }
  };

  const getStepErrors = (step: number): Record<string, string> => {
    if (step === 3) return getIdentityErrors(formData.firstName, formData.lastName);
    if (step === 4) return getContactErrors(formData.email, formData.phone);
    return {};
  };

  const toggleReason = (reason: string) => {
    const current = formData.cancellationReasons;
    if (current.includes(reason)) {
      updateFormData({ cancellationReasons: current.filter((r) => r !== reason) });
    } else {
      updateFormData({ cancellationReasons: [...current, reason] });
    }
  };

  const canProceed = validateStep(currentStep);
  const { notify, notifyDelayed, notifyDelayedLong } = useAutoAdvance(currentStep, nextStep, canProceed, isLastStep, handleSubmit);
  const stepErrors = attemptedNext ? getStepErrors(currentStep) : {};

  const handleNext = () => {
    markAttempted();
    if (!canProceed) {
      showValidationToast();
      return;
    }
    resetAttempted();
    if (isLastStep) {
      handleSubmit();
    } else {
      nextStep();
    }
  };

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className="inline-flex p-4 rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold">
              {t("forms.termination.success")}
            </h2>

            <p className="text-muted-foreground">
              {t("forms.termination.successDescription")}
            </p>

            <div className="bg-muted/50 p-4 rounded-lg text-left">
              <h3 className="font-medium mb-2">{t("forms.termination.letterPreview")}</h3>
              <div className="text-sm space-y-2 font-mono bg-white p-4 rounded border">
                <p>{formData.firstName} {formData.lastName}</p>
                <p>{formData.address}</p>
                <p>{formData.postalCode} {formData.city}</p>
                <p className="mt-4">{formData.currentInsurer}</p>
                <p className="mt-4">{t("forms.termination.letterSubject")}</p>
                <p className="mt-2">{t("forms.termination.letterBody")}</p>
                {formData.terminationDate && (
                  <p>{t("forms.termination.effectiveDate")}: {format(formData.terminationDate, "PPP", { locale: getDateLocale() })}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                {t("forms.termination.downloadPDF")}
              </Button>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                {t("forms.termination.compareNew")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <FormContainer
      title={t("forms.termination.title")}
      description={t("forms.termination.description")}
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
    >
      {/* Step 1: Contract Type */}
      <FormStep isActive={currentStep === 1}>
        <div className="space-y-4">
          <FormFieldWrapper label={t("forms.termination.contractType")} required>
            <RadioGroup
              value={formData.contractType}
              onValueChange={(value) => { updateFormData({ contractType: value }); notify(); }}
              className="grid gap-3"
            >
              {[
                { value: "health", label: t("forms.termination.types.health") },
                { value: "life", label: t("forms.termination.types.life") },
                { value: "other", label: t("forms.termination.types.other") },
              ].map((type) => (
                <div key={type.value} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <Label htmlFor={type.value} className="cursor-pointer flex-1 text-lg">
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 2: Insurer details */}
      <FormStep isActive={currentStep === 2}>
        <div className="space-y-4">
          <FormFieldWrapper label={t("forms.termination.currentInsurer")} htmlFor="currentInsurer" required>
            <Input
              id="currentInsurer"
              value={formData.currentInsurer}
              onChange={(e) => { updateFormData({ currentInsurer: e.target.value }); notifyDelayed(); }}
              placeholder="CSS, Helsana, La Mobilière..."
              className="h-14 text-lg"
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.termination.terminationDate")}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-14 justify-start text-left font-normal text-lg",
                    !formData.terminationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.terminationDate
                    ? format(formData.terminationDate, "PPP", { locale: getDateLocale() })
                    : t("forms.termination.selectDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.terminationDate || undefined}
                  onSelect={(date) => updateFormData({ terminationDate: date || null })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 3: Cancellation Reason, Identity & Address */}
      <FormStep isActive={currentStep === 3}>
        <div className="space-y-6">
          <FormFieldWrapper label={t("forms.termination.cancellationReason")} required>
            <div className="grid gap-3">
              {[
                { value: "tooExpensive", label: t("forms.termination.reasons.tooExpensive") },
                { value: "poorService", label: t("forms.termination.reasons.poorService") },
                { value: "poorReimbursement", label: t("forms.termination.reasons.poorReimbursement") },
              ].map((reason) => (
                <div
                  key={reason.value}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleReason(reason.value)}
                >
                  <Checkbox
                    id={`reason-${reason.value}`}
                    checked={formData.cancellationReasons.includes(reason.value)}
                    onCheckedChange={() => toggleReason(reason.value)}
                    className="h-5 w-5"
                  />
                  <Label htmlFor={`reason-${reason.value}`} className="cursor-pointer flex-1 text-base sm:text-lg">
                    {reason.label}
                  </Label>
                </div>
              ))}
            </div>
          </FormFieldWrapper>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{t("forms.contact.almostDone")}</h3>
            <p className="text-muted-foreground">{t("forms.contact.nameStepDescription")}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormFieldWrapper label={t("forms.contact.firstName")} htmlFor="firstName" required>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => { updateFormData({ firstName: e.target.value }); notifyDelayedLong(); }}
                className="h-14 text-lg"
              />
            </FormFieldWrapper>
            <FormFieldWrapper label={t("forms.contact.lastName")} htmlFor="lastName" required>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => { updateFormData({ lastName: e.target.value }); notifyDelayedLong(); }}
                className="h-14 text-lg"
              />
            </FormFieldWrapper>
          </div>

          <FormFieldWrapper label={t("forms.termination.address")} htmlFor="address" required>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => { updateFormData({ address: e.target.value }); notifyDelayed(); }}
              placeholder="Rue de Lausanne 10"
              className="h-14 text-lg"
            />
          </FormFieldWrapper>

          <div className="grid grid-cols-3 gap-4">
            <FormFieldWrapper label={t("forms.healthInsurance.postalCode")} htmlFor="postalCode" required>
              <Input
                id="postalCode"
                value={formData.postalCode}
              onChange={(e) => { updateFormData({ postalCode: e.target.value }); notifyDelayed(); }}
              placeholder="1000"
              maxLength={4}
              className="h-14 text-lg"
              />
            </FormFieldWrapper>
            <div className="col-span-2">
              <FormFieldWrapper label={t("forms.termination.city")} htmlFor="city" required>
                <Input
                  id="city"
                  value={formData.city}
              onChange={(e) => { updateFormData({ city: e.target.value }); notifyDelayed(); }}
              placeholder="Lausanne"
              className="h-14 text-lg"
                />
              </FormFieldWrapper>
            </div>
          </div>
        </div>
      </FormStep>

      {/* Step 4: Contact */}
      <FormStep isActive={currentStep === 4}>
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{t("forms.contact.contactStepTitle")}</h3>
            <p className="text-muted-foreground">{t("forms.contact.contactStepDescription")}</p>
          </div>

          <FormFieldWrapper label={t("forms.contact.email")} htmlFor="email" required error={stepErrors.email}>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => { updateFormData({ email: e.target.value }); notifyDelayed(); }}
              className={cn("h-14 text-lg", stepErrors.email && "border-red-400")}
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.contact.phone")} htmlFor="phone" required error={stepErrors.phone}>
            <PhoneInputCH
              id="phone"
              value={formData.phone}
              onChange={(e) => { updateFormData({ phone: formatSwissPhone(e.target.value) }); notifyDelayed(); }}
              placeholder="79 123 45 67" hasError={!!stepErrors.phone}
            />
          </FormFieldWrapper>

          <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
            <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{t("forms.contact.privacyNote")}</p>
          </div>
        </div>
      </FormStep>

      {/* Step 5: Confirmation */}
      <FormStep isActive={currentStep === 5}>
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {t("forms.termination.generateNote")}
            </p>
          </div>
        </div>
      </FormStep>

      <FormNavigation
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onPrevious={previousStep}
        onNext={handleNext}
        isSubmitting={isSubmitting}
        isLastStep={isLastStep}
        canProceed={canProceed}
      />
      <SmsVerificationModal {...otpModalProps} />
    </FormContainer>
  );
};

export default TerminationForm;
