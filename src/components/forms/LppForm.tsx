import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import FormContainer from "@/components/forms/FormContainer";
import FormStep from "@/components/forms/FormStep";
import FormNavigation from "@/components/forms/FormNavigation";
import FormFieldWrapper from "@/components/forms/FormField";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { useLeadSubmission } from "@/hooks/useLeadSubmission";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";
import { useOtpFormFlow } from "@/hooks/useOtpFormFlow";
import SmsVerificationModal from "@/components/forms/SmsVerificationModal";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Lock, User, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface LppFormData {
  objective: string;
  situation: string;
  yearsWorked: string;
  birthDate: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const TOTAL_STEPS = 6;

const LppForm = () => {
  const { t } = useTranslation();
  const [showThankYou, setShowThankYou] = useState(false);
  const { attemptedNext, markAttempted, resetAttempted, formatSwissPhone, isValidEmail, isValidPhone, getContactErrors, getIdentityErrors, showValidationToast } = useFormValidation();

  const initialData: LppFormData = {
    objective: "",
    situation: "",
    yearsWorked: "",
    birthDate: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  };

  const { submitLead, isSubmitting } = useLeadSubmission({
    formType: "lpp-libre-passage",
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
    setShowThankYou(true);
  }, [formData, submitLead]);

  const handleSubmit = async () => {
    sessionStorage.setItem("phone_verified", "true");
    await performSubmit();
  };

  const isValidDate = (d: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(d);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: return formData.objective !== "";
      case 2: return formData.situation !== "";
      case 3: return formData.yearsWorked !== "";
      case 4: return isValidDate(formData.birthDate);
      case 5: return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
      case 6: return isValidEmail(formData.email) && isValidPhone(formData.phone);
      default: return true;
    }
  };

  const getStepErrors = (step: number): Record<string, string> => {
    if (step === 5) return getIdentityErrors(formData.firstName, formData.lastName);
    if (step === 6) return getContactErrors(formData.email, formData.phone);
    return {};
  };

  const canProceed = validateStep(currentStep);
  const { notify, notifyDelayed } = useAutoAdvance(currentStep, nextStep, canProceed, isLastStep, handleSubmit);
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

  if (showThankYou) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <span className="text-3xl">🎉</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("forms.lpp.thankYouTitle")}</h2>
        <p className="text-lg text-muted-foreground">{t("forms.lpp.thankYouDescription")}</p>
      </div>
    );
  }

  const objectiveOptions = [
    { value: "find", label: t("forms.lpp.objectives.find") },
    { value: "consolidate", label: t("forms.lpp.objectives.consolidate") },
  ];

  const situationOptions = [
    { value: "employed", label: t("forms.lpp.situations.employed") },
    { value: "self-employed", label: t("forms.lpp.situations.selfEmployed") },
    { value: "unemployed", label: t("forms.lpp.situations.unemployed") },
    { value: "other", label: t("forms.lpp.situations.other") },
  ];

  const yearsOptions = [
    { value: "less-10", label: t("forms.lpp.years.less10") },
    { value: "10-plus", label: t("forms.lpp.years.plus10") },
    { value: "20-plus", label: t("forms.lpp.years.plus20") },
    { value: "30-plus", label: t("forms.lpp.years.plus30") },
  ];

  return (
    <FormContainer
      title={t("forms.lpp.title")}
      description={t("forms.lpp.description")}
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
    >
      {/* Step 1: Objective */}
      <FormStep isActive={currentStep === 1}>
        <div className="space-y-2 md:space-y-3">
          <p className="text-xs md:text-base font-medium text-foreground mb-2 md:mb-4">{t("forms.lpp.objectiveQuestion")}</p>
          <RadioGroup
            value={formData.objective}
            onValueChange={(value) => { updateFormData({ objective: value }); notify(); }}
            className="space-y-2 md:space-y-3"
          >
            {objectiveOptions.map((option) => (
              <label
                key={option.value}
                htmlFor={`objective-${option.value}`}
                className={cn(
                  "flex items-center space-x-3 p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all",
                  formData.objective === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value={option.value} id={`objective-${option.value}`} />
                <Label htmlFor={`objective-${option.value}`} className="text-sm md:text-lg cursor-pointer flex-1">{option.label}</Label>
              </label>
            ))}
          </RadioGroup>
        </div>
      </FormStep>

      {/* Step 2: Situation */}
      <FormStep isActive={currentStep === 2}>
        <div className="space-y-2 md:space-y-3">
          <p className="text-xs md:text-base font-medium text-foreground mb-2 md:mb-4">{t("forms.lpp.situationQuestion")}</p>
          <RadioGroup
            value={formData.situation}
            onValueChange={(value) => { updateFormData({ situation: value }); notify(); }}
            className="space-y-2 md:space-y-3"
          >
            {situationOptions.map((option) => (
              <label
                key={option.value}
                htmlFor={`situation-${option.value}`}
                className={cn(
                  "flex items-center space-x-3 p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all",
                  formData.situation === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value={option.value} id={`situation-${option.value}`} />
                <Label htmlFor={`situation-${option.value}`} className="text-sm md:text-lg cursor-pointer flex-1">{option.label}</Label>
              </label>
            ))}
          </RadioGroup>
        </div>
      </FormStep>

      {/* Step 3: Years worked */}
      <FormStep isActive={currentStep === 3}>
        <div className="space-y-2 md:space-y-3">
          <p className="text-xs md:text-base font-medium text-foreground mb-2 md:mb-4">{t("forms.lpp.yearsQuestion")}</p>
          <RadioGroup
            value={formData.yearsWorked}
            onValueChange={(value) => { updateFormData({ yearsWorked: value }); notify(); }}
            className="space-y-2 md:space-y-3"
          >
            {yearsOptions.map((option) => (
              <label
                key={option.value}
                htmlFor={`years-${option.value}`}
                className={cn(
                  "flex items-center space-x-3 p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all",
                  formData.yearsWorked === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value={option.value} id={`years-${option.value}`} />
                <Label htmlFor={`years-${option.value}`} className="text-sm md:text-lg cursor-pointer flex-1">{option.label}</Label>
              </label>
            ))}
          </RadioGroup>
        </div>
      </FormStep>

      {/* Step 4: Birth date */}
      <FormStep isActive={currentStep === 4}>
        <div className="space-y-3 md:space-y-6">
          <p className="text-xs md:text-base font-medium text-foreground mb-2 md:mb-4">{t("forms.lpp.birthDateQuestion")}</p>
          <FormFieldWrapper label={t("forms.lpp.birthDate")} htmlFor="birthDate" required>
            <Input
              id="birthDate"
              value={formData.birthDate}
              onChange={(e) => {
                const val = e.target.value;
                let formatted = val.replace(/[^\d/]/g, '');
                if (formatted.length === 2 && !formatted.includes('/')) formatted += '/';
                if (formatted.length === 5 && formatted.split('/').length === 2) formatted += '/';
                if (formatted.length <= 10) {
                  updateFormData({ birthDate: formatted });
                  notifyDelayed();
                }
              }}
              placeholder="JJ/MM/AAAA"
              inputMode="numeric"
              maxLength={10}
              className="h-11 md:h-14 text-sm md:text-lg"
            />
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 5: Identity */}
      <FormStep isActive={currentStep === 5}>
        <div className="space-y-3 md:space-y-6">
          <div className="text-center mb-3 md:mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full bg-primary/10 mb-2 md:mb-4">
              <User className="h-5 w-5 md:h-8 md:w-8 text-primary" />
            </div>
            <h3 className="text-sm md:text-xl font-semibold">{t("forms.contact.almostDone")}</h3>
            <p className="text-xs md:text-base text-muted-foreground">{t("forms.contact.nameStepDescription")}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <FormFieldWrapper label={t("forms.contact.firstName")} htmlFor="firstName" required>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => { updateFormData({ firstName: e.target.value }); notifyDelayed(); }}
                className="h-11 md:h-14 text-sm md:text-lg"
              />
            </FormFieldWrapper>
            <FormFieldWrapper label={t("forms.contact.lastName")} htmlFor="lastName" required>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => { updateFormData({ lastName: e.target.value }); notifyDelayed(); }}
                className="h-11 md:h-14 text-sm md:text-lg"
              />
            </FormFieldWrapper>
          </div>
        </div>
      </FormStep>

      {/* Step 6: Contact */}
      <FormStep isActive={currentStep === 6}>
        <div className="space-y-3 md:space-y-6">
          <div className="text-center mb-3 md:mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full bg-primary/10 mb-2 md:mb-4">
              <Phone className="h-5 w-5 md:h-8 md:w-8 text-primary" />
            </div>
            <h3 className="text-sm md:text-xl font-semibold">{t("forms.lpp.ctaFinal")}</h3>
            <p className="text-xs md:text-base text-muted-foreground">{t("forms.contact.contactStepDescription")}</p>
          </div>

          <FormFieldWrapper label={t("forms.contact.email")} htmlFor="email" required error={stepErrors.email}>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => { updateFormData({ email: e.target.value }); notifyDelayed(); }}
              className={cn("h-11 md:h-14 text-sm md:text-lg", stepErrors.email && "border-destructive")}
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.contact.phone")} htmlFor="phone" required error={stepErrors.phone}>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => { updateFormData({ phone: formatSwissPhone(e.target.value) }); notifyDelayed(); }}
              placeholder="+41 79 123 45 67"
              className={cn("h-11 md:h-14 text-sm md:text-lg", stepErrors.phone && "border-destructive")}
            />
          </FormFieldWrapper>

          <div className="flex items-center gap-2 p-2 md:p-4 bg-muted/50 rounded-lg">
            <Lock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
            <p className="text-[10px] md:text-sm text-muted-foreground">{t("forms.contact.privacyNote")}</p>
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
      
    </FormContainer>
  );
};

export default LppForm;
