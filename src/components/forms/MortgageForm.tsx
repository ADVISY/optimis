import { useState } from "react";
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
import { mockMortgageOffers, InsuranceOffer } from "@/data/mockInsuranceData";

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

const TOTAL_STEPS = 4;

const MortgageForm = () => {
  const { t, i18n } = useTranslation();
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"analyzing" | "comparing" | "preparing">("analyzing");

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
    setTimeout(() => setLoadingStep("comparing"), 1000);
    setTimeout(() => setLoadingStep("preparing"), 2000);
    await submitLead(formData as unknown as Record<string, unknown>);
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 3000);
  };

  const handleNext = () => {
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
          offers={mockMortgageOffers}
          onSelectOffer={handleSelectOffer}
          onContactRequest={handleContactRequest}
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
              onValueChange={(value) => updateFormData({ projectType: value })}
              className="grid gap-3"
            >
              {[
                { value: "acquisition", label: t("forms.mortgage.projects.acquisition") },
                { value: "renewal", label: t("forms.mortgage.projects.renewal") },
                { value: "refinancing", label: t("forms.mortgage.projects.refinancing") },
              ].map((proj) => (
                <div key={proj.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={proj.value} id={proj.value} />
                  <Label htmlFor={proj.value} className="cursor-pointer flex-1">
                    {proj.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.mortgage.propertyType")} required>
            <Select
              value={formData.propertyType}
              onValueChange={(value) => updateFormData({ propertyType: value })}
            >
              <SelectTrigger>
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
              onChange={(e) => updateFormData({ propertyValue: e.target.value })}
              placeholder="CHF 800'000"
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.healthInsurance.canton")} required>
            <Select
              value={formData.canton}
              onValueChange={(value) => updateFormData({ canton: value })}
            >
              <SelectTrigger>
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
              onChange={(e) => updateFormData({ commune: e.target.value })}
              placeholder="Lausanne, Genève..."
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.mortgage.numberOfBorrowers")} required>
            <RadioGroup
              value={formData.numberOfBorrowers}
              onValueChange={(value) => updateFormData({ numberOfBorrowers: value })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="borrowers-1" />
                <Label htmlFor="borrowers-1" className="cursor-pointer">1 {t("forms.mortgage.person")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="borrowers-2" />
                <Label htmlFor="borrowers-2" className="cursor-pointer">2 {t("forms.mortgage.persons")}</Label>
              </div>
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
              onValueChange={(value) => updateFormData({ professionalStatus: value })}
            >
              <SelectTrigger>
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
              onValueChange={(value) => updateFormData({ incomeRange: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("forms.pillar3.selectIncome")} />
              </SelectTrigger>
              <SelectContent>
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
              onValueChange={(value) => updateFormData({ ownFundsRange: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("forms.mortgage.selectOwnFunds")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100000-200000">CHF 100'000 - 200'000</SelectItem>
                <SelectItem value="200000-300000">CHF 200'000 - 300'000</SelectItem>
                <SelectItem value="300000-500000">CHF 300'000 - 500'000</SelectItem>
                <SelectItem value="500000+">&gt; CHF 500'000</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 4: Contact */}
      <FormStep isActive={currentStep === 4}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormFieldWrapper label={t("forms.contact.firstName")} htmlFor="firstName" required>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateFormData({ firstName: e.target.value })}
              />
            </FormFieldWrapper>
            <FormFieldWrapper label={t("forms.contact.lastName")} htmlFor="lastName" required>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateFormData({ lastName: e.target.value })}
              />
            </FormFieldWrapper>
          </div>

          <FormFieldWrapper label={t("forms.contact.email")} htmlFor="email" required>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.contact.phone")} htmlFor="phone" required>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              placeholder="+41 79 123 45 67"
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
        canProceed={true}
      />
    </FormContainer>
  );
};

export default MortgageForm;
