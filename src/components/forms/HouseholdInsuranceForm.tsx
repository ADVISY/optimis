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
import { mockHouseholdInsuranceOffers, InsuranceOffer } from "@/data/mockInsuranceData";

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

const TOTAL_STEPS = 3;

const HouseholdInsuranceForm = () => {
  const { t, i18n } = useTranslation();
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"analyzing" | "comparing" | "preparing">("analyzing");

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
                <div key={type.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <Label htmlFor={type.value} className="cursor-pointer flex-1">
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.householdInsurance.ownershipStatus")} required>
            <RadioGroup
              value={formData.ownershipStatus}
              onValueChange={(value) => updateFormData({ ownershipStatus: value })}
              className="grid grid-cols-2 gap-3"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="tenant" id="tenant" />
                <Label htmlFor="tenant" className="cursor-pointer">
                  {t("forms.householdInsurance.tenant")}
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="owner" id="owner" />
                <Label htmlFor="owner" className="cursor-pointer">
                  {t("forms.householdInsurance.owner")}
                </Label>
              </div>
            </RadioGroup>
          </FormFieldWrapper>

          <div className="grid grid-cols-2 gap-4">
            <FormFieldWrapper label={t("forms.householdInsurance.livingSpace")} htmlFor="livingSpace">
              <Input
                id="livingSpace"
                type="number"
                value={formData.livingSpace}
                onChange={(e) => updateFormData({ livingSpace: e.target.value })}
                placeholder="80 m²"
              />
            </FormFieldWrapper>

            <FormFieldWrapper label={t("forms.householdInsurance.numberOfRooms")} htmlFor="numberOfRooms">
              <Select
                value={formData.numberOfRooms}
                onValueChange={(value) => updateFormData({ numberOfRooms: value })}
              >
                <SelectTrigger>
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

          <FormFieldWrapper label={t("forms.healthInsurance.postalCode")} htmlFor="postalCode">
            <Input
              id="postalCode"
              type="text"
              maxLength={4}
              value={formData.postalCode}
              onChange={(e) => updateFormData({ postalCode: e.target.value })}
              placeholder="1000"
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.householdInsurance.propertyValue")} htmlFor="propertyValue" required>
            <Select
              value={formData.propertyValue}
              onValueChange={(value) => updateFormData({ propertyValue: value })}
            >
              <SelectTrigger>
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

export default HouseholdInsuranceForm;
