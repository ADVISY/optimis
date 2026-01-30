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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { swissCantons, getCantonName } from "@/data/swissCantons";
import { mockLegalProtectionOffers, InsuranceOffer } from "@/data/mockInsuranceData";

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
  canton: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

const TOTAL_STEPS = 4;

const ProfessionalInsuranceForm = () => {
  const { t, i18n } = useTranslation();
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"analyzing" | "comparing" | "preparing">("analyzing");

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
    canton: "",
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
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
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
            <div key={type.key} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
              <Checkbox
                id={type.key}
                checked={formData.insuranceTypes[type.key as keyof typeof formData.insuranceTypes]}
                onCheckedChange={(checked) =>
                  updateFormData({
                    insuranceTypes: { ...formData.insuranceTypes, [type.key]: checked as boolean },
                  })
                }
              />
              <Label htmlFor={type.key} className="cursor-pointer flex-1">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </FormStep>

      {/* Step 2: Company Info */}
      <FormStep isActive={currentStep === 2}>
        <div className="space-y-4">
          <FormFieldWrapper label={t("forms.professionalInsurance.activityType")} htmlFor="activityType" required>
            <Input
              id="activityType"
              value={formData.activityType}
              onChange={(e) => updateFormData({ activityType: e.target.value })}
              placeholder={t("forms.professionalInsurance.activityPlaceholder")}
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.professionalInsurance.legalForm")} required>
            <Select
              value={formData.legalForm}
              onValueChange={(value) => updateFormData({ legalForm: value })}
            >
              <SelectTrigger>
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
              onValueChange={(value) => updateFormData({ employeesCount: value })}
            >
              <SelectTrigger>
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

          <FormFieldWrapper label={t("forms.healthInsurance.canton")} htmlFor="canton" required>
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

      {/* Step 4: Message */}
      <FormStep isActive={currentStep === 4}>
        <div className="space-y-4">
          <FormFieldWrapper label={t("forms.professionalInsurance.message")} htmlFor="message">
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => updateFormData({ message: e.target.value })}
              placeholder={t("forms.professionalInsurance.messagePlaceholder")}
              rows={5}
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

export default ProfessionalInsuranceForm;
