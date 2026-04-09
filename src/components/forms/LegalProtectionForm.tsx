import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import FormContainer from "@/components/forms/FormContainer";
import FormStep from "@/components/forms/FormStep";
import FormNavigation from "@/components/forms/FormNavigation";
import FormFieldWrapper from "@/components/forms/FormField";
import ComparisonResults from "@/components/forms/ComparisonResults";
import LoadingComparison from "@/components/forms/LoadingComparison";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { useLeadSubmission } from "@/hooks/useLeadSubmission";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { swissCantons, getCantonName } from "@/data/swissCantons";
import { mockLegalProtectionOffers, InsuranceOffer } from "@/data/mockInsuranceData";
import { Lock, User, Phone } from "lucide-react";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";
import { useOtpFormFlow } from "@/hooks/useOtpFormFlow";
import SmsVerificationModal from "@/components/forms/SmsVerificationModal";
import { cn } from "@/lib/utils";

interface LegalProtectionFormData {
  coverageType: string;
  coverageAreas: {
    traffic: boolean;
    private: boolean;
    work: boolean;
    property: boolean;
    tenant: boolean;
  };
  householdSize: string;
  canton: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const TOTAL_STEPS = 4;

const LegalProtectionForm = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { localizedPath } = useLocalizedPath();
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"analyzing" | "comparing" | "preparing">("analyzing");
  const { attemptedNext, markAttempted, resetAttempted, formatSwissPhone, isValidEmail, isValidPhone, getContactErrors, getIdentityErrors, showValidationToast } = useFormValidation();

  const initialData: LegalProtectionFormData = {
    coverageType: "complete",
    coverageAreas: {
      traffic: true,
      private: true,
      work: false,
      property: false,
      tenant: false,
    },
    householdSize: "1",
    canton: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  };

  const { submitLead, isSubmitting } = useLeadSubmission({
    formType: "legal-protection",
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

  useEffect(() => {
    if ((location.state as any)?.showResults) {
      setIsLoading(true);
      setLoadingStep("analyzing");
      setTimeout(() => setLoadingStep("comparing"), 800);
      setTimeout(() => setLoadingStep("preparing"), 1600);
      setTimeout(() => { setIsLoading(false); setShowResults(true); }, 2400);
      window.history.replaceState({}, '');
    }
  }, []);

  const performSubmit = useCallback(async () => {
    await submitLead(formData as unknown as Record<string, unknown>);
    navigate(localizedPath("/merci"), { state: { returnUrl: location.pathname } });
  }, [formData, submitLead, navigate, localizedPath, location.pathname]);

  const { startOtpFlow, otpModalProps } = useOtpFormFlow({
    onOtpVerified: performSubmit,
    getPhone: () => formData.phone,
  });

  const handleSubmit = async () => {
    await startOtpFlow();
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 2: return formData.canton !== "";
      case 3: return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
      case 4: return isValidEmail(formData.email) && isValidPhone(formData.phone);
      default: return true;
    }
  };

  const getStepErrors = (step: number): Record<string, string> => {
    if (step === 3) return getIdentityErrors(formData.firstName, formData.lastName);
    if (step === 4) return getContactErrors(formData.email, formData.phone);
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

  const handleSelectOffer = (offer: InsuranceOffer) => {
    console.log("Selected offer:", offer);
  };

  const handleContactRequest = (offer: InsuranceOffer, type: "call" | "email") => {
    console.log("Contact request:", offer, type);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <LoadingComparison step={loadingStep} />
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto">
        <ComparisonResults
          offers={mockLegalProtectionOffers}
          onSelectOffer={handleSelectOffer}
          onContactRequest={handleContactRequest}
        />
      </div>
    );
  }

  return (
    <FormContainer
      title={t("forms.legalProtection.title")}
      description={t("forms.legalProtection.description")}
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
    >
      {/* Step 1: Coverage Type */}
      <FormStep isActive={currentStep === 1}>
        <div className="space-y-6">
          <FormFieldWrapper label={t("forms.legalProtection.coverageType")} required>
            <RadioGroup
              value={formData.coverageType}
              onValueChange={(value) => {
                updateFormData({ coverageType: value });
                if (value !== "custom") notify();
              }}
              className="grid gap-3"
            >
              {[
                { value: "complete", label: t("forms.legalProtection.types.complete"), desc: t("forms.legalProtection.types.completeDesc") },
                { value: "traffic", label: t("forms.legalProtection.types.traffic"), desc: t("forms.legalProtection.types.trafficDesc") },
                { value: "custom", label: t("forms.legalProtection.types.custom"), desc: t("forms.legalProtection.types.customDesc") },
              ].map((type) => (
                <label key={type.value} htmlFor={type.value} className="flex items-start space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                  <span className="flex-1">
                    <span className="font-medium text-lg">{type.label}</span>
                    <p className="text-sm text-muted-foreground">{type.desc}</p>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </FormFieldWrapper>

          {formData.coverageType === "custom" && (
            <div className="space-y-3 pl-4 border-l-2 border-primary">
              <p className="font-medium text-sm">{t("forms.legalProtection.selectAreas")}</p>
              {[
                { key: "traffic", label: t("forms.legalProtection.areas.traffic") },
                { key: "private", label: t("forms.legalProtection.areas.private") },
                { key: "work", label: t("forms.legalProtection.areas.work") },
                { key: "property", label: t("forms.legalProtection.areas.property") },
                { key: "tenant", label: t("forms.legalProtection.areas.tenant") },
              ].map((area) => (
                <label key={area.key} htmlFor={area.key} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    id={area.key}
                    checked={formData.coverageAreas[area.key as keyof typeof formData.coverageAreas]}
                    onCheckedChange={(checked) =>
                      updateFormData({
                        coverageAreas: { ...formData.coverageAreas, [area.key]: checked as boolean },
                      })
                    }
                  />
                  <span>
                    {area.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </FormStep>

      {/* Step 2: Household */}
      <FormStep isActive={currentStep === 2}>
        <div className="space-y-3 md:space-y-4">
          <FormFieldWrapper label={t("forms.legalProtection.householdSize")} required>
            <RadioGroup
              value={formData.householdSize}
              onValueChange={(value) => { updateFormData({ householdSize: value }); notify(); }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3"
            >
              {[
                { value: "1", label: t("forms.legalProtection.single") },
                { value: "2", label: t("forms.legalProtection.couple") },
                { value: "family", label: t("forms.legalProtection.family") },
              ].map((size) => (
                <label key={size.value} htmlFor={`size-${size.value}`} className="flex items-center space-x-2 p-2.5 md:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value={size.value} id={`size-${size.value}`} />
                  <span className="text-sm md:text-lg">
                    {size.label}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.healthInsurance.canton")} required>
            <Select
              value={formData.canton}
              onValueChange={(value) => { updateFormData({ canton: value }); notify(); }}
            >
              <SelectTrigger className="h-9 md:h-14 text-sm md:text-lg">
                <SelectValue placeholder={t("forms.healthInsurance.selectCanton")} />
              </SelectTrigger>
              <SelectContent>
                {swissCantons.map((canton) => (
                  <SelectItem key={canton.code} value={canton.code}>
                    {getCantonName(canton.code, i18n.language)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 3: Identity */}
      <FormStep isActive={currentStep === 3}>
        <div className="space-y-6">
          <div className="text-center mb-4 md:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 mb-3 md:mb-4">
              <User className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold">{t("forms.contact.almostDone")}</h3>
            <p className="text-sm md:text-base text-muted-foreground">{t("forms.contact.nameStepDescription")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <FormFieldWrapper label={t("forms.contact.firstName")} htmlFor="firstName" required>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => { updateFormData({ firstName: e.target.value }); notifyDelayed(); }}
                className="h-12 md:h-14 text-base md:text-lg"
              />
            </FormFieldWrapper>
            <FormFieldWrapper label={t("forms.contact.lastName")} htmlFor="lastName" required>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => { updateFormData({ lastName: e.target.value }); notifyDelayed(); }}
                className="h-12 md:h-14 text-base md:text-lg"
              />
            </FormFieldWrapper>
          </div>
        </div>
      </FormStep>

      {/* Step 4: Contact */}
      <FormStep isActive={currentStep === 4}>
        <div className="space-y-6">
          <div className="text-center mb-4 md:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 mb-3 md:mb-4">
              <Phone className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold">{t("forms.contact.contactStepTitle")}</h3>
            <p className="text-sm md:text-base text-muted-foreground">{t("forms.contact.contactStepDescription")}</p>
          </div>

          <FormFieldWrapper label={t("forms.contact.email")} htmlFor="email" required error={stepErrors.email}>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => { updateFormData({ email: e.target.value }); notifyDelayed(); }}
              className={cn("h-12 md:h-14 text-base md:text-lg", stepErrors.email && "border-red-400")}
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
              className={cn("h-12 md:h-14 text-base md:text-lg", stepErrors.phone && "border-red-400")}
            />
          </FormFieldWrapper>

          <div className="flex items-center gap-2 p-3 md:p-4 bg-muted/50 rounded-lg">
            <Lock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
            <p className="text-xs md:text-sm text-muted-foreground">{t("forms.contact.privacyNote")}</p>
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

export default LegalProtectionForm;
