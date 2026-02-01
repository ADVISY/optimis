import { useState } from "react";
import { useTranslation } from "react-i18next";
import FormContainer from "@/components/forms/FormContainer";
import FormStep from "@/components/forms/FormStep";
import FormNavigation from "@/components/forms/FormNavigation";
import FormFieldWrapper from "@/components/forms/FormField";
import Pillar3ComparisonResults from "@/components/forms/Pillar3ComparisonResults";
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
import { getMatchingProducts } from "@/data/pillar3aProducts";
import { calculateAllProjections, Pillar3aProjection } from "@/utils/pillar3aCalculations";
import { Lock, User, Phone } from "lucide-react";

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
  canton: string;
}

const TOTAL_STEPS = 5;

const Pillar3Form = () => {
  const { t } = useTranslation();
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"analyzing" | "comparing" | "preparing">("analyzing");
  const [projections, setProjections] = useState<Pillar3aProjection[]>([]);

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
    canton: "VD",
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
    
    // Calculate projections based on form data
    const matchingProducts = getMatchingProducts(formData.riskProfile, formData.objective);
    
    setTimeout(() => setLoadingStep("comparing"), 1000);
    
    const calculatedProjections = calculateAllProjections(matchingProducts, {
      age: formData.age,
      riskProfile: formData.riskProfile,
      savingsAmount: formData.savingsAmount,
      incomeRange: formData.incomeRange,
      objective: formData.objective,
      canton: formData.canton,
    });
    
    setTimeout(() => setLoadingStep("preparing"), 2000);
    
    await submitLead(formData as unknown as Record<string, unknown>);
    
    setTimeout(() => {
      setProjections(calculatedProjections);
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

  const handleSelectOffer = (projection: Pillar3aProjection) => {
    console.log("Selected offer:", projection);
  };

  const handleContactRequest = (projection: Pillar3aProjection, type: "call" | "email") => {
    console.log("Contact request:", projection.product.companyName, type);
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
        <Pillar3ComparisonResults
          projections={projections}
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
                <div key={obj.value} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={obj.value} id={obj.value} />
                  <Label htmlFor={obj.value} className="cursor-pointer flex-1 text-lg">
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
              className="h-14 text-lg"
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.pillar3.professionalStatus")} required>
            <Select
              value={formData.professionalStatus}
              onValueChange={(value) => updateFormData({ professionalStatus: value })}
            >
              <SelectTrigger className="h-14 text-lg">
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
              <SelectTrigger className="h-14 text-lg">
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
              <SelectTrigger className="h-14 text-lg">
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
              <SelectTrigger className="h-14 text-lg">
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
                <div key={risk.value} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={risk.value} id={risk.value} />
                  <Label htmlFor={risk.value} className="cursor-pointer flex-1 text-lg">
                    {risk.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 4: Identity */}
      <FormStep isActive={currentStep === 4}>
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
                onChange={(e) => updateFormData({ firstName: e.target.value })}
                className="h-12 md:h-14 text-base md:text-lg"
              />
            </FormFieldWrapper>
            <FormFieldWrapper label={t("forms.contact.lastName")} htmlFor="lastName" required>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateFormData({ lastName: e.target.value })}
                className="h-12 md:h-14 text-base md:text-lg"
              />
            </FormFieldWrapper>
          </div>
        </div>
      </FormStep>

      {/* Step 5: Contact */}
      <FormStep isActive={currentStep === 5}>
        <div className="space-y-6">
          <div className="text-center mb-4 md:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 mb-3 md:mb-4">
              <Phone className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold">{t("forms.contact.contactStepTitle")}</h3>
            <p className="text-sm md:text-base text-muted-foreground">{t("forms.contact.contactStepDescription")}</p>
          </div>

          <FormFieldWrapper label={t("forms.contact.email")} htmlFor="email" required>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              className="h-12 md:h-14 text-base md:text-lg"
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.contact.phone")} htmlFor="phone" required>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              placeholder="+41 79 123 45 67"
              className="h-12 md:h-14 text-base md:text-lg"
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
        canProceed={true}
      />
    </FormContainer>
  );
};

export default Pillar3Form;
