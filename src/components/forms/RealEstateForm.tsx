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

interface RealEstateFormData {
  address: string;
  propertyType: string;
  rooms: string;
  surface: string;
  saleTimeline: string;
  hasMandate: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

const TOTAL_STEPS = 8;

const RealEstateForm = () => {
  const { t } = useTranslation();
  const [showThankYou, setShowThankYou] = useState(false);
  const { attemptedNext, markAttempted, resetAttempted, formatSwissPhone, isValidEmail, isValidPhone, getContactErrors, getIdentityErrors, showValidationToast } = useFormValidation();

  const initialData: RealEstateFormData = {
    address: "",
    propertyType: "",
    rooms: "",
    surface: "",
    saleTimeline: "",
    hasMandate: "",
    
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  };

  const { submitLead, isSubmitting } = useLeadSubmission({
    formType: "estimation-immobiliere",
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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: return formData.address.trim() !== "";
      case 2: return formData.propertyType !== "";
      case 3: return formData.rooms !== "";
      case 4: return formData.surface.trim() !== "";
      case 5: return formData.saleTimeline !== "";
      case 6: return formData.hasMandate !== "";
      case 7: return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
      case 8: return isValidEmail(formData.email) && isValidPhone(formData.phone);
      default: return true;
    }
  };

  const getStepErrors = (step: number): Record<string, string> => {
    if (step === 7) return getIdentityErrors(formData.firstName, formData.lastName);
    if (step === 8) return getContactErrors(formData.email, formData.phone);
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
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("forms.realEstate.thankYouTitle")}</h2>
        <p className="text-lg text-muted-foreground">{t("forms.realEstate.thankYouDescription")}</p>
      </div>
    );
  }

  const propertyOptions = [
    { value: "apartment", label: t("forms.realEstate.propertyTypes.apartment") },
    { value: "house", label: t("forms.realEstate.propertyTypes.house") },
    { value: "villa", label: t("forms.realEstate.propertyTypes.villa") },
    { value: "commercial", label: t("forms.realEstate.propertyTypes.commercial") },
    { value: "land", label: t("forms.realEstate.propertyTypes.land") },
  ];

  const roomsOptions = [
    { value: "1-2", label: "1-2" },
    { value: "3-4", label: "3-4" },
    { value: "5-6", label: "5-6" },
    { value: "7+", label: "7+" },
  ];

  const timelineOptions = [
    { value: "urgent", label: t("forms.realEstate.timelines.urgent") },
    { value: "3-months", label: t("forms.realEstate.timelines.threeMonths") },
    { value: "6-months", label: t("forms.realEstate.timelines.sixMonths") },
    { value: "no-rush", label: t("forms.realEstate.timelines.noRush") },
  ];

  const yesNoOptions = [
    { value: "yes", label: t("common.yes") },
    { value: "no", label: t("common.no") },
  ];

  return (
    <FormContainer
      title={t("forms.realEstate.title")}
      description={t("forms.realEstate.description")}
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
    >
      {/* Step 1: Address */}
      <FormStep isActive={currentStep === 1}>
        <div className="space-y-3 md:space-y-6">
          <p className="text-xs md:text-base font-medium text-foreground mb-2 md:mb-4">{t("forms.realEstate.addressQuestion")}</p>
          <FormFieldWrapper label={t("forms.realEstate.address")} htmlFor="address" required>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => { updateFormData({ address: e.target.value }); notifyDelayed(); }}
              placeholder={t("forms.realEstate.addressPlaceholder")}
              className="h-11 md:h-14 text-sm md:text-lg"
            />
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 2: Property Type */}
      <FormStep isActive={currentStep === 2}>
        <div className="space-y-2 md:space-y-3">
          <p className="text-xs md:text-base font-medium text-foreground mb-2 md:mb-4">{t("forms.realEstate.propertyQuestion")}</p>
          <RadioGroup
            value={formData.propertyType}
            onValueChange={(value) => { updateFormData({ propertyType: value }); notify(); }}
            className="space-y-2 md:space-y-3"
          >
            {propertyOptions.map((option) => (
              <label
                key={option.value}
                htmlFor={`property-${option.value}`}
                className={cn(
                  "flex items-center space-x-3 p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all",
                  formData.propertyType === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value={option.value} id={`property-${option.value}`} />
                <Label htmlFor={`property-${option.value}`} className="text-sm md:text-lg cursor-pointer flex-1">{option.label}</Label>
              </label>
            ))}
          </RadioGroup>
        </div>
      </FormStep>

      {/* Step 3: Rooms */}
      <FormStep isActive={currentStep === 3}>
        <div className="space-y-2 md:space-y-3">
          <p className="text-xs md:text-base font-medium text-foreground mb-2 md:mb-4">{t("forms.realEstate.roomsQuestion")}</p>
          <RadioGroup
            value={formData.rooms}
            onValueChange={(value) => { updateFormData({ rooms: value }); notify(); }}
            className="space-y-2 md:space-y-3"
          >
            {roomsOptions.map((option) => (
              <label
                key={option.value}
                htmlFor={`rooms-${option.value}`}
                className={cn(
                  "flex items-center space-x-3 p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all",
                  formData.rooms === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value={option.value} id={`rooms-${option.value}`} />
                <Label htmlFor={`rooms-${option.value}`} className="text-sm md:text-lg cursor-pointer flex-1">{option.label} {t("forms.realEstate.rooms")}</Label>
              </label>
            ))}
          </RadioGroup>
        </div>
      </FormStep>

      {/* Step 4: Surface */}
      <FormStep isActive={currentStep === 4}>
        <div className="space-y-3 md:space-y-6">
          <p className="text-xs md:text-base font-medium text-foreground mb-2 md:mb-4">{t("forms.realEstate.surfaceQuestion")}</p>
          <FormFieldWrapper label={t("forms.realEstate.surface")} htmlFor="surface" required>
            <Input
              id="surface"
              value={formData.surface}
              onChange={(e) => { updateFormData({ surface: e.target.value }); notifyDelayed(); }}
              placeholder="120 m²"
              inputMode="numeric"
              className="h-11 md:h-14 text-sm md:text-lg"
            />
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 5: Timeline */}
      <FormStep isActive={currentStep === 5}>
        <div className="space-y-2 md:space-y-3">
          <p className="text-xs md:text-base font-medium text-foreground mb-2 md:mb-4">{t("forms.realEstate.timelineQuestion")}</p>
          <RadioGroup
            value={formData.saleTimeline}
            onValueChange={(value) => { updateFormData({ saleTimeline: value }); notify(); }}
            className="space-y-2 md:space-y-3"
          >
            {timelineOptions.map((option) => (
              <label
                key={option.value}
                htmlFor={`timeline-${option.value}`}
                className={cn(
                  "flex items-center space-x-3 p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all",
                  formData.saleTimeline === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value={option.value} id={`timeline-${option.value}`} />
                <Label htmlFor={`timeline-${option.value}`} className="text-sm md:text-lg cursor-pointer flex-1">{option.label}</Label>
              </label>
            ))}
          </RadioGroup>
        </div>
      </FormStep>

      {/* Step 6: Mandate */}
      <FormStep isActive={currentStep === 6}>
        <div className="space-y-2 md:space-y-3">
          <p className="text-xs md:text-base font-medium text-foreground mb-2 md:mb-4">{t("forms.realEstate.mandateQuestion")}</p>
          <RadioGroup
            value={formData.hasMandate}
            onValueChange={(value) => { updateFormData({ hasMandate: value }); notify(); }}
            className="space-y-2 md:space-y-3"
          >
            {yesNoOptions.map((option) => (
              <label
                key={`mandate-${option.value}`}
                htmlFor={`mandate-${option.value}`}
                className={cn(
                  "flex items-center space-x-3 p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all",
                  formData.hasMandate === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value={option.value} id={`mandate-${option.value}`} />
                <Label htmlFor={`mandate-${option.value}`} className="text-sm md:text-lg cursor-pointer flex-1">{option.label}</Label>
              </label>
            ))}
          </RadioGroup>
        </div>
      </FormStep>

      {/* Step 6: Identity */}
      <FormStep isActive={currentStep === 7}>
        <div className="space-y-3 md:space-y-6">
          <div className="text-center mb-3 md:mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full bg-primary/10 mb-2 md:mb-4">
              <User className="h-5 w-5 md:h-8 md:w-8 text-primary" />
            </div>
            <h3 className="text-sm md:text-xl font-semibold">{t("forms.contact.almostDone")}</h3>
            <p className="text-xs md:text-base text-muted-foreground">{t("forms.contact.nameStepDescription")}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <FormFieldWrapper label={t("forms.contact.firstName")} htmlFor="firstName" required error={stepErrors.firstName}>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => { updateFormData({ firstName: e.target.value }); notifyDelayed(); }}
                className="h-11 md:h-14 text-sm md:text-lg"
              />
            </FormFieldWrapper>
            <FormFieldWrapper label={t("forms.contact.lastName")} htmlFor="lastName" required error={stepErrors.lastName}>
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

      {/* Step 8: Contact */}
      <FormStep isActive={currentStep === 8}>
        <div className="space-y-3 md:space-y-6">
          <div className="text-center mb-3 md:mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full bg-primary/10 mb-2 md:mb-4">
              <Phone className="h-5 w-5 md:h-8 md:w-8 text-primary" />
            </div>
            <h3 className="text-sm md:text-xl font-semibold">{t("forms.realEstate.ctaFinal")}</h3>
            <p className="text-xs md:text-base text-muted-foreground">{t("forms.contact.contactStepDescription")}</p>
          </div>

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

export default RealEstateForm;
