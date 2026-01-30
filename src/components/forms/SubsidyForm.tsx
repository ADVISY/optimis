import { useState } from "react";
import { useTranslation } from "react-i18next";
import FormContainer from "@/components/forms/FormContainer";
import FormStep from "@/components/forms/FormStep";
import FormNavigation from "@/components/forms/FormNavigation";
import FormFieldWrapper from "@/components/forms/FormField";
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
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubsidyFormData {
  canton: string;
  commune: string;
  householdSize: string;
  adultsCount: string;
  childrenCount: string;
  incomeRange: string;
  specialSituation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const TOTAL_STEPS = 3;

const SubsidyForm = () => {
  const { t, i18n } = useTranslation();
  const [showResults, setShowResults] = useState(false);
  const [isEligible, setIsEligible] = useState(false);

  const initialData: SubsidyFormData = {
    canton: "",
    commune: "",
    householdSize: "",
    adultsCount: "1",
    childrenCount: "0",
    incomeRange: "",
    specialSituation: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  };

  const { submitLead, isSubmitting } = useLeadSubmission({
    formType: "subsidy",
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
    await submitLead(formData as unknown as Record<string, unknown>);
    // Simple eligibility check based on income
    const incomeValue = formData.incomeRange;
    setIsEligible(["0-30000", "30000-50000", "50000-70000"].includes(incomeValue));
    setShowResults(true);
  };

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      nextStep();
    }
  };

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className={`inline-flex p-4 rounded-full ${isEligible ? 'bg-green-100' : 'bg-orange-100'}`}>
              <CheckCircle className={`h-12 w-12 ${isEligible ? 'text-green-600' : 'text-orange-600'}`} />
            </div>

            <h2 className="text-2xl font-bold">
              {isEligible 
                ? t("forms.subsidy.eligible")
                : t("forms.subsidy.maybeEligible")}
            </h2>

            <p className="text-muted-foreground">
              {isEligible
                ? t("forms.subsidy.eligibleDescription")
                : t("forms.subsidy.maybeEligibleDescription")}
            </p>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="font-medium mb-2">{t("forms.subsidy.estimatedAmount")}</p>
              <p className="text-3xl font-bold text-primary">
                CHF {isEligible ? "200 - 400" : "50 - 150"} / {t("forms.subsidy.perMonth")}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t("forms.subsidy.estimateNote")}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button className="gap-2">
                <FileText className="h-4 w-4" />
                {t("forms.subsidy.startApplication")}
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                {t("forms.subsidy.downloadGuide")}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              {t("forms.subsidy.contactNote")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <FormContainer
      title={t("forms.subsidy.title")}
      description={t("forms.subsidy.description")}
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
    >
      {/* Step 1: Location & Household */}
      <FormStep isActive={currentStep === 1}>
        <div className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <FormFieldWrapper label={t("forms.subsidy.adultsCount")} htmlFor="adultsCount">
              <Select
                value={formData.adultsCount}
                onValueChange={(value) => updateFormData({ adultsCount: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4+"].map((num) => (
                    <SelectItem key={num} value={num}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormFieldWrapper>

            <FormFieldWrapper label={t("forms.subsidy.childrenCount")} htmlFor="childrenCount">
              <Select
                value={formData.childrenCount}
                onValueChange={(value) => updateFormData({ childrenCount: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["0", "1", "2", "3", "4+"].map((num) => (
                    <SelectItem key={num} value={num}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormFieldWrapper>
          </div>
        </div>
      </FormStep>

      {/* Step 2: Income & Situation */}
      <FormStep isActive={currentStep === 2}>
        <div className="space-y-4">
          <FormFieldWrapper label={t("forms.subsidy.incomeRange")} required>
            <Select
              value={formData.incomeRange}
              onValueChange={(value) => updateFormData({ incomeRange: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("forms.subsidy.selectIncome")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-30000">&lt; CHF 30'000</SelectItem>
                <SelectItem value="30000-50000">CHF 30'000 - 50'000</SelectItem>
                <SelectItem value="50000-70000">CHF 50'000 - 70'000</SelectItem>
                <SelectItem value="70000-100000">CHF 70'000 - 100'000</SelectItem>
                <SelectItem value="100000+">&gt; CHF 100'000</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.subsidy.specialSituation")}>
            <RadioGroup
              value={formData.specialSituation}
              onValueChange={(value) => updateFormData({ specialSituation: value })}
              className="grid gap-3"
            >
              {[
                { value: "none", label: t("forms.subsidy.situations.none") },
                { value: "avs", label: t("forms.subsidy.situations.avs") },
                { value: "ai", label: t("forms.subsidy.situations.ai") },
                { value: "student", label: t("forms.subsidy.situations.student") },
                { value: "unemployed", label: t("forms.subsidy.situations.unemployed") },
              ].map((situation) => (
                <div key={situation.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={situation.value} id={situation.value} />
                  <Label htmlFor={situation.value} className="cursor-pointer flex-1">
                    {situation.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 3: Contact */}
      <FormStep isActive={currentStep === 3}>
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

export default SubsidyForm;
