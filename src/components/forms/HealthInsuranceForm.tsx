import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import FormContainer from "@/components/forms/FormContainer";
import FormStep from "@/components/forms/FormStep";
import FormNavigation from "@/components/forms/FormNavigation";
import FormFieldWrapper from "@/components/forms/FormField";
import HealthComparisonResults from "@/components/forms/HealthComparisonResults";
import LoadingComparison from "@/components/forms/LoadingComparison";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { useLeadSubmission } from "@/hooks/useLeadSubmission";
import { useToast } from "@/hooks/use-toast";
import { useHealthPremiums, premiumToInsuranceOffer } from "@/hooks/useHealthPremiums";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { swissCantons, getCantonName } from "@/data/swissCantons";
import { InsuranceOffer } from "@/data/mockInsuranceData";
import { Button } from "@/components/ui/button";
import DateInput from "@/components/ui/date-input";
import { Card, CardContent } from "@/components/ui/card";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";

interface HealthInsuranceFormData {
  hasCurrentInsurance: boolean | null;
  currentInsurer: string;
  familySituation: string;
  birthDate: Date | null;
  canton: string;
  postalCode: string;
  lamalModel: string;
  franchise: number;
  accidentCoverage: boolean;
  complementaryTier: "basic" | "premium" | "diamond" | null;
  complementary: {
    dental: boolean;
    hospitalization: boolean;
    glasses: boolean;
    alternativeMedicine: boolean;
    worldwide: boolean;
  };
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  availability: string;
}

const TOTAL_STEPS = 7;

const HealthInsuranceForm = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"analyzing" | "comparing" | "preparing">("analyzing");
  const [realOffers, setRealOffers] = useState<InsuranceOffer[]>([]);
  
  const { fetchPremiums, error: premiumsError } = useHealthPremiums();


  const initialData: HealthInsuranceFormData = {
    hasCurrentInsurance: null,
    currentInsurer: "",
    familySituation: "",
    birthDate: null,
    canton: "",
    postalCode: "",
    lamalModel: "standard",
    franchise: 2500,
    accidentCoverage: true,
    complementaryTier: null,
    complementary: {
      dental: false,
      hospitalization: false,
      glasses: false,
      alternativeMedicine: false,
      worldwide: false,
    },
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    availability: "",
  };

  const { submitLead, isSubmitting } = useLeadSubmission({
    formType: "health-insurance",
    webhookUrl: "https://hooks.zapier.com/hooks/catch/21326682/uebsy69/",
  });

  const {
    currentStep,
    formData,
    isLastStep,
    updateFormData,
    nextStep,
    previousStep,
    errors,
  } = useMultiStepForm({
    initialData,
    totalSteps: TOTAL_STEPS,
    onSubmit: async (data) => {
      await submitLead(data as unknown as Record<string, unknown>);
    },
  });

  // Helper function to get translated LAMal model label
  const getLamalModelLabel = (model: string): string => {
    const labels: Record<string, Record<string, string>> = {
      standard: { fr: "Standard", de: "Standard", it: "Standard" },
      "family-doctor": { fr: "Médecin de famille", de: "Hausarztmodell", it: "Medico di famiglia" },
      hmo: { fr: "HMO", de: "HMO", it: "HMO" },
      telemed: { fr: "Télémédecine", de: "Telemedizin", it: "Telemedicina" },
    };
    return labels[model]?.[i18n.language] || labels[model]?.fr || model;
  };

  // Helper function to get translated complementary tier label
  const getComplementaryTierLabel = (tier: string | null): string => {
    if (!tier) {
      const none: Record<string, string> = { fr: "Aucune", de: "Keine", it: "Nessuna" };
      return none[i18n.language] || none.fr;
    }
    const labels: Record<string, Record<string, string>> = {
      basic: { fr: "Basic", de: "Basic", it: "Basic" },
      premium: { fr: "Premium", de: "Premium", it: "Premium" },
      diamond: { fr: "Diamond", de: "Diamond", it: "Diamond" },
    };
    return labels[tier]?.[i18n.language] || labels[tier]?.fr || tier;
  };

  // Helper function to get translated boolean
  const getBooleanLabel = (value: boolean): string => {
    const yes: Record<string, string> = { fr: "Oui", de: "Ja", it: "Sì" };
    const no: Record<string, string> = { fr: "Non", de: "Nein", it: "No" };
    return value ? (yes[i18n.language] || yes.fr) : (no[i18n.language] || no.fr);
  };

  // Helper function to get translated family situation label
  const getFamilySituationLabel = (situation: string): string => {
    const labels: Record<string, Record<string, string>> = {
      single: { fr: "Seul(e)", de: "Allein", it: "Single" },
      couple: { fr: "Couple", de: "Paar", it: "Coppia" },
      coupleWithChildren: { fr: "Couple avec enfants", de: "Paar mit Kindern", it: "Coppia con figli" },
      singleWithChildren: { fr: "Seul(e) avec enfants", de: "Alleinerziehend", it: "Single con figli" },
    };
    return labels[situation]?.[i18n.language] || labels[situation]?.fr || situation;
  };

  // Prepare lead data with translated labels
  const prepareLeadData = () => {
    const birthDate = formData.birthDate 
      ? formData.birthDate.toLocaleDateString(i18n.language === 'de' ? 'de-CH' : i18n.language === 'it' ? 'it-CH' : 'fr-CH')
      : "";
    
    // Get complementary options as readable list
    const complementaryOptions: string[] = [];
    if (formData.complementary.dental) complementaryOptions.push(t("forms.healthInsurance.complementary.dental"));
    if (formData.complementary.hospitalization) complementaryOptions.push(t("forms.healthInsurance.complementary.hospitalization"));
    if (formData.complementary.glasses) complementaryOptions.push(t("forms.healthInsurance.complementary.glasses"));
    if (formData.complementary.alternativeMedicine) complementaryOptions.push(t("forms.healthInsurance.complementary.alternativeMedicine"));
    if (formData.complementary.worldwide) complementaryOptions.push(t("forms.healthInsurance.complementary.worldwide"));

    return {
      // Contact info
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      // Location
      canton: formData.canton,
      postalCode: formData.postalCode,
      // Insurance details with translated labels
      hasCurrentInsurance: getBooleanLabel(formData.hasCurrentInsurance === true),
      currentInsurer: formData.currentInsurer || "-",
      familySituation: getFamilySituationLabel(formData.familySituation),
      birthDate,
      lamalModel: getLamalModelLabel(formData.lamalModel),
      franchise: `CHF ${formData.franchise}`,
      accidentCoverage: getBooleanLabel(formData.accidentCoverage),
      complementaryTier: getComplementaryTierLabel(formData.complementaryTier),
      complementaryOptions: complementaryOptions.length > 0 ? complementaryOptions.join(", ") : getBooleanLabel(false),
    };
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setLoadingStep("analyzing");

    // Calculate birth year from birth date
    const birthYear = formData.birthDate 
      ? formData.birthDate.getFullYear() 
      : 1990; // Fallback for testing

    // Validate canton
    if (!formData.canton) {
      console.error("Canton is required");
      setIsLoading(false);
      return;
    }

    console.log("Fetching premiums with:", {
      canton: formData.canton,
      birthYear,
      franchise: formData.franchise,
      model: formData.lamalModel,
    });

    setTimeout(() => setLoadingStep("comparing"), 1000);

    // Fetch real premiums from OFSP API
    const premiums = await fetchPremiums({
      canton: formData.canton,
      postalCode: formData.postalCode,
      birthYear,
      franchise: formData.franchise,
      model: formData.lamalModel,
      withAccident: formData.accidentCoverage,
      language: i18n.language,
    });

    console.log("Received premiums:", premiums.length);

    setLoadingStep("preparing");

    // Convert premiums to InsuranceOffer format
    const offers = premiums.map((premium, index) => 
      premiumToInsuranceOffer(premium, index)
    );
    
    setRealOffers(offers);

    // Submit lead with translated labels
    const leadData = prepareLeadData();
    await submitLead(leadData);

    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 500);
  };

  // Validation function for each step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // Must answer hasCurrentInsurance question
        return formData.hasCurrentInsurance !== null;
      case 2:
        // Must select family situation AND provide birth date
        return formData.familySituation !== "" && formData.birthDate !== null;
      case 3:
        // Must select canton + valid postal code (4 digits)
        return formData.canton !== "" && formData.postalCode.replace(/\D/g, '').length >= 4;
      case 4:
        // LAMal model and franchise have defaults, always valid
        return formData.lamalModel !== "";
      case 5:
        // Complementary is optional, always valid
        return true;
      case 6:
        // Must provide first and last name
        return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
      case 7:
        // Must provide valid email and phone
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneValid = formData.phone.replace(/\s/g, '').length >= 10;
        return emailRegex.test(formData.email.trim()) && phoneValid;
      default:
        return true;
    }
  };

  const canProceed = validateStep(currentStep);
  const { notify, notifyDelayed } = useAutoAdvance(currentStep, nextStep, canProceed, isLastStep, handleSubmit);

  const [attemptedNext, setAttemptedNext] = useState(false);

  // Get validation error messages for current step (only shown after user tries to advance)
  const getStepErrors = (step: number): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (step === 7) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
        errs.email = t("forms.validation.invalidEmail", "Adresse email non valide");
      }
      const phoneDigits = formData.phone.replace(/\s/g, '');
      if (!formData.phone.trim() || phoneDigits.length < 10) {
        errs.phone = t("forms.validation.invalidPhone", "Numéro de téléphone non valide (min. 10 chiffres)");
      }
    }
    if (step === 6) {
      if (formData.firstName.trim() === "") {
        errs.firstName = t("forms.validation.required", "Ce champ est obligatoire");
      }
      if (formData.lastName.trim() === "") {
        errs.lastName = t("forms.validation.required", "Ce champ est obligatoire");
      }
    }
    if (step === 1 && formData.hasCurrentInsurance === null) {
      errs.hasCurrentInsurance = t("forms.validation.required", "Ce champ est obligatoire");
    }
    if (step === 2) {
      if (!formData.familySituation) errs.familySituation = t("forms.validation.required", "Ce champ est obligatoire");
      if (!formData.birthDate) errs.birthDate = t("forms.validation.required", "Ce champ est obligatoire");
    }
    if (step === 3 && !formData.canton) {
      errs.canton = t("forms.validation.required", "Ce champ est obligatoire");
    }
    return errs;
  };

  const stepErrors = attemptedNext ? getStepErrors(currentStep) : {};

  // Auto-format Swiss phone number
  const handlePhoneChange = (value: string) => {
    // Keep only digits and leading +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Auto-add Swiss prefix if user starts typing a number
    if (cleaned.length > 0 && !cleaned.startsWith('+') && !cleaned.startsWith('0')) {
      cleaned = '+41' + cleaned;
    }
    
    // Format: +41 XX XXX XX XX
    if (cleaned.startsWith('+41')) {
      const digits = cleaned.slice(3);
      let formatted = '+41';
      if (digits.length > 0) formatted += ' ' + digits.slice(0, 2);
      if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
      if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
      if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
      updateFormData({ phone: formatted });
    } else if (cleaned.startsWith('0')) {
      const digits = cleaned;
      let formatted = digits.slice(0, 3);
      if (digits.length > 3) formatted += ' ' + digits.slice(3, 6);
      if (digits.length > 6) formatted += ' ' + digits.slice(6, 8);
      if (digits.length > 8) formatted += ' ' + digits.slice(8, 10);
      updateFormData({ phone: formatted });
    } else {
      updateFormData({ phone: cleaned });
    }
  };

  const handleNext = () => {
    setAttemptedNext(true);
    if (!canProceed) {
      toast({
        title: t("forms.validation.fillRequired", "Veuillez remplir les champs obligatoires"),
        description: t("forms.validation.checkFields", "Vérifiez les champs marqués en rouge"),
        variant: "destructive",
      });
      return;
    }
    setAttemptedNext(false);
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
    return (
      <div className="max-w-4xl mx-auto">
        {premiumsError && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {t("forms.healthInsurance.errorLoadingPremiums")}
          </div>
        )}
        {realOffers.length === 0 && !premiumsError && (
          <div className="mb-4 p-4 bg-muted border border-border rounded-lg text-center">
            <p className="text-muted-foreground mb-2">
              {t("comparison.noOffersFound", "Aucune offre trouvée pour ces critères.")}
            </p>
            <Button 
              variant="outline" 
              onClick={() => setShowResults(false)}
            >
              {t("common.modifySearch", "Modifier ma recherche")}
            </Button>
          </div>
        )}
        <HealthComparisonResults
          offers={realOffers}
          formData={{
            canton: formData.canton,
            postalCode: formData.postalCode,
            lamalModel: formData.lamalModel,
            franchise: formData.franchise,
            accidentCoverage: formData.accidentCoverage,
            complementaryTier: formData.complementaryTier,
            complementary: formData.complementary,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          }}
        />
      </div>
    );
  }

  return (
    <FormContainer
      title={t("forms.healthInsurance.title")}
      description={t("forms.healthInsurance.description")}
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      size="large"
    >
      {/* Required fields note */}
      <div className="mb-4 md:mb-6 text-xs md:text-sm text-white/70 flex items-center gap-1.5">
        <span className="text-red-300 font-bold text-sm md:text-base">*</span>
        <span>{t("forms.requiredFields", "Champs obligatoires")}</span>
      </div>

      {/* Step 1: Current Insurance */}
      <FormStep isActive={currentStep === 1}>
        <div className="space-y-4 md:space-y-6">
          <FormFieldWrapper
            label={t("forms.healthInsurance.hasCurrentInsurance")}
            required
          >
            <RadioGroup
              value={formData.hasCurrentInsurance === null ? "" : formData.hasCurrentInsurance ? "yes" : "no"}
              onValueChange={(value) => {
                updateFormData({ 
                  hasCurrentInsurance: value === "yes",
                  currentInsurer: value === "no" ? "" : formData.currentInsurer
                });
                if (value === "no") notify();
              }}
              className="grid grid-cols-2 gap-3"
            >
              <label htmlFor="hasInsurance-yes" className="flex items-center space-x-2 p-3 md:p-4 rounded-lg bg-white/40 hover:bg-white/50 transition-colors border border-white/50 cursor-pointer">
                <RadioGroupItem value="yes" id="hasInsurance-yes" className="h-4 w-4" />
                <span className="text-white text-sm md:text-base">
                  {t("common.yes")}
                </span>
              </label>
              <label htmlFor="hasInsurance-no" className="flex items-center space-x-2 p-3 md:p-4 rounded-lg bg-white/40 hover:bg-white/50 transition-colors border border-white/50 cursor-pointer">
                <RadioGroupItem value="no" id="hasInsurance-no" className="h-4 w-4" />
                <span className="text-white text-sm md:text-base">
                  {t("common.no")}
                </span>
              </label>
            </RadioGroup>
          </FormFieldWrapper>

          {formData.hasCurrentInsurance === true && (
            <FormFieldWrapper
              label={t("forms.healthInsurance.currentInsurer")}
              htmlFor="currentInsurer"
            >
              <Select
                value={formData.currentInsurer}
                onValueChange={(value) => { updateFormData({ currentInsurer: value }); notify(); }}
              >
                <SelectTrigger className="h-10 md:h-12 text-sm md:text-base">
                  <SelectValue placeholder={t("forms.healthInsurance.selectInsurer")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assura">Assura</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="groupe-mutuel">Groupe Mutuel</SelectItem>
                  <SelectItem value="helsana">Helsana</SelectItem>
                  <SelectItem value="sanitas">Sanitas</SelectItem>
                  <SelectItem value="swica">Swica</SelectItem>
                  <SelectItem value="visana">Visana</SelectItem>
                  <SelectItem value="concordia">Concordia</SelectItem>
                  <SelectItem value="kpt">KPT</SelectItem>
                  <SelectItem value="atupri">Atupri</SelectItem>
                  <SelectItem value="sympany">Sympany</SelectItem>
                  <SelectItem value="other">{t("forms.healthInsurance.otherInsurer")}</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldWrapper>
          )}
        </div>
      </FormStep>

      {/* Step 2: Family Situation & Birth Date */}
      <FormStep isActive={currentStep === 2}>
        <div className="space-y-4 md:space-y-6">
          <FormFieldWrapper
            label={t("forms.healthInsurance.familySituation")}
            required
          >
            <RadioGroup
              value={formData.familySituation}
              onValueChange={(value) => updateFormData({ familySituation: value })}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {[
                { value: "single", label: t("forms.healthInsurance.situations.single") },
                { value: "couple", label: t("forms.healthInsurance.situations.couple") },
                { value: "coupleWithChildren", label: t("forms.healthInsurance.situations.coupleWithChildren") },
                { value: "singleWithChildren", label: t("forms.healthInsurance.situations.singleWithChildren") },
              ].map((situation) => (
                <label key={situation.value} htmlFor={situation.value} className="flex items-center space-x-2 p-3 md:p-4 rounded-lg bg-white/40 hover:bg-white/50 transition-colors border border-white/50 cursor-pointer">
                  <RadioGroupItem value={situation.value} id={situation.value} className="h-4 w-4" />
                  <span className="text-white text-sm md:text-base">
                    {situation.label}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </FormFieldWrapper>

          <FormFieldWrapper
            label={t("forms.healthInsurance.birthDate")}
            htmlFor="birthDate"
            required
          >
            <DateInput
              value={formData.birthDate}
              onChange={(date) => { updateFormData({ birthDate: date }); notify(); }}
              placeholder="JJ/MM/AAAA"
              maxYear={new Date().getFullYear()}
              minYear={1900}
              className="h-10 md:h-12"
            />
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 3: Location */}
      <FormStep isActive={currentStep === 3}>
        <div className="space-y-2 md:space-y-6">
          <FormFieldWrapper
            label={t("forms.healthInsurance.canton")}
            htmlFor="canton"
            required
          >
            <Select
              value={formData.canton}
              onValueChange={(value) => updateFormData({ canton: value })}
            >
              <SelectTrigger className="h-8 md:h-11 text-xs md:text-base">
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

          <FormFieldWrapper
            label={t("forms.healthInsurance.postalCode")}
            htmlFor="postalCode"
          >
            <Input
              id="postalCode"
              type="text"
              maxLength={4}
              value={formData.postalCode}
              onChange={(e) => { updateFormData({ postalCode: e.target.value }); notify(); }}
              placeholder="1000"
              className="h-8 md:h-11 text-xs md:text-base"
            />
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 4: LAMal Model & Franchise */}
      <FormStep isActive={currentStep === 4}>
        <div className="space-y-3 md:space-y-6">
          {/* LAMal Model Card */}
          <Card className="bg-white/40 border-white/50 backdrop-blur-sm">
            <CardContent className="p-2.5 md:p-5">
              <Label className="text-[10px] md:text-sm font-semibold text-white mb-2 md:mb-4 block">
                {t("forms.healthInsurance.lamalModel")}
                <span className="text-red-300 ml-1">*</span>
              </Label>
              <RadioGroup
                value={formData.lamalModel}
                onValueChange={(value) => updateFormData({ lamalModel: value })}

                className="grid grid-cols-2 gap-1.5 md:gap-3"
              >
                {[
                  { value: "standard", label: t("forms.healthInsurance.models.standard") },
                  { value: "family-doctor", label: t("forms.healthInsurance.models.familyDoctor") },
                  { value: "hmo", label: t("forms.healthInsurance.models.hmo") },
                  { value: "telemed", label: t("forms.healthInsurance.models.telemed") },
                ].map((model) => (
                  <label key={model.value} htmlFor={model.value} className="flex items-center space-x-1.5 md:space-x-2 p-1.5 md:p-3 rounded-lg bg-white/40 hover:bg-white/50 transition-colors cursor-pointer">
                    <RadioGroupItem value={model.value} id={model.value} className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="text-white text-[10px] md:text-base leading-tight">
                      {model.label}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Franchise Card */}
          <Card className="bg-white/40 border-white/50 backdrop-blur-sm">
            <CardContent className="p-2.5 md:p-5">
              <Label className="text-[10px] md:text-sm font-semibold text-white mb-1 md:mb-2 block">
                {t("forms.healthInsurance.franchise")}
              </Label>
              <div className="text-center mb-2 md:mb-4">
                <span className="text-xl md:text-3xl font-bold text-emerald-600">CHF {formData.franchise}</span>
                <span className="text-white/70 text-[10px] md:text-sm ml-1 md:ml-2">/ an</span>
              </div>
              <Slider
                value={[formData.franchise]}
                onValueChange={(value) => updateFormData({ franchise: value[0] })}
                min={300}
                max={2500}
                step={200}
                className="py-2 md:py-4"
              />
              <div className="flex justify-between text-[10px] md:text-xs text-white/70 mt-1 md:mt-2">
                <span>CHF 300</span>
                <span>CHF 2500</span>
              </div>
            </CardContent>
          </Card>

          {/* Accident Coverage Card */}
          <Card className="bg-white/40 border-white/50 backdrop-blur-sm">
            <CardContent className="p-2.5 md:p-5">
              <div className="flex items-center space-x-2 md:space-x-3">
                <Checkbox
                  id="accidentCoverage"
                  checked={formData.accidentCoverage}
                  onCheckedChange={(checked) =>
                    updateFormData({ accidentCoverage: checked as boolean })
                  }
                  className="h-4 w-4 md:h-5 md:w-5"
                />
                <Label htmlFor="accidentCoverage" className="cursor-pointer text-white font-medium text-xs md:text-base">
                  {t("forms.healthInsurance.includeAccident")}
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </FormStep>

      {/* Step 5: Complementary Insurance - Tier Selection */}
      <FormStep isActive={currentStep === 5}>
        <div className="space-y-3 md:space-y-6">
          <div className="text-center mb-2 md:mb-6">
            <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2 text-white">
              {t("forms.healthInsurance.complementaryTitle", "Assurances complémentaires")}
            </h3>
            <p className="text-xs md:text-sm text-white/70">
              {t("forms.healthInsurance.complementaryDescription")}
            </p>
          </div>

          {/* Tier Selection Cards - Compact horizontal layout on mobile */}
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {/* BASIC */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md bg-white/40 backdrop-blur-sm ${
                formData.complementaryTier === "basic" 
                  ? "ring-2 ring-white border-white/80" 
                  : "border-white/50 hover:border-white/70"
              }`}
              onClick={() => { updateFormData({ 
                complementaryTier: formData.complementaryTier === "basic" ? null : "basic",
                complementary: formData.complementaryTier === "basic" 
                  ? { dental: false, hospitalization: false, glasses: false, alternativeMedicine: false, worldwide: false }
                  : { dental: true, hospitalization: true, glasses: true, alternativeMedicine: true, worldwide: true }
              }); notify(); }}
            >
              <CardContent className="p-2 md:p-4 text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/50 mb-1 md:mb-3">
                  <span className="text-white text-sm md:text-xl font-bold">B</span>
                </div>
                <h4 className="font-bold text-xs md:text-lg text-white">BASIC</h4>
                <p className="text-[10px] md:text-xs text-white/70 mb-1 md:mb-3 hidden md:block">
                  {t("forms.healthInsurance.tiers.basicDesc", "Couverture essentielle")}
                </p>
                <div className="text-sm md:text-2xl font-bold text-white">
                  ~39<span className="text-[10px] md:text-sm font-normal text-white/70">/m</span>
                </div>
              </CardContent>
            </Card>

            {/* PREMIUM */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md relative bg-white/40 backdrop-blur-sm ${
                formData.complementaryTier === "premium" 
                  ? "ring-2 ring-violet-400 border-violet-400" 
                  : "border-white/50 hover:border-violet-400"
              }`}
              onClick={() => { updateFormData({ 
                complementaryTier: formData.complementaryTier === "premium" ? null : "premium",
                complementary: formData.complementaryTier === "premium" 
                  ? { dental: false, hospitalization: false, glasses: false, alternativeMedicine: false, worldwide: false }
                  : { dental: true, hospitalization: true, glasses: true, alternativeMedicine: true, worldwide: true }
              }); notify(); }}
            >
              <div className="absolute -top-2 md:-top-3 left-1/2 -translate-x-1/2">
                <span className="bg-violet-500 text-white text-[8px] md:text-xs font-semibold px-1.5 md:px-3 py-0.5 md:py-1 rounded-full whitespace-nowrap">
                  ★
                </span>
              </div>
              <CardContent className="p-2 md:p-4 text-center pt-3 md:pt-4">
                <div className="inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full bg-violet-500/30 mb-1 md:mb-3">
                  <span className="text-violet-300 text-sm md:text-xl font-bold">P</span>
                </div>
                <h4 className="font-bold text-xs md:text-lg text-violet-300">PREMIUM</h4>
                <p className="text-[10px] md:text-xs text-white/70 mb-1 md:mb-3 hidden md:block">
                  {t("forms.healthInsurance.tiers.premiumDesc", "Rapport qualité-prix optimal")}
                </p>
                <div className="text-sm md:text-2xl font-bold text-violet-300">
                  ~91<span className="text-[10px] md:text-sm font-normal text-white/70">/m</span>
                </div>
              </CardContent>
            </Card>

            {/* DIAMOND */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md bg-white/40 backdrop-blur-sm ${
                formData.complementaryTier === "diamond" 
                  ? "ring-2 ring-amber-400 border-amber-400" 
                  : "border-white/50 hover:border-amber-400"
              }`}
              onClick={() => { updateFormData({ 
                complementaryTier: formData.complementaryTier === "diamond" ? null : "diamond",
                complementary: formData.complementaryTier === "diamond" 
                  ? { dental: false, hospitalization: false, glasses: false, alternativeMedicine: false, worldwide: false }
                  : { dental: true, hospitalization: true, glasses: true, alternativeMedicine: true, worldwide: true }
              }); notify(); }}
            >
              <CardContent className="p-2 md:p-4 text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full bg-amber-500/30 mb-1 md:mb-3">
                  <span className="text-amber-300 text-sm md:text-xl font-bold">D</span>
                </div>
                <h4 className="font-bold text-xs md:text-lg text-amber-300">DIAMOND</h4>
                <p className="text-[10px] md:text-xs text-white/70 mb-1 md:mb-3 hidden md:block">
                  {t("forms.healthInsurance.tiers.diamondDesc", "Couverture maximale")}
                </p>
                <div className="text-sm md:text-2xl font-bold text-amber-300">
                  ~175<span className="text-[10px] md:text-sm font-normal text-white/70">/m</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skip option */}
          <div className="text-center pt-2 md:pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { updateFormData({ 
                complementaryTier: null,
                complementary: { dental: false, hospitalization: false, glasses: false, alternativeMedicine: false, worldwide: false }
              }); notify(); }}
              className="text-white hover:text-white hover:bg-white/40 text-xs md:text-sm h-8 md:h-auto"
            >
              {t("forms.healthInsurance.skipComplementary", "Passer")}
            </Button>
          </div>

          {/* Selected tier details - hidden on mobile to save space */}
          {formData.complementaryTier && (
            <Card className="bg-white/40 border-white/50 backdrop-blur-sm hidden md:block">
              <CardContent className="p-4">
                <h5 className="font-semibold mb-3 text-sm text-white">
                  {t("forms.healthInsurance.includedInPackage", "Inclus dans votre package")} {formData.complementaryTier.toUpperCase()}:
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/90">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-300">✓</span>
                    {t("forms.healthInsurance.complementary.dental")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-300">✓</span>
                    {t("forms.healthInsurance.complementary.hospitalization")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-300">✓</span>
                    {t("forms.healthInsurance.complementary.glasses")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-300">✓</span>
                    {t("forms.healthInsurance.complementary.alternativeMedicine")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-300">✓</span>
                    {t("forms.healthInsurance.complementary.worldwide")}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </FormStep>

      {/* Step 6: Name */}
      <FormStep isActive={currentStep === 6}>
        <div className="space-y-2 md:space-y-6">
          <div className="text-center mb-2 md:mb-6">
            <h3 className="text-xs md:text-lg font-semibold mb-0.5 md:mb-2">
              {t("forms.contact.almostDone", "Presque terminé !")}
            </h3>
            <p className="text-[10px] md:text-sm text-muted-foreground">
              {t("forms.contact.nameStepDescription", "Comment pouvons-nous vous appeler ?")}
            </p>
          </div>
          
          <FormFieldWrapper
            label={t("forms.contact.firstName")}
            htmlFor="firstName"
            required
          >
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => { updateFormData({ firstName: e.target.value }); notifyDelayed(); }}
              placeholder={t("forms.contact.firstNamePlaceholder", "Votre prénom")}
              className="h-8 md:h-14 text-xs md:text-lg"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label={t("forms.contact.lastName")}
            htmlFor="lastName"
            required
          >
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => { updateFormData({ lastName: e.target.value }); notifyDelayed(); }}
              placeholder={t("forms.contact.lastNamePlaceholder", "Votre nom")}
              className="h-8 md:h-14 text-xs md:text-lg"
            />
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 7: Contact Details */}
      <FormStep isActive={currentStep === 7}>
        <div className="space-y-2 md:space-y-6">
          <div className="text-center mb-2 md:mb-6">
            <h3 className="text-xs md:text-lg font-semibold mb-0.5 md:mb-2">
              {t("forms.contact.contactStepTitle", "Où pouvons-nous vous joindre ?")}
            </h3>
            <p className="text-[10px] md:text-sm text-muted-foreground">
              {t("forms.contact.contactStepDescription", "Un conseiller vous contactera pour vous présenter les meilleures offres.")}
            </p>
          </div>
          
          <FormFieldWrapper
            label={t("forms.contact.email")}
            htmlFor="email"
            required
            error={stepErrors.email}
          >
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => { updateFormData({ email: e.target.value.toLowerCase() }); notifyDelayed(); }}
              placeholder="votre@email.ch"
              className={`h-8 md:h-14 text-xs md:text-lg ${stepErrors.email ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label={t("forms.contact.phone")}
            htmlFor="phone"
            required
            error={stepErrors.phone}
          >
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => { handlePhoneChange(e.target.value); notifyDelayed(); }}
              placeholder="+41 79 123 45 67"
              className={`h-8 md:h-14 text-xs md:text-lg ${stepErrors.phone ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
            />
          </FormFieldWrapper>

          <div className="bg-white/40 border border-white/50 rounded-md md:rounded-xl p-2 md:p-4 text-center backdrop-blur-sm">
            <p className="text-[10px] md:text-sm text-white/80">
              🔒 {t("forms.contact.privacyNote", "Vos données sont protégées et ne seront jamais partagées.")}
            </p>
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

export default HealthInsuranceForm;
