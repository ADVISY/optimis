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
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockPillar3Offers, InsuranceOffer } from "@/data/mockInsuranceData";

interface Pillar3FormData {
  objective: string;
  age: string;
  professionalStatus: string;
  incomeRange: string;
  savingsAmount: string;
  investmentHorizon: string;
  riskProfile: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const TOTAL_STEPS = 4;

const Pillar3Form = () => {
  const { t } = useTranslation();
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"analyzing" | "comparing" | "preparing">("analyzing");

  const initialData: Pillar3FormData = {
    objective: "",
    age: "",
    professionalStatus: "",
    incomeRange: "",
    savingsAmount: "",
    investmentHorizon: "",
    riskProfile: "moderate",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  };

  const { submitLead, isSubmitting } = useLeadSubmission({
    formType: "pillar-3a",
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
          offers={mockPillar3Offers}
          onSelectOffer={handleSelectOffer}
          onContactRequest={handleContactRequest}
        />
      </div>
    );
  }

  return (
    <FormContainer
      title={t("forms.pillar3.title")}
      description={t("forms.pillar3.description")}
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
    >
      {/* Step 1: Objective */}
      <FormStep isActive={currentStep === 1}>
        <div className="space-y-6">
          <FormFieldWrapper label={t("forms.pillar3.objective")} required>
            <RadioGroup
              value={formData.objective}
              onValueChange={(value) => updateFormData({ objective: value })}
              className="grid gap-3"
            >
              {[
                { value: "tax", label: t("forms.pillar3.objectives.tax") },
                { value: "retirement", label: t("forms.pillar3.objectives.retirement") },
                { value: "protection", label: t("forms.pillar3.objectives.protection") },
                { value: "mix", label: t("forms.pillar3.objectives.mix") },
              ].map((obj) => (
                <div key={obj.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={obj.value} id={obj.value} />
                  <Label htmlFor={obj.value} className="cursor-pointer flex-1">
                    {obj.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 2: Profile */}
      <FormStep isActive={currentStep === 2}>
        <div className="space-y-4">
          <FormFieldWrapper label={t("forms.pillar3.age")} htmlFor="age" required>
            <Input
              id="age"
              type="number"
              min="18"
              max="65"
              value={formData.age}
              onChange={(e) => updateFormData({ age: e.target.value })}
              placeholder="35"
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.pillar3.professionalStatus")} required>
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
                <SelectItem value="student">{t("forms.pillar3.status.student")}</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.pillar3.incomeRange")} required>
            <Select
              value={formData.incomeRange}
              onValueChange={(value) => updateFormData({ incomeRange: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("forms.pillar3.selectIncome")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-50000">&lt; CHF 50'000</SelectItem>
                <SelectItem value="50000-80000">CHF 50'000 - 80'000</SelectItem>
                <SelectItem value="80000-120000">CHF 80'000 - 120'000</SelectItem>
                <SelectItem value="120000-200000">CHF 120'000 - 200'000</SelectItem>
                <SelectItem value="200000+">&gt; CHF 200'000</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 3: Investment */}
      <FormStep isActive={currentStep === 3}>
        <div className="space-y-6">
          <FormFieldWrapper label={t("forms.pillar3.savingsAmount")} required>
            <Select
              value={formData.savingsAmount}
              onValueChange={(value) => updateFormData({ savingsAmount: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("forms.pillar3.selectAmount")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100-300">CHF 100 - 300 / {t("forms.pillar3.perMonth")}</SelectItem>
                <SelectItem value="300-500">CHF 300 - 500 / {t("forms.pillar3.perMonth")}</SelectItem>
                <SelectItem value="500-max">CHF 500 - max ({t("forms.pillar3.maxAmount")})</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.pillar3.investmentHorizon")} required>
            <Select
              value={formData.investmentHorizon}
              onValueChange={(value) => updateFormData({ investmentHorizon: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("forms.pillar3.selectHorizon")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5-10">5-10 {t("forms.pillar3.years")}</SelectItem>
                <SelectItem value="10-20">10-20 {t("forms.pillar3.years")}</SelectItem>
                <SelectItem value="20-30">20-30 {t("forms.pillar3.years")}</SelectItem>
                <SelectItem value="30+">30+ {t("forms.pillar3.years")}</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.pillar3.riskProfile")} required>
            <RadioGroup
              value={formData.riskProfile}
              onValueChange={(value) => updateFormData({ riskProfile: value })}
              className="grid gap-3"
            >
              {[
                { value: "conservative", label: t("forms.pillar3.risks.conservative") },
                { value: "moderate", label: t("forms.pillar3.risks.moderate") },
                { value: "dynamic", label: t("forms.pillar3.risks.dynamic") },
                { value: "aggressive", label: t("forms.pillar3.risks.aggressive") },
              ].map((risk) => (
                <div key={risk.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={risk.value} id={risk.value} />
                  <Label htmlFor={risk.value} className="cursor-pointer flex-1">
                    {risk.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
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

export default Pillar3Form;
