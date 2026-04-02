import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import FormContainer from "@/components/forms/FormContainer";
import FormStep from "@/components/forms/FormStep";
import FormNavigation from "@/components/forms/FormNavigation";
import FormFieldWrapper from "@/components/forms/FormField";
import Pillar3ComparisonResults from "@/components/forms/Pillar3ComparisonResults";
import LoadingComparison from "@/components/forms/LoadingComparison";
import FormThankYouScreen from "@/components/forms/FormThankYouScreen";
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
import { useFormValidation } from "@/hooks/useFormValidation";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";
import { cn } from "@/lib/utils";

interface Pillar3FormData {
  hasExistingPillar3: boolean | null;
  existingProvider: string;
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

const TOTAL_STEPS = 6;

const Pillar3Form = () => {
  const { t, i18n } = useTranslation();
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"analyzing" | "comparing" | "preparing">("analyzing");
  const [projections, setProjections] = useState<Pillar3aProjection[]>([]);
  const { attemptedNext, markAttempted, resetAttempted, formatSwissPhone, isValidEmail, isValidPhone, getContactErrors, getIdentityErrors, showValidationToast } = useFormValidation();

  const initialData: Pillar3FormData = {
    hasExistingPillar3: null,
    existingProvider: "",
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
    webhookUrl: "https://hooks.zapier.com/hooks/catch/21326682/unuyz9t/",
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

  // Helper function to get translated boolean
  const getBooleanLabel = (value: boolean): string => {
    const yes: Record<string, string> = { fr: "Oui", de: "Ja", it: "Sì" };
    const no: Record<string, string> = { fr: "Non", de: "Nein", it: "No" };
    return value ? (yes[i18n.language] || yes.fr) : (no[i18n.language] || no.fr);
  };

  // Helper function to get translated labels for lead submission
  // Labels are sent in the language the user filled out the form
  const getTranslatedFormData = () => {
    const objectiveLabels: Record<string, Record<string, string>> = {
      tax: { fr: "Économies d'impôts", de: "Steuerersparnis", it: "Risparmio fiscale" },
      retirement: { fr: "Préparation retraite", de: "Altersvorsorge", it: "Previdenza pensionistica" },
      protection: { fr: "Protection famille", de: "Familienschutz", it: "Protezione famiglia" },
      mix: { fr: "Objectif mixte", de: "Gemischtes Ziel", it: "Obiettivo misto" },
    };

    const statusLabels: Record<string, Record<string, string>> = {
      employee: { fr: "Employé(e)", de: "Angestellt", it: "Dipendente" },
      "self-employed": { fr: "Indépendant(e)", de: "Selbstständig", it: "Lavoratore autonomo" },
      executive: { fr: "Cadre dirigeant", de: "Führungskraft", it: "Dirigente" },
      student: { fr: "Étudiant(e)", de: "Student(in)", it: "Studente" },
    };

    const incomeLabels: Record<string, string> = {
      "0-50000": "< CHF 50'000",
      "50000-80000": "CHF 50'000 – 80'000",
      "80000-120000": "CHF 80'000 – 120'000",
      "120000-200000": "CHF 120'000 – 200'000",
      "200000+": "> CHF 200'000",
    };

    const savingsLabels: Record<string, Record<string, string>> = {
      "100-300": { fr: "CHF 100 – 300 / mois", de: "CHF 100 – 300 / Monat", it: "CHF 100 – 300 / mese" },
      "300-500": { fr: "CHF 300 – 500 / mois", de: "CHF 300 – 500 / Monat", it: "CHF 300 – 500 / mese" },
      "500-max": { fr: "CHF 500 – max / mois", de: "CHF 500 – max / Monat", it: "CHF 500 – max / mese" },
    };

    const horizonLabels: Record<string, Record<string, string>> = {
      "5-10": { fr: "5 – 10 ans", de: "5 – 10 Jahre", it: "5 – 10 anni" },
      "10-20": { fr: "10 – 20 ans", de: "10 – 20 Jahre", it: "10 – 20 anni" },
      "20-30": { fr: "20 – 30 ans", de: "20 – 30 Jahre", it: "20 – 30 anni" },
      "30+": { fr: "30+ ans", de: "30+ Jahre", it: "30+ anni" },
    };

    const riskLabels: Record<string, Record<string, string>> = {
      conservative: { fr: "Conservateur", de: "Konservativ", it: "Conservativo" },
      moderate: { fr: "Modéré", de: "Moderat", it: "Moderato" },
      dynamic: { fr: "Dynamique", de: "Dynamisch", it: "Dinamico" },
      aggressive: { fr: "Offensif", de: "Offensiv", it: "Offensivo" },
    };

    const lang = i18n.language as "fr" | "de" | "it";

    return {
      ...formData,
      hasExistingPillar3: getBooleanLabel(formData.hasExistingPillar3 === true),
      existingProvider: formData.existingProvider || "-",
      objective: objectiveLabels[formData.objective]?.[lang] || formData.objective,
      professionalStatus: statusLabels[formData.professionalStatus]?.[lang] || formData.professionalStatus,
      incomeRange: incomeLabels[formData.incomeRange] || formData.incomeRange,
      savingsAmount: savingsLabels[formData.savingsAmount]?.[lang] || formData.savingsAmount,
      investmentHorizon: horizonLabels[formData.investmentHorizon]?.[lang] || formData.investmentHorizon,
      riskProfile: riskLabels[formData.riskProfile]?.[lang] || formData.riskProfile,
    };
  };

  const [showThankYou, setShowThankYou] = useState(false);
  const [pendingProjections, setPendingProjections] = useState<Pillar3aProjection[]>([]);

  const handleSubmit = async () => {
    // Calculate projections
    const matchingProducts = getMatchingProducts(formData.riskProfile, formData.objective);
    const calculatedProjections = calculateAllProjections(matchingProducts, {
      age: formData.age,
      riskProfile: formData.riskProfile,
      savingsAmount: formData.savingsAmount,
      incomeRange: formData.incomeRange,
      objective: formData.objective,
      canton: formData.canton,
    });
    setPendingProjections(calculatedProjections);

    await submitLead(getTranslatedFormData() as unknown as Record<string, unknown>);
    setShowThankYou(true);
  };

  const handleDiscoverResults = () => {
    setShowThankYou(false);
    setIsLoading(true);
    setLoadingStep("analyzing");
    setTimeout(() => setLoadingStep("comparing"), 800);
    setTimeout(() => {
      setLoadingStep("preparing");
      setProjections(pendingProjections);
    }, 1600);
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 2400);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: return formData.hasExistingPillar3 !== null && formData.objective !== "";
      case 2: return formData.age !== "" && formData.professionalStatus !== "" && formData.incomeRange !== "";
      case 3: return formData.savingsAmount !== "" && formData.investmentHorizon !== "";
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
      {/* Step 1: Existing Pillar 3 + Objective */}
      <FormStep isActive={currentStep === 1}>
        <div className="space-y-4 md:space-y-6">
          <FormFieldWrapper label={t("forms.pillar3.hasExistingPillar3")} required>
            <RadioGroup
              value={formData.hasExistingPillar3 === null ? "" : formData.hasExistingPillar3 ? "yes" : "no"}
              onValueChange={(value) => updateFormData({ 
                hasExistingPillar3: value === "yes",
                existingProvider: value === "no" ? "" : formData.existingProvider
              })}
              className="grid grid-cols-2 gap-3"
            >
              <label htmlFor="hasPillar3-yes" className="flex items-center space-x-2 p-3 md:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="yes" id="hasPillar3-yes" />
                <span className="flex-1 text-sm md:text-lg">
                  {t("common.yes")}
                </span>
              </label>
              <label htmlFor="hasPillar3-no" className="flex items-center space-x-2 p-3 md:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="no" id="hasPillar3-no" />
                <span className="flex-1 text-sm md:text-lg">
                  {t("common.no")}
                </span>
              </label>
            </RadioGroup>
          </FormFieldWrapper>

          {formData.hasExistingPillar3 === true && (
            <FormFieldWrapper label={t("forms.pillar3.existingProvider")} htmlFor="existingProvider">
              <Select
                value={formData.existingProvider}
                onValueChange={(value) => { updateFormData({ existingProvider: value }); notify(); }}
              >
                <SelectTrigger className="h-11 md:h-14 text-sm md:text-lg">
                  <SelectValue placeholder={t("forms.pillar3.selectProvider")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viac">VIAC</SelectItem>
                  <SelectItem value="frankly">Frankly</SelectItem>
                  <SelectItem value="finpension">Finpension</SelectItem>
                  <SelectItem value="postfinance">PostFinance</SelectItem>
                  <SelectItem value="ubs">UBS</SelectItem>
                  <SelectItem value="credit-suisse">Credit Suisse</SelectItem>
                  <SelectItem value="raiffeisen">Raiffeisen</SelectItem>
                  <SelectItem value="zurich">Zurich</SelectItem>
                  <SelectItem value="axa">AXA</SelectItem>
                  <SelectItem value="swiss-life">Swiss Life</SelectItem>
                  <SelectItem value="other">{t("forms.pillar3.otherProvider")}</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldWrapper>
          )}

          <FormFieldWrapper label={t("forms.pillar3.objective")} required>
            <RadioGroup
              value={formData.objective}
              onValueChange={(value) => { updateFormData({ objective: value }); notify(); }}
              className="grid gap-3"
            >
              {[
                { value: "tax", label: t("forms.pillar3.objectives.tax") },
                { value: "retirement", label: t("forms.pillar3.objectives.retirement") },
                { value: "protection", label: t("forms.pillar3.objectives.protection") },
                { value: "mix", label: t("forms.pillar3.objectives.mix") },
              ].map((obj) => (
                <label key={obj.value} htmlFor={obj.value} className="flex items-center space-x-2 p-3 md:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value={obj.value} id={obj.value} />
                  <span className="flex-1 text-sm md:text-lg">
                    {obj.label}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 2: Profile */}
      <FormStep isActive={currentStep === 2}>
        <div className="space-y-3 md:space-y-4">
          <FormFieldWrapper label={t("forms.pillar3.age")} htmlFor="age" required>
            <Input
              id="age"
              type="number"
              min="18"
              max="65"
              value={formData.age}
              onChange={(e) => { updateFormData({ age: e.target.value }); notifyDelayed(); }}
              placeholder="35"
              className="h-11 md:h-14 text-sm md:text-lg"
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.pillar3.professionalStatus")} required>
            <Select
              value={formData.professionalStatus}
              onValueChange={(value) => { updateFormData({ professionalStatus: value }); notify(); }}
            >
              <SelectTrigger className="h-11 md:h-14 text-sm md:text-lg">
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
              onValueChange={(value) => { updateFormData({ incomeRange: value }); notify(); }}
            >
              <SelectTrigger className="h-11 md:h-14 text-sm md:text-lg">
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
        <div className="space-y-4 md:space-y-6">
          <FormFieldWrapper label={t("forms.pillar3.savingsAmount")} required>
            <Select
              value={formData.savingsAmount}
              onValueChange={(value) => { updateFormData({ savingsAmount: value }); notify(); }}
            >
              <SelectTrigger className="h-11 md:h-14 text-sm md:text-lg">
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
              onValueChange={(value) => { updateFormData({ investmentHorizon: value }); notify(); }}
            >
              <SelectTrigger className="h-11 md:h-14 text-sm md:text-lg">
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
              onValueChange={(value) => { updateFormData({ riskProfile: value }); notify(); }}
              className="grid gap-2 md:gap-3"
            >
              {[
                { value: "conservative", label: t("forms.pillar3.risks.conservative") },
                { value: "moderate", label: t("forms.pillar3.risks.moderate") },
                { value: "dynamic", label: t("forms.pillar3.risks.dynamic") },
                { value: "aggressive", label: t("forms.pillar3.risks.aggressive") },
              ].map((risk) => (
                <label key={risk.value} htmlFor={risk.value} className="flex items-center space-x-2 p-3 md:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value={risk.value} id={risk.value} />
                  <span className="flex-1 text-sm md:text-lg">
                    {risk.label}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 4: Identity */}
      <FormStep isActive={currentStep === 4}>
        <div className="space-y-4 md:space-y-6">
          <div className="text-center mb-3 md:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 mb-2 md:mb-4">
              <User className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h3 className="text-base md:text-xl font-semibold">{t("forms.contact.almostDone")}</h3>
            <p className="text-sm md:text-base text-muted-foreground">{t("forms.contact.nameStepDescription")}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
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
        <div className="space-y-4 md:space-y-6">
          <div className="text-center mb-3 md:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 mb-2 md:mb-4">
              <Phone className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h3 className="text-base md:text-xl font-semibold">{t("forms.contact.contactStepTitle")}</h3>
            <p className="text-sm md:text-base text-muted-foreground">{t("forms.contact.contactStepDescription")}</p>
          </div>

          <FormFieldWrapper label={t("forms.contact.email")} htmlFor="email" required error={stepErrors.email}>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => { updateFormData({ email: e.target.value }); notifyDelayed(); }}
              className={cn("h-11 md:h-14 text-sm md:text-lg", stepErrors.email && "border-red-400")}
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
              className={cn("h-11 md:h-14 text-sm md:text-lg", stepErrors.phone && "border-red-400")}
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
        canProceed={canProceed}
      />
    </FormContainer>
  );
};

export default Pillar3Form;
