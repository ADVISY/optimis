import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import FormContainer from "@/components/forms/FormContainer";
import FormStep from "@/components/forms/FormStep";
import FormNavigation from "@/components/forms/FormNavigation";
import FormFieldWrapper from "@/components/forms/FormField";
import ComparisonResults from "@/components/forms/ComparisonResults";
import LoadingComparison from "@/components/forms/LoadingComparison";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { useLeadSubmission } from "@/hooks/useLeadSubmission";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockLegalProtectionOffers, InsuranceOffer } from "@/data/mockInsuranceData";
import { Lock, User, Phone } from "lucide-react";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";
import { cn } from "@/lib/utils";

interface ProfessionalInsuranceFormData {
  insuranceTypes: {
    rcProfessional: boolean;
    lossOfEarnings: boolean;
    laa: boolean;
    lpp: boolean;
    legalProtection: boolean;
    multiRisk: boolean;
  };
  activityType: string;
  legalForm: string;
  employeesCount: string;
  revenue: string;
  contractStartDate: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

const TOTAL_STEPS = 6;

const ProfessionalInsuranceForm = () => {
  const { t, i18n } = useTranslation();
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"analyzing" | "comparing" | "preparing">("analyzing");
  const { attemptedNext, markAttempted, resetAttempted, formatSwissPhone, isValidEmail, isValidPhone, getContactErrors, getIdentityErrors, showValidationToast } = useFormValidation();

  const initialData: ProfessionalInsuranceFormData = {
    insuranceTypes: {
      rcProfessional: false,
      lossOfEarnings: false,
      laa: false,
      lpp: false,
      legalProtection: false,
      multiRisk: false,
    },
    activityType: "",
    legalForm: "",
    employeesCount: "",
    revenue: "",
    contractStartDate: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  };

  const { submitLead, isSubmitting } = useLeadSubmission({
    formType: "professional-insurance",
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

  const handleSubmit = async () => {
    setIsLoading(true);
    setLoadingStep("analyzing");
    setTimeout(() => setLoadingStep("comparing"), 1000);
    setTimeout(() => setLoadingStep("preparing"), 2000);
    await submitLead(formData as unknown as Record<string, unknown>);
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 3000);
  };

  const isValidDate = (d: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(d);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 2: return formData.activityType.trim() !== "" && formData.legalForm !== "" && formData.employeesCount !== "";
      case 3: return formData.revenue.trim() !== "" && isValidDate(formData.contractStartDate);
      case 4: return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
      case 5: return isValidEmail(formData.email) && isValidPhone(formData.phone);
      default: return true;
    }
  };

  const getStepErrors = (step: number): Record<string, string> => {
    if (step === 4) return getIdentityErrors(formData.firstName, formData.lastName);
    if (step === 5) return getContactErrors(formData.email, formData.phone);
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
      title={t("forms.professionalInsurance.title")}
      description={t("forms.professionalInsurance.description")}
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
    >
      {/* Step 1: Insurance Types */}
      <FormStep isActive={currentStep === 1}>
        <div className="space-y-2 md:space-y-4">
          <p className="text-[10px] md:text-sm text-muted-foreground mb-2 md:mb-4">
            {t("forms.professionalInsurance.selectTypes")}
          </p>
          {[
            { key: "rcProfessional", label: t("forms.professionalInsurance.types.rcProfessional") },
            { key: "lossOfEarnings", label: t("forms.professionalInsurance.types.lossOfEarnings") },
            { key: "laa", label: t("forms.professionalInsurance.types.laa") },
            { key: "lpp", label: t("forms.professionalInsurance.types.lpp") },
            { key: "legalProtection", label: t("forms.professionalInsurance.types.legalProtection") },
            { key: "multiRisk", label: t("forms.professionalInsurance.types.multiRisk") },
          ].map((type) => (
            <label key={type.key} htmlFor={type.key} className="flex items-center space-x-2 md:space-x-3 p-2 md:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <Checkbox
                id={type.key}
                checked={formData.insuranceTypes[type.key as keyof typeof formData.insuranceTypes]}
                onCheckedChange={(checked) =>
                  updateFormData({
                    insuranceTypes: { ...formData.insuranceTypes, [type.key]: checked as boolean },
                  })
                }
                className="h-4 w-4 md:h-5 md:w-5"
              />
              <span className="flex-1 text-xs md:text-lg">
                {type.label}
              </span>
            </label>
          ))}
        </div>
      </FormStep>

      {/* Step 2: Company Info */}
      <FormStep isActive={currentStep === 2}>
        <div className="space-y-2 md:space-y-4">
          <FormFieldWrapper label={t("forms.professionalInsurance.activityType")} htmlFor="activityType" required>
            <Input
              id="activityType"
              value={formData.activityType}
              onChange={(e) => { updateFormData({ activityType: e.target.value }); notifyDelayed(); }}
              placeholder={t("forms.professionalInsurance.activityPlaceholder")}
              className="h-11 md:h-14 text-sm md:text-lg"
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.professionalInsurance.legalForm")} required>
            <Select
              value={formData.legalForm}
              onValueChange={(value) => { updateFormData({ legalForm: value }); notifyDelayed(); }}
            >
              <SelectTrigger className="h-11 md:h-14 text-sm md:text-lg">
                <SelectValue placeholder={t("forms.professionalInsurance.selectLegalForm")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self-employed">{t("forms.professionalInsurance.legalForms.selfEmployed")}</SelectItem>
                <SelectItem value="sarl">{t("forms.professionalInsurance.legalForms.sarl")}</SelectItem>
                <SelectItem value="sa">{t("forms.professionalInsurance.legalForms.sa")}</SelectItem>
                <SelectItem value="snc">{t("forms.professionalInsurance.legalForms.snc")}</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.professionalInsurance.employeesCount")} required>
            <Select
              value={formData.employeesCount}
              onValueChange={(value) => { updateFormData({ employeesCount: value }); notifyDelayed(); }}
            >
              <SelectTrigger className="h-11 md:h-14 text-sm md:text-lg">
                <SelectValue placeholder={t("forms.professionalInsurance.selectEmployees")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 ({t("forms.professionalInsurance.soloEntrepreneur")})</SelectItem>
                <SelectItem value="1-5">1-5</SelectItem>
                <SelectItem value="6-20">6-20</SelectItem>
                <SelectItem value="21-50">21-50</SelectItem>
                <SelectItem value="50+">50+</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 3: Revenue & Contract Start */}
      <FormStep isActive={currentStep === 3}>
        <div className="space-y-2 md:space-y-4">
          <FormFieldWrapper label={t("forms.professionalInsurance.revenue")} htmlFor="revenue" required>
            <Input
              id="revenue"
              value={formData.revenue}
              onChange={(e) => { updateFormData({ revenue: e.target.value }); notifyDelayed(); }}
              placeholder={t("forms.professionalInsurance.revenuePlaceholder")}
              className="h-11 md:h-14 text-sm md:text-lg"
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.professionalInsurance.contractStartDate")} htmlFor="contractStartDate" required>
            <Input
              id="contractStartDate"
              value={formData.contractStartDate}
              onChange={(e) => {
                const val = e.target.value;
                // Auto-format: add slashes after DD and MM
                let formatted = val.replace(/[^\d/]/g, '');
                if (formatted.length === 2 && !formatted.includes('/')) formatted += '/';
                if (formatted.length === 5 && formatted.split('/').length === 2) formatted += '/';
                if (formatted.length <= 10) {
                  updateFormData({ contractStartDate: formatted });
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

      {/* Step 4: Identity */}
      <FormStep isActive={currentStep === 4}>
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

      {/* Step 5: Contact */}
      <FormStep isActive={currentStep === 5}>
        <div className="space-y-3 md:space-y-6">
          <div className="text-center mb-3 md:mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full bg-primary/10 mb-2 md:mb-4">
              <Phone className="h-5 w-5 md:h-8 md:w-8 text-primary" />
            </div>
            <h3 className="text-sm md:text-xl font-semibold">{t("forms.contact.contactStepTitle")}</h3>
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

      {/* Step 6: Message */}
      <FormStep isActive={currentStep === 6}>
        <div className="space-y-2 md:space-y-4">
          <FormFieldWrapper label={t("forms.professionalInsurance.message")} htmlFor="message">
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => updateFormData({ message: e.target.value })}
              placeholder={t("forms.professionalInsurance.messagePlaceholder")}
              rows={3}
              className="text-sm md:text-lg min-h-[80px] md:min-h-[120px]"
            />
          </FormFieldWrapper>
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

export default ProfessionalInsuranceForm;
