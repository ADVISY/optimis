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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { swissCantons, getCantonName } from "@/data/swissCantons";
import { mockHouseholdInsuranceOffers, InsuranceOffer } from "@/data/mockInsuranceData";
import { Lock, User, Phone } from "lucide-react";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";
// OTP disabled for testing — kept on Car and Pillar3 only
import { cn } from "@/lib/utils";

interface HouseholdInsuranceFormData {
  propertyType: string;
  ownershipStatus: string;
  livingSpace: string;
  numberOfRooms: string;
  canton: string;
  postalCode: string;
  propertyValue: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const TOTAL_STEPS = 4;

const HouseholdInsuranceForm = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { localizedPath } = useLocalizedPath();
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"analyzing" | "comparing" | "preparing">("analyzing");
  const { attemptedNext, markAttempted, resetAttempted, formatSwissPhone, isValidEmail, isValidPhone, getContactErrors, getIdentityErrors, showValidationToast } = useFormValidation();

  const initialData: HouseholdInsuranceFormData = {
    propertyType: "",
    ownershipStatus: "",
    livingSpace: "",
    numberOfRooms: "",
    canton: "",
    postalCode: "",
    propertyValue: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  };

  const { submitLead, isSubmitting } = useLeadSubmission({
    formType: "household-insurance",
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

  const handleSubmit = async () => {
    sessionStorage.setItem("phone_verified", "true");
    await performSubmit();
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 2: return formData.canton !== "" && formData.propertyValue !== "" && formData.postalCode.replace(/\D/g, '').length >= 4;
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
          offers={mockHouseholdInsuranceOffers}
          onSelectOffer={handleSelectOffer}
          onContactRequest={handleContactRequest}
        />
      </div>
    );
  }

  return (
    <FormContainer
      title={t("forms.householdInsurance.title")}
      description={t("forms.householdInsurance.description")}
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
    >
      {/* Step 1: Property */}
      <FormStep isActive={currentStep === 1}>
        <div className="space-y-4">
          <FormFieldWrapper label={t("forms.householdInsurance.propertyType")} required>
            <RadioGroup
              value={formData.propertyType}
              onValueChange={(value) => updateFormData({ propertyType: value })}
              className="grid gap-3"
            >
              {[
                { value: "apartment", label: t("forms.mortgage.propertyTypes.apartment") },
                { value: "house", label: t("forms.mortgage.propertyTypes.house") },
              ].map((type) => (
                <label key={type.value} htmlFor={type.value} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <span className="flex-1 text-lg">
                    {type.label}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.householdInsurance.ownershipStatus")} required>
            <RadioGroup
              value={formData.ownershipStatus}
              onValueChange={(value) => updateFormData({ ownershipStatus: value })}
              className="grid grid-cols-2 gap-3"
            >
              <label htmlFor="tenant" className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="tenant" id="tenant" />
                <span className="text-lg">
                  {t("forms.householdInsurance.tenant")}
                </span>
              </label>
              <label htmlFor="owner" className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="owner" id="owner" />
                <span className="text-lg">
                  {t("forms.householdInsurance.owner")}
                </span>
              </label>
            </RadioGroup>
          </FormFieldWrapper>

          <div className="grid grid-cols-2 gap-4">
            <FormFieldWrapper label={t("forms.householdInsurance.livingSpace")} htmlFor="livingSpace">
              <Input
                id="livingSpace"
                type="number"
                value={formData.livingSpace}
              onChange={(e) => { updateFormData({ livingSpace: e.target.value }); notifyDelayed(); }}
              placeholder="80 m²"
              className="h-14 text-lg"
              />
            </FormFieldWrapper>

            <FormFieldWrapper label={t("forms.householdInsurance.numberOfRooms")} htmlFor="numberOfRooms">
              <Select
                value={formData.numberOfRooms}
                onValueChange={(value) => updateFormData({ numberOfRooms: value })}
              >
                <SelectTrigger className="h-14 text-lg">
                  <SelectValue placeholder={t("forms.householdInsurance.selectRooms")} />
                </SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4", "5", "6+"].map((num) => (
                    <SelectItem key={num} value={num}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormFieldWrapper>
          </div>
        </div>
      </FormStep>

      {/* Step 2: Location & Value */}
      <FormStep isActive={currentStep === 2}>
        <div className="space-y-4">
          <FormFieldWrapper label={t("forms.healthInsurance.canton")} required>
            <Select
              value={formData.canton}
              onValueChange={(value) => updateFormData({ canton: value })}
            >
              <SelectTrigger className="h-14 text-lg">
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

          <FormFieldWrapper label={t("forms.healthInsurance.postalCode")} htmlFor="postalCode">
            <Input
              id="postalCode"
              type="text"
              maxLength={4}
              value={formData.postalCode}
              onChange={(e) => { updateFormData({ postalCode: e.target.value }); notifyDelayed(); }}
              placeholder="1000"
              className="h-14 text-lg"
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.householdInsurance.propertyValue")} htmlFor="propertyValue" required>
            <Select
              value={formData.propertyValue}
              onValueChange={(value) => updateFormData({ propertyValue: value })}
            >
              <SelectTrigger className="h-14 text-lg">
                <SelectValue placeholder={t("forms.householdInsurance.selectValue")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-30000">&lt; CHF 30'000</SelectItem>
                <SelectItem value="30000-50000">CHF 30'000 - 50'000</SelectItem>
                <SelectItem value="50000-80000">CHF 50'000 - 80'000</SelectItem>
                <SelectItem value="80000-120000">CHF 80'000 - 120'000</SelectItem>
                <SelectItem value="120000+">&gt; CHF 120'000</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 3: Identity */}
      <FormStep isActive={currentStep === 3}>
        <div className="space-y-6">
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
                onChange={(e) => { updateFormData({ firstName: e.target.value }); notifyDelayed(); }}
                className="h-14 text-lg"
              />
            </FormFieldWrapper>
            <FormFieldWrapper label={t("forms.contact.lastName")} htmlFor="lastName" required>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => { updateFormData({ lastName: e.target.value }); notifyDelayed(); }}
                className="h-14 text-lg"
              />
            </FormFieldWrapper>
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
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => { updateFormData({ phone: formatSwissPhone(e.target.value) }); notifyDelayed(); }}
              placeholder="+41 79 123 45 67"
              className={cn("h-14 text-lg", stepErrors.phone && "border-red-400")}
            />
          </FormFieldWrapper>

          <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
            <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{t("forms.contact.privacyNote")}</p>
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

export default HouseholdInsuranceForm;
