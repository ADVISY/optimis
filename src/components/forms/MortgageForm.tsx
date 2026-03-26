import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FormContainer from "@/components/forms/FormContainer";
import FormStep from "@/components/forms/FormStep";
import FormNavigation from "@/components/forms/FormNavigation";
import FormFieldWrapper from "@/components/forms/FormField";
import MortgageComparisonResults from "@/components/forms/MortgageComparisonResults";
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
import { mortgageProducts } from "@/data/mortgageProducts";
import { simulateMortgage, MortgageSimulationResult } from "@/utils/mortgageCalculations";
import { Lock, User, Phone } from "lucide-react";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";
import { cn } from "@/lib/utils";

interface MortgageFormData {
  projectType: string;
  propertyType: string;
  propertyValue: string;
  canton: string;
  commune: string;
  numberOfBorrowers: string;
  professionalStatus: string;
  incomeRange: string;
  ownFundsRange: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const TOTAL_STEPS = 5;

const MortgageForm = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"analyzing" | "comparing" | "preparing">("analyzing");
  const [simulationResults, setSimulationResults] = useState<MortgageSimulationResult[]>([]);
  const { attemptedNext, markAttempted, resetAttempted, formatSwissPhone, isValidEmail, isValidPhone, getContactErrors, getIdentityErrors, showValidationToast } = useFormValidation();

  const initialData: MortgageFormData = {
    projectType: "",
    propertyType: "",
    propertyValue: "",
    canton: "",
    commune: "",
    numberOfBorrowers: "1",
    professionalStatus: "",
    incomeRange: "",
    ownFundsRange: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  };

  const { submitLead, isSubmitting } = useLeadSubmission({
    webhookUrl: "https://hooks.zapier.com/hooks/catch/21326682/un2n4oc/",
    formType: "mortgage",
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
    
    // Parse form data for calculations
    const propertyValue = parseFloat(formData.propertyValue.replace(/[^0-9]/g, "")) || 800000;
    const loanAmount = propertyValue * 0.8; // Default 80% LTV
    const duration = 15; // Default duration
    const annualIncome = parseFloat(formData.incomeRange.split("-")[0]) || 150000;
    
    setTimeout(() => setLoadingStep("comparing"), 1000);
    
    // Run simulations for all products
    const results = mortgageProducts.map(product => 
      simulateMortgage(product, {
        loanAmount,
        propertyValue,
        duration,
        annualIncome,
        mortgageType: product.mortgageType,
      })
    );
    
    setSimulationResults(results);
    
    setTimeout(() => setLoadingStep("preparing"), 2000);
    await submitLead(formData as unknown as Record<string, unknown>);
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/${i18n.language}/merci-hypotheque`);
    }, 3000);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: return formData.projectType !== "" && formData.propertyType !== "";
      case 2: return formData.propertyValue !== "" && formData.canton !== "";
      case 3: return formData.professionalStatus !== "" && formData.incomeRange !== "" && formData.ownFundsRange !== "";
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

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <LoadingComparison step={loadingStep} />
      </div>
    );
  }

  if (showResults) {
    // Parse values for display
    const propertyValue = parseFloat(formData.propertyValue.replace(/[^0-9]/g, "")) || 800000;
    const loanAmount = propertyValue * 0.8;
    const duration = 15;
    
    return (
      <div className="max-w-4xl mx-auto">
        <MortgageComparisonResults
          results={simulationResults}
          loanAmount={loanAmount}
          propertyValue={propertyValue}
          duration={duration}
        />
      </div>
    );
  }

  return (
    <FormContainer
      title={t("forms.mortgage.title")}
      description={t("forms.mortgage.description")}
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
    >
      {/* Step 1: Project */}
      <FormStep isActive={currentStep === 1}>
        <div className="space-y-6">
          <FormFieldWrapper label={t("forms.mortgage.projectType")} required>
            <RadioGroup
              value={formData.projectType}
              onValueChange={(value) => { updateFormData({ projectType: value }); notify(); }}
              className="grid gap-3"
            >
              {[
                { value: "acquisition", label: t("forms.mortgage.projects.acquisition") },
                { value: "renewal", label: t("forms.mortgage.projects.renewal") },
                { value: "refinancing", label: t("forms.mortgage.projects.refinancing") },
              ].map((proj) => (
                <label key={proj.value} htmlFor={proj.value} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value={proj.value} id={proj.value} />
                  <span className="flex-1 text-lg">
                    {proj.label}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.mortgage.propertyType")} required>
            <Select
              value={formData.propertyType}
              onValueChange={(value) => { updateFormData({ propertyType: value }); notify(); }}
            >
              <SelectTrigger className="h-14 text-lg">
                <SelectValue placeholder={t("forms.mortgage.selectPropertyType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">{t("forms.mortgage.propertyTypes.apartment")}</SelectItem>
                <SelectItem value="house">{t("forms.mortgage.propertyTypes.house")}</SelectItem>
                <SelectItem value="building">{t("forms.mortgage.propertyTypes.building")}</SelectItem>
                <SelectItem value="other">{t("forms.mortgage.propertyTypes.other")}</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 2: Property Details */}
      <FormStep isActive={currentStep === 2}>
        <div className="space-y-4">
          <FormFieldWrapper label={t("forms.mortgage.propertyValue")} htmlFor="propertyValue" required>
            <Input
              id="propertyValue"
              type="text"
              value={formData.propertyValue}
              onChange={(e) => { updateFormData({ propertyValue: e.target.value }); }}
              placeholder="CHF 800'000"
              className="h-14 text-lg"
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.healthInsurance.canton")} required>
            <Select
              value={formData.canton}
              onValueChange={(value) => { updateFormData({ canton: value }); notify(); }}
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

          <FormFieldWrapper label={t("forms.mortgage.commune")} htmlFor="commune">
            <Input
              id="commune"
              value={formData.commune}
              onChange={(e) => { updateFormData({ commune: e.target.value }); }}
              placeholder="Lausanne, Genève..."
              className="h-14 text-lg"
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.mortgage.numberOfBorrowers")} required>
            <RadioGroup
              value={formData.numberOfBorrowers}
              onValueChange={(value) => { updateFormData({ numberOfBorrowers: value }); notify(); }}
              className="flex gap-4"
            >
              <label htmlFor="borrowers-1" className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="1" id="borrowers-1" />
                <span className="text-lg">1 {t("forms.mortgage.person")}</span>
              </label>
              <label htmlFor="borrowers-2" className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="2" id="borrowers-2" />
                <span className="text-lg">2 {t("forms.mortgage.persons")}</span>
              </label>
            </RadioGroup>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 3: Financial Situation */}
      <FormStep isActive={currentStep === 3}>
        <div className="space-y-4">
          <FormFieldWrapper label={t("forms.mortgage.professionalStatus")} required>
            <Select
              value={formData.professionalStatus}
              onValueChange={(value) => { updateFormData({ professionalStatus: value }); notify(); }}
            >
              <SelectTrigger className="h-14 text-lg">
                <SelectValue placeholder={t("forms.pillar3.selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">{t("forms.pillar3.status.employee")}</SelectItem>
                <SelectItem value="self-employed">{t("forms.pillar3.status.selfEmployed")}</SelectItem>
                <SelectItem value="executive">{t("forms.pillar3.status.executive")}</SelectItem>
                <SelectItem value="retired">{t("forms.mortgage.status.retired")}</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.mortgage.incomeRange")} required>
            <Select
              value={formData.incomeRange}
              onValueChange={(value) => { updateFormData({ incomeRange: value }); notify(); }}
            >
              <SelectTrigger className="h-9 md:h-14 text-sm md:text-lg">
                <SelectValue placeholder={t("forms.pillar3.selectIncome")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-50000">&lt; CHF 50'000</SelectItem>
                <SelectItem value="50000-80000">CHF 50'000 - 80'000</SelectItem>
                <SelectItem value="80000-120000">CHF 80'000 - 120'000</SelectItem>
                <SelectItem value="120000-150000">CHF 120'000 - 150'000</SelectItem>
                <SelectItem value="150000-200000">CHF 150'000 - 200'000</SelectItem>
                <SelectItem value="200000-300000">CHF 200'000 - 300'000</SelectItem>
                <SelectItem value="300000+">&gt; CHF 300'000</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.mortgage.ownFundsRange")} required>
            <Select
              value={formData.ownFundsRange}
              onValueChange={(value) => { updateFormData({ ownFundsRange: value }); }}
            >
              <SelectTrigger className="h-9 md:h-14 text-sm md:text-lg">
                <SelectValue placeholder={t("forms.mortgage.selectOwnFunds")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-50000">&lt; CHF 50'000</SelectItem>
                <SelectItem value="50000-100000">CHF 50'000 - 100'000</SelectItem>
                <SelectItem value="100000-200000">CHF 100'000 - 200'000</SelectItem>
                <SelectItem value="200000-300000">CHF 200'000 - 300'000</SelectItem>
                <SelectItem value="300000-500000">CHF 300'000 - 500'000</SelectItem>
                <SelectItem value="500000+">&gt; CHF 500'000</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <FormFieldWrapper label={t("forms.contact.firstName")} htmlFor="firstName" required>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => { updateFormData({ firstName: e.target.value }); }}
                className="h-9 md:h-14 text-sm md:text-lg"
              />
            </FormFieldWrapper>
            <FormFieldWrapper label={t("forms.contact.lastName")} htmlFor="lastName" required>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => { updateFormData({ lastName: e.target.value }); }}
                className="h-9 md:h-14 text-sm md:text-lg"
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
              onChange={(e) => { updateFormData({ email: e.target.value }); }}
              className={cn("h-9 md:h-14 text-sm md:text-lg", stepErrors.email && "border-red-400")}
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.contact.phone")} htmlFor="phone" required error={stepErrors.phone}>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => { updateFormData({ phone: formatSwissPhone(e.target.value) }); }}
              placeholder="+41 79 123 45 67"
              className={cn("h-9 md:h-14 text-sm md:text-lg", stepErrors.phone && "border-red-400")}
            />
          </FormFieldWrapper>

          <div className="flex items-center gap-2 p-2.5 md:p-4 bg-muted/50 rounded-lg">
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
    </FormContainer>
  );
};

export default MortgageForm;
