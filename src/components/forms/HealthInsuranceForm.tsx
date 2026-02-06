import { useState } from "react";
import { useTranslation } from "react-i18next";
import FormContainer from "@/components/forms/FormContainer";
import FormStep from "@/components/forms/FormStep";
import FormNavigation from "@/components/forms/FormNavigation";
import FormFieldWrapper from "@/components/forms/FormField";
import HealthComparisonResults from "@/components/forms/HealthComparisonResults";
import LoadingComparison from "@/components/forms/LoadingComparison";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { useLeadSubmission } from "@/hooks/useLeadSubmission";
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
import { Plus, Trash2 } from "lucide-react";
import DateInput from "@/components/ui/date-input";
import { Card, CardContent } from "@/components/ui/card";

interface Person {
  id: string;
  birthDate: Date | null;
  type: "adult" | "child";
}

interface HealthInsuranceFormData {
  canton: string;
  postalCode: string;
  persons: Person[];
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

const TOTAL_STEPS = 6;

const HealthInsuranceForm = () => {
  const { t, i18n } = useTranslation();
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"analyzing" | "comparing" | "preparing">("analyzing");
  const [realOffers, setRealOffers] = useState<InsuranceOffer[]>([]);
  
  const { fetchPremiums, error: premiumsError } = useHealthPremiums();


  const initialData: HealthInsuranceFormData = {
    canton: "",
    postalCode: "",
    persons: [{ id: "1", birthDate: null, type: "adult" }],
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

  // Prepare lead data with translated labels
  const prepareLeadData = () => {
    const firstPerson = formData.persons[0];
    const birthDate = firstPerson?.birthDate 
      ? firstPerson.birthDate.toLocaleDateString(i18n.language === 'de' ? 'de-CH' : i18n.language === 'it' ? 'it-CH' : 'fr-CH')
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
      birthDate,
      personsCount: formData.persons.length,
      adultsCount: formData.persons.filter(p => p.type === "adult").length,
      childrenCount: formData.persons.filter(p => p.type === "child").length,
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

    // Calculate birth year from first person's birth date
    const firstPerson = formData.persons[0];
    const birthYear = firstPerson?.birthDate 
      ? firstPerson.birthDate.getFullYear() 
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

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      nextStep();
    }
  };

  const addPerson = (type: "adult" | "child") => {
    const newPerson: Person = {
      id: Date.now().toString(),
      birthDate: null,
      type,
    };
    updateFormData({ persons: [...formData.persons, newPerson] });
  };

  const removePerson = (id: string) => {
    if (formData.persons.length > 1) {
      updateFormData({
        persons: formData.persons.filter((p) => p.id !== id),
      });
    }
  };

  const updatePersonBirthDate = (id: string, date: Date | null) => {
    updateFormData({
      persons: formData.persons.map((p) =>
        p.id === id ? { ...p, birthDate: date } : p
      ),
    });
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
      {/* Step 1: Location */}
      <FormStep isActive={currentStep === 1}>
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
              onChange={(e) => updateFormData({ postalCode: e.target.value })}
              placeholder="1000"
              className="h-8 md:h-11 text-xs md:text-base"
            />
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 2: Persons to insure */}
      <FormStep isActive={currentStep === 2}>
        <div className="space-y-2 md:space-y-6">
          <div className="space-y-1.5 md:space-y-4">
            {formData.persons.map((person, index) => (
              <Card key={person.id} className="bg-white/40 border-white/50 backdrop-blur-sm">
                <CardContent className="p-2 md:p-4">
                  <div className="flex items-center justify-between mb-1.5 md:mb-4">
                    <span className="font-medium text-white text-xs md:text-base">
                      {person.type === "adult"
                        ? t("forms.healthInsurance.adult")
                        : t("forms.healthInsurance.child")}{" "}
                      {index + 1}
                    </span>
                    {formData.persons.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePerson(person.id)}
                        className="text-white/70 hover:text-red-300 hover:bg-red-500/20 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1 md:space-y-2">
                    <Label className="text-[10px] md:text-sm font-medium text-white/90">
                      {t("forms.healthInsurance.birthDate")}
                      <span className="text-red-300 ml-1">*</span>
                    </Label>
                    <DateInput
                      value={person.birthDate}
                      onChange={(date) => updatePersonBirthDate(person.id, date)}
                      placeholder="JJ/MM/AAAA"
                      maxYear={new Date().getFullYear()}
                      minYear={1900}
                      className="h-8 md:h-11"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-1.5 md:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => addPerson("adult")}
              className="flex-1 gap-1 bg-white/40 text-gray-800 border-white/60 hover:bg-white/50 backdrop-blur-sm text-[10px] md:text-base h-7 md:h-11 px-1.5 md:px-4"
            >
              <Plus className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">{t("forms.healthInsurance.addAdult")}</span>
              <span className="sm:hidden">Adulte</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => addPerson("child")}
              className="flex-1 gap-1 bg-white/40 text-gray-800 border-white/60 hover:bg-white/50 backdrop-blur-sm text-[10px] md:text-base h-7 md:h-11 px-1.5 md:px-4"
            >
              <Plus className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">{t("forms.healthInsurance.addChild")}</span>
              <span className="sm:hidden">Enfant</span>
            </Button>
          </div>
        </div>
      </FormStep>

      {/* Step 3: LAMal Model & Franchise */}
      <FormStep isActive={currentStep === 3}>
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
                  <div key={model.value} className="flex items-center space-x-1.5 md:space-x-2 p-1.5 md:p-3 rounded-lg bg-white/40 hover:bg-white/50 transition-colors">
                    <RadioGroupItem value={model.value} id={model.value} className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <Label htmlFor={model.value} className="cursor-pointer text-white text-[10px] md:text-base leading-tight">
                      {model.label}
                    </Label>
                  </div>
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

      {/* Step 4: Complementary Insurance - Tier Selection */}
      <FormStep isActive={currentStep === 4}>
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">
              {t("forms.healthInsurance.complementaryTitle", "Assurances complémentaires")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("forms.healthInsurance.complementaryDescription")}
            </p>
          </div>

          {/* Tier Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {/* BASIC */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md bg-white/40 backdrop-blur-sm ${
                formData.complementaryTier === "basic" 
                  ? "ring-2 ring-white border-white/80" 
                  : "border-white/50 hover:border-white/70"
              }`}
              onClick={() => updateFormData({ 
                complementaryTier: formData.complementaryTier === "basic" ? null : "basic",
                complementary: formData.complementaryTier === "basic" 
                  ? { dental: false, hospitalization: false, glasses: false, alternativeMedicine: false, worldwide: false }
                  : { dental: true, hospitalization: true, glasses: true, alternativeMedicine: true, worldwide: true }
              })}
            >
              <CardContent className="p-4 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/50 mb-3">
                  <span className="text-white text-xl font-bold">B</span>
                </div>
                <h4 className="font-bold text-lg text-white">BASIC</h4>
                <p className="text-xs text-white/70 mb-3">
                  {t("forms.healthInsurance.tiers.basicDesc", "Couverture essentielle")}
                </p>
                <div className="text-2xl font-bold text-white">
                  ~CHF 39<span className="text-sm font-normal text-white/70">/mois</span>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  {t("forms.healthInsurance.tiers.allOptions", "Toutes options incluses")}
                </p>
              </CardContent>
            </Card>

            {/* PREMIUM */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md relative bg-white/40 backdrop-blur-sm ${
                formData.complementaryTier === "premium" 
                  ? "ring-2 ring-violet-400 border-violet-400" 
                  : "border-white/50 hover:border-violet-400"
              }`}
              onClick={() => updateFormData({ 
                complementaryTier: formData.complementaryTier === "premium" ? null : "premium",
                complementary: formData.complementaryTier === "premium" 
                  ? { dental: false, hospitalization: false, glasses: false, alternativeMedicine: false, worldwide: false }
                  : { dental: true, hospitalization: true, glasses: true, alternativeMedicine: true, worldwide: true }
              })}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-violet-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {t("forms.healthInsurance.tiers.popular", "Populaire")}
                </span>
              </div>
              <CardContent className="p-4 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-500/30 mb-3">
                  <span className="text-violet-300 text-xl font-bold">P</span>
                </div>
                <h4 className="font-bold text-lg text-violet-300">PREMIUM</h4>
                <p className="text-xs text-white/70 mb-3">
                  {t("forms.healthInsurance.tiers.premiumDesc", "Rapport qualité-prix optimal")}
                </p>
                <div className="text-2xl font-bold text-violet-300">
                  ~CHF 91<span className="text-sm font-normal text-white/70">/mois</span>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  {t("forms.healthInsurance.tiers.allOptions", "Toutes options incluses")}
                </p>
              </CardContent>
            </Card>

            {/* DIAMOND */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md bg-white/40 backdrop-blur-sm ${
                formData.complementaryTier === "diamond" 
                  ? "ring-2 ring-amber-400 border-amber-400" 
                  : "border-white/50 hover:border-amber-400"
              }`}
              onClick={() => updateFormData({ 
                complementaryTier: formData.complementaryTier === "diamond" ? null : "diamond",
                complementary: formData.complementaryTier === "diamond" 
                  ? { dental: false, hospitalization: false, glasses: false, alternativeMedicine: false, worldwide: false }
                  : { dental: true, hospitalization: true, glasses: true, alternativeMedicine: true, worldwide: true }
              })}
            >
              <CardContent className="p-4 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/30 mb-3">
                  <span className="text-amber-300 text-xl font-bold">D</span>
                </div>
                <h4 className="font-bold text-lg text-amber-300">DIAMOND</h4>
                <p className="text-xs text-white/70 mb-3">
                  {t("forms.healthInsurance.tiers.diamondDesc", "Couverture maximale")}
                </p>
                <div className="text-2xl font-bold text-amber-300">
                  ~CHF 175<span className="text-sm font-normal text-white/70">/mois</span>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  {t("forms.healthInsurance.tiers.allOptions", "Toutes options incluses")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Skip option */}
          <div className="text-center pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFormData({ 
                complementaryTier: null,
                complementary: { dental: false, hospitalization: false, glasses: false, alternativeMedicine: false, worldwide: false }
              })}
              className="text-white hover:text-white hover:bg-white/40"
            >
              {t("forms.healthInsurance.skipComplementary", "Continuer sans complémentaire")}
            </Button>
          </div>

          {/* Selected tier details */}
          {formData.complementaryTier && (
            <Card className="bg-white/40 border-white/50 backdrop-blur-sm">
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

      {/* Step 5: Name */}
      <FormStep isActive={currentStep === 5}>
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
              onChange={(e) => updateFormData({ firstName: e.target.value })}
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
              onChange={(e) => updateFormData({ lastName: e.target.value })}
              placeholder={t("forms.contact.lastNamePlaceholder", "Votre nom")}
              className="h-8 md:h-14 text-xs md:text-lg"
            />
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 6: Contact Details */}
      <FormStep isActive={currentStep === 6}>
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
          >
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              placeholder="votre@email.ch"
              className="h-8 md:h-14 text-xs md:text-lg"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label={t("forms.contact.phone")}
            htmlFor="phone"
            required
          >
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              placeholder="+41 79 123 45 67"
              className="h-8 md:h-14 text-xs md:text-lg"
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
        canProceed={true}
      />
    </FormContainer>
  );
};

export default HealthInsuranceForm;
