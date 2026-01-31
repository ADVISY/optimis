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

const TOTAL_STEPS = 5;

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

    // Submit lead
    await submitLead(formData as unknown as Record<string, unknown>);

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
        <ComparisonResults
          offers={realOffers}
          onSelectOffer={handleSelectOffer}
          onContactRequest={handleContactRequest}
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
    >
      {/* Step 1: Location */}
      <FormStep isActive={currentStep === 1}>
        <div className="space-y-6">
          <FormFieldWrapper
            label={t("forms.healthInsurance.canton")}
            htmlFor="canton"
            required
          >
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
            />
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 2: Persons to insure */}
      <FormStep isActive={currentStep === 2}>
        <div className="space-y-6">
          <div className="space-y-4">
            {formData.persons.map((person, index) => (
              <Card key={person.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">
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
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <FormFieldWrapper
                    label={t("forms.healthInsurance.birthDate")}
                    required
                  >
                    <DateInput
                      value={person.birthDate}
                      onChange={(date) => updatePersonBirthDate(person.id, date)}
                      placeholder="JJ/MM/AAAA"
                      maxYear={new Date().getFullYear()}
                      minYear={1900}
                    />
                  </FormFieldWrapper>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => addPerson("adult")}
              className="flex-1 gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("forms.healthInsurance.addAdult")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => addPerson("child")}
              className="flex-1 gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("forms.healthInsurance.addChild")}
            </Button>
          </div>
        </div>
      </FormStep>

      {/* Step 3: LAMal Model & Franchise */}
      <FormStep isActive={currentStep === 3}>
        <div className="space-y-6">
          <FormFieldWrapper
            label={t("forms.healthInsurance.lamalModel")}
            required
          >
            <RadioGroup
              value={formData.lamalModel}
              onValueChange={(value) => updateFormData({ lamalModel: value })}
              className="grid grid-cols-2 gap-3"
            >
              {[
                { value: "standard", label: t("forms.healthInsurance.models.standard") },
                { value: "family-doctor", label: t("forms.healthInsurance.models.familyDoctor") },
                { value: "hmo", label: t("forms.healthInsurance.models.hmo") },
                { value: "telemed", label: t("forms.healthInsurance.models.telemed") },
              ].map((model) => (
                <div key={model.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={model.value} id={model.value} />
                  <Label htmlFor={model.value} className="cursor-pointer">
                    {model.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormFieldWrapper>

          <FormFieldWrapper
            label={`${t("forms.healthInsurance.franchise")}: CHF ${formData.franchise}`}
            helpText={t("forms.healthInsurance.franchiseHelp")}
          >
            <Slider
              value={[formData.franchise]}
              onValueChange={(value) => updateFormData({ franchise: value[0] })}
              min={300}
              max={2500}
              step={200}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>CHF 300</span>
              <span>CHF 2500</span>
            </div>
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.healthInsurance.accidentCoverage")}>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="accidentCoverage"
                checked={formData.accidentCoverage}
                onCheckedChange={(checked) =>
                  updateFormData({ accidentCoverage: checked as boolean })
                }
              />
              <Label htmlFor="accidentCoverage" className="cursor-pointer">
                {t("forms.healthInsurance.includeAccident")}
              </Label>
            </div>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 4: Complementary Insurance */}
      <FormStep isActive={currentStep === 4}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            {t("forms.healthInsurance.complementaryDescription")}
          </p>

          {[
            { key: "dental", label: t("forms.healthInsurance.complementary.dental") },
            { key: "hospitalization", label: t("forms.healthInsurance.complementary.hospitalization") },
            { key: "glasses", label: t("forms.healthInsurance.complementary.glasses") },
            { key: "alternativeMedicine", label: t("forms.healthInsurance.complementary.alternativeMedicine") },
            { key: "worldwide", label: t("forms.healthInsurance.complementary.worldwide") },
          ].map((option) => (
            <div key={option.key} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id={option.key}
                checked={formData.complementary[option.key as keyof typeof formData.complementary]}
                onCheckedChange={(checked) =>
                  updateFormData({
                    complementary: {
                      ...formData.complementary,
                      [option.key]: checked as boolean,
                    },
                  })
                }
              />
              <Label htmlFor={option.key} className="cursor-pointer flex-1">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </FormStep>

      {/* Step 5: Contact Information */}
      <FormStep isActive={currentStep === 5}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormFieldWrapper
              label={t("forms.contact.firstName")}
              htmlFor="firstName"
              required
            >
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateFormData({ firstName: e.target.value })}
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
              />
            </FormFieldWrapper>
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
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            label={t("forms.contact.availability")}
            htmlFor="availability"
          >
            <Select
              value={formData.availability}
              onValueChange={(value) => updateFormData({ availability: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("forms.contact.selectAvailability")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">{t("forms.contact.morning")}</SelectItem>
                <SelectItem value="afternoon">{t("forms.contact.afternoon")}</SelectItem>
                <SelectItem value="evening">{t("forms.contact.evening")}</SelectItem>
                <SelectItem value="anytime">{t("forms.contact.anytime")}</SelectItem>
              </SelectContent>
            </Select>
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

export default HealthInsuranceForm;
