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
// OTP disabled for testing — kept on Car and Pillar3 only
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Lock, User, Phone, Building2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PartnerFormData {
  budget: string;
  sector: string;
  companyName: string;
  salesForce: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const TOTAL_STEPS = 6;

const PartnerForm = () => {
  const { t } = useTranslation();
  const [showThankYou, setShowThankYou] = useState(false);
  const { attemptedNext, markAttempted, resetAttempted, formatSwissPhone, isValidEmail, isValidPhone, getContactErrors, getIdentityErrors, showValidationToast } = useFormValidation();

  const initialData: PartnerFormData = {
    budget: "",
    sector: "",
    companyName: "",
    salesForce: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  };

  const { submitLead, isSubmitting } = useLeadSubmission({
    formType: "partner",
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
      case 1: return formData.budget !== "";
      case 2: return formData.sector !== "";
      case 3: return formData.companyName.trim() !== "";
      case 4: return formData.salesForce !== "";
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

  if (showThankYou) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          {t("partner.thankYouTitle", "Merci pour votre demande")}
        </h2>
        <p className="text-lg text-muted-foreground">
          {t("partner.thankYouDescription", "Un membre de notre équipe vous contactera dans les 24 heures pour discuter de votre partenariat.")}
        </p>
      </div>
    );
  }

  const budgetOptions = [
    { value: "less-3000", label: t("partner.budgets.less3000", "Moins de CHF 3'000") },
    { value: "3000-5000", label: t("partner.budgets.3000to5000", "CHF 3'000 – 5'000") },
    { value: "5000-10000", label: t("partner.budgets.5000to10000", "CHF 5'000 – 10'000") },
    { value: "10000-plus", label: t("partner.budgets.10000plus", "Plus de CHF 10'000") },
  ];

  const sectorOptions = [
    { value: "insurance", label: t("partner.sectors.insurance", "Assurance") },
    { value: "real-estate", label: t("partner.sectors.realEstate", "Immobilier") },
    { value: "finance", label: t("partner.sectors.finance", "Finance") },
    { value: "telecom", label: t("partner.sectors.telecom", "Télécom") },
    { value: "other", label: t("partner.sectors.other", "Autre") },
  ];

  const salesForceOptions = [
    { value: "1", label: "1" },
    { value: "2-5", label: "2 – 5" },
    { value: "6-10", label: "6 – 10" },
    { value: "11-20", label: "11 – 20" },
    { value: "20-plus", label: "20+" },
  ];

  return (
    <FormContainer
      title={t("partner.formTitle", "Devenir partenaire")}
      description={t("partner.formDescription", "Remplissez ce formulaire en moins de 30 secondes")}
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
    >
      {/* Step 1: Budget */}
      <FormStep isActive={currentStep === 1}>
        <div className="space-y-2 md:space-y-3">
          <p className="text-xs md:text-base font-medium text-foreground mb-2 md:mb-4">
            {t("partner.budgetQuestion", "Quel est votre budget mensuel pour l'achat de leads ?")}
          </p>
          <RadioGroup
            value={formData.budget}
            onValueChange={(value) => { updateFormData({ budget: value }); notify(); }}
            className="space-y-2 md:space-y-3"
          >
            {budgetOptions.map((option) => (
              <label
                key={option.value}
                htmlFor={`budget-${option.value}`}
                className={cn(
                  "flex items-center space-x-3 p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all",
                  formData.budget === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value={option.value} id={`budget-${option.value}`} />
                <Label htmlFor={`budget-${option.value}`} className="text-sm md:text-lg cursor-pointer flex-1">{option.label}</Label>
              </label>
            ))}
          </RadioGroup>
        </div>
      </FormStep>

      {/* Step 2: Sector */}
      <FormStep isActive={currentStep === 2}>
        <div className="space-y-2 md:space-y-3">
          <p className="text-xs md:text-base font-medium text-foreground mb-2 md:mb-4">
            {t("partner.sectorQuestion", "Dans quel secteur êtes-vous ?")}
          </p>
          <RadioGroup
            value={formData.sector}
            onValueChange={(value) => { updateFormData({ sector: value }); notify(); }}
            className="space-y-2 md:space-y-3"
          >
            {sectorOptions.map((option) => (
              <label
                key={option.value}
                htmlFor={`sector-${option.value}`}
                className={cn(
                  "flex items-center space-x-3 p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all",
                  formData.sector === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value={option.value} id={`sector-${option.value}`} />
                <Label htmlFor={`sector-${option.value}`} className="text-sm md:text-lg cursor-pointer flex-1">{option.label}</Label>
              </label>
            ))}
          </RadioGroup>
        </div>
      </FormStep>

      {/* Step 3: Company Name */}
      <FormStep isActive={currentStep === 3}>
        <div className="space-y-3 md:space-y-6">
          <div className="text-center mb-3 md:mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full bg-primary/10 mb-2 md:mb-4">
              <Building2 className="h-5 w-5 md:h-8 md:w-8 text-primary" />
            </div>
            <p className="text-xs md:text-base font-medium text-foreground">
              {t("partner.companyQuestion", "Nom de votre entreprise")}
            </p>
          </div>
          <FormFieldWrapper label={t("partner.companyName", "Entreprise")} htmlFor="companyName" required>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => { updateFormData({ companyName: e.target.value }); notifyDelayed(); }}
              placeholder={t("partner.companyPlaceholder", "Ex: Mon Entreprise SA")}
              className="h-11 md:h-14 text-sm md:text-lg"
            />
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 4: Sales Force */}
      <FormStep isActive={currentStep === 4}>
        <div className="space-y-2 md:space-y-3">
          <p className="text-xs md:text-base font-medium text-foreground mb-2 md:mb-4">
            {t("partner.salesForceQuestion", "Combien de commerciaux avez-vous ?")}
          </p>
          <RadioGroup
            value={formData.salesForce}
            onValueChange={(value) => { updateFormData({ salesForce: value }); notify(); }}
            className="space-y-2 md:space-y-3"
          >
            {salesForceOptions.map((option) => (
              <label
                key={option.value}
                htmlFor={`sales-${option.value}`}
                className={cn(
                  "flex items-center space-x-3 p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all",
                  formData.salesForce === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value={option.value} id={`sales-${option.value}`} />
                <Label htmlFor={`sales-${option.value}`} className="text-sm md:text-lg cursor-pointer flex-1">
                  {option.label} {t("partner.salesPeople", "commerciaux")}
                </Label>
              </label>
            ))}
          </RadioGroup>
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
            <FormFieldWrapper label={t("forms.contact.firstName")} htmlFor="firstName" required error={stepErrors.firstName}>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => { updateFormData({ firstName: e.target.value }); }}
                className="h-11 md:h-14 text-sm md:text-lg"
              />
            </FormFieldWrapper>
            <FormFieldWrapper label={t("forms.contact.lastName")} htmlFor="lastName" required error={stepErrors.lastName}>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => { updateFormData({ lastName: e.target.value }); }}
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
            <h3 className="text-sm md:text-xl font-semibold">
              {t("partner.contactTitle", "Être contacté par Optimis")}
            </h3>
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

export default PartnerForm;
