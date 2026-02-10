import { useState } from "react";
import { useTranslation } from "react-i18next";
import FormContainer from "@/components/forms/FormContainer";
import FormStep from "@/components/forms/FormStep";
import FormNavigation from "@/components/forms/FormNavigation";
import FormFieldWrapper from "@/components/forms/FormField";
import ComparisonResults from "@/components/forms/ComparisonResults";
import LoadingComparison from "@/components/forms/LoadingComparison";
import VehicleSelector from "@/components/forms/VehicleSelector";
import PlateSearch from "@/components/forms/PlateSearch";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { useLeadSubmission } from "@/hooks/useLeadSubmission";
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
import { mockCarInsuranceOffers, InsuranceOffer } from "@/data/mockInsuranceData";
import DateInput from "@/components/ui/date-input";
import { Lock, User, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";

interface CarInsuranceFormData {
  // Vehicle info
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  // Usage
  usage: string;
  annualKm: number;
  // Driver info
  driverBirthDate: Date | null;
  licenseYear: string;
  accidentsLast5Years: number;
  // Coverage
  coverageType: string;
  // Options
  options: {
    glassBreakage: boolean;
    assistance: boolean;
    replacementVehicle: boolean;
  };
  // Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  canton: string;
}

const TOTAL_STEPS = 6;

const CarInsuranceForm = () => {
  const { t, i18n } = useTranslation();
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"analyzing" | "comparing" | "preparing">("analyzing");
  const [plateSearching, setPlateSearching] = useState(false);
  const { attemptedNext, markAttempted, resetAttempted, formatSwissPhone, isValidEmail, isValidPhone, getContactErrors, getIdentityErrors, showValidationToast } = useFormValidation();

  const initialData: CarInsuranceFormData = {
    vehiclePlate: "",
    vehicleBrand: "",
    vehicleModel: "",
    vehicleYear: "",
    usage: "private",
    annualKm: 10000,
    driverBirthDate: null,
    licenseYear: "",
    accidentsLast5Years: 0,
    coverageType: "rc-partial",
    options: {
      glassBreakage: false,
      assistance: false,
      replacementVehicle: false,
    },
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    canton: "",
  };

  const { submitLead, isSubmitting } = useLeadSubmission({
    formType: "car-insurance",
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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 3: return formData.driverBirthDate !== null && formData.licenseYear !== "";
      case 5: return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
      case 6: return isValidEmail(formData.email) && isValidPhone(formData.phone);
      default: return true;
    }
  };

  const getStepErrors = (step: number): Record<string, string> => {
    if (step === 5) return getIdentityErrors(formData.firstName, formData.lastName);
    if (step === 6) return getContactErrors(formData.email, formData.phone);
    return {};
  };

  const canProceed = validateStep(currentStep);
  const notify = useAutoAdvance(currentStep, nextStep, canProceed, isLastStep);
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
          offers={mockCarInsuranceOffers}
          onSelectOffer={handleSelectOffer}
          onContactRequest={handleContactRequest}
        />
      </div>
    );
  }

  return (
    <FormContainer
      title={t("forms.carInsurance.title")}
      description={t("forms.carInsurance.description")}
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
    >
      {/* Step 1: Vehicle */}
      <FormStep isActive={currentStep === 1}>
        <div className="space-y-6">
          {/* License Plate Search - Primary method */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <FormFieldWrapper label={t("forms.carInsurance.vehiclePlate")} htmlFor="vehiclePlate">
              <PlateSearch
                plate={formData.vehiclePlate}
                onPlateChange={(plate) => updateFormData({ vehiclePlate: plate })}
                onVehicleFound={(brand, model, year) => {
                  updateFormData({ 
                    vehicleBrand: brand, 
                    vehicleModel: model, 
                    vehicleYear: year 
                  });
                }}
              />
            </FormFieldWrapper>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("forms.carInsurance.orManual")}
              </span>
            </div>
          </div>

          {/* Manual Vehicle Selection */}
          <VehicleSelector
            brand={formData.vehicleBrand}
            model={formData.vehicleModel}
            year={formData.vehicleYear}
            onBrandChange={(brand) => updateFormData({ vehicleBrand: brand })}
            onModelChange={(model) => updateFormData({ vehicleModel: model })}
            onYearChange={(year) => updateFormData({ vehicleYear: year })}
          />

          {/* Show selected vehicle summary */}
          {formData.vehicleBrand && formData.vehicleModel && formData.vehicleYear && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium text-primary">{t("forms.carInsurance.vehicleSelected")}:</p>
              <p className="text-lg font-bold">
                {formData.vehicleBrand} {formData.vehicleModel} ({formData.vehicleYear})
              </p>
            </div>
          )}
        </div>
      </FormStep>

      {/* Step 2: Usage */}
      <FormStep isActive={currentStep === 2}>
        <div className="space-y-6">
          <FormFieldWrapper label={t("forms.carInsurance.usage")} required>
            <RadioGroup
              value={formData.usage}
              onValueChange={(value) => updateFormData({ usage: value })}
              className="grid gap-3"
            >
              <label htmlFor="private" className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="private" id="private" />
                <span className="flex-1 text-lg">
                  {t("forms.carInsurance.usagePrivate")}
                </span>
              </label>
              <label htmlFor="professional" className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="professional" id="professional" />
                <span className="flex-1 text-lg">
                  {t("forms.carInsurance.usageProfessional")}
                </span>
              </label>
            </RadioGroup>
          </FormFieldWrapper>

          <FormFieldWrapper
            label={`${t("forms.carInsurance.annualKm")}: ${formData.annualKm.toLocaleString()} km`}
          >
            <Slider
              value={[formData.annualKm]}
              onValueChange={(value) => updateFormData({ annualKm: value[0] })}
              min={5000}
              max={50000}
              step={1000}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5'000 km</span>
              <span>50'000 km</span>
            </div>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 3: Driver */}
      <FormStep isActive={currentStep === 3}>
        <div className="space-y-3 md:space-y-4">
          <FormFieldWrapper label={t("forms.carInsurance.driverBirthDate")} required>
            <DateInput
              value={formData.driverBirthDate}
              onChange={(date) => { updateFormData({ driverBirthDate: date }); notify(); }}
              placeholder={t("forms.carInsurance.datePlaceholder")}
              className="h-9 md:h-14 text-sm md:text-lg"
              maxYear={new Date().getFullYear() - 18}
            />
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              {t("forms.carInsurance.driverMinAge")}
            </p>
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.carInsurance.licenseYear")} htmlFor="licenseYear" required>
            <Select
              value={formData.licenseYear}
              onValueChange={(value) => { updateFormData({ licenseYear: value }); notify(); }}
            >
              <SelectTrigger className="h-9 md:h-14 text-sm md:text-lg">
                <SelectValue placeholder={t("forms.carInsurance.selectLicenseYear")} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormFieldWrapper>

          <FormFieldWrapper
            label={`${t("forms.carInsurance.accidents")}: ${formData.accidentsLast5Years}`}
          >
            <Slider
              value={[formData.accidentsLast5Years]}
              onValueChange={(value) => updateFormData({ accidentsLast5Years: value[0] })}
              min={0}
              max={5}
              step={1}
              className="py-2 md:py-4"
            />
            <div className="flex justify-between text-[10px] md:text-xs text-muted-foreground">
              <span>0</span>
              <span>5+</span>
            </div>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 4: Coverage & Options */}
      <FormStep isActive={currentStep === 4}>
        <div className="space-y-6">
          <FormFieldWrapper label={t("forms.carInsurance.coverage")} required>
            <RadioGroup
              value={formData.coverageType}
              onValueChange={(value) => updateFormData({ coverageType: value })}
              className="grid gap-3"
            >
              <label htmlFor="rc" className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="rc" id="rc" />
                <span className="flex-1">
                  <span className="font-medium text-lg">{t("forms.carInsurance.coverageRC")}</span>
                  <p className="text-sm text-muted-foreground">{t("forms.carInsurance.coverageRCDesc")}</p>
                </span>
              </label>
              <label htmlFor="rc-partial" className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="rc-partial" id="rc-partial" />
                <span className="flex-1">
                  <span className="font-medium text-lg">{t("forms.carInsurance.coveragePartial")}</span>
                  <p className="text-sm text-muted-foreground">{t("forms.carInsurance.coveragePartialDesc")}</p>
                </span>
              </label>
              <label htmlFor="rc-full" className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="rc-full" id="rc-full" />
                <span className="flex-1">
                  <span className="font-medium text-lg">{t("forms.carInsurance.coverageFull")}</span>
                  <p className="text-sm text-muted-foreground">{t("forms.carInsurance.coverageFullDesc")}</p>
                </span>
              </label>
            </RadioGroup>
          </FormFieldWrapper>

          <div className="space-y-3">
            <p className="font-medium text-lg">{t("forms.carInsurance.additionalOptions")}</p>
            {[
              { key: "glassBreakage", label: t("forms.carInsurance.options.glassBreakage") },
              { key: "assistance", label: t("forms.carInsurance.options.assistance") },
              { key: "replacementVehicle", label: t("forms.carInsurance.options.replacementVehicle") },
            ].map((option) => (
              <label key={option.key} htmlFor={option.key} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <Checkbox
                  id={option.key}
                  checked={formData.options[option.key as keyof typeof formData.options]}
                  onCheckedChange={(checked) =>
                    updateFormData({
                      options: { ...formData.options, [option.key]: checked as boolean },
                    })
                  }
                />
                <span className="flex-1 text-lg">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </FormStep>

      {/* Step 5: Identity */}
      <FormStep isActive={currentStep === 5}>
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

          <FormFieldWrapper label={t("forms.healthInsurance.canton")} htmlFor="canton">
            <Select
              value={formData.canton}
              onValueChange={(value) => { updateFormData({ canton: value }); notify(); }}
            >
              <SelectTrigger className="h-14 text-lg">
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

      {/* Step 6: Contact */}
      <FormStep isActive={currentStep === 6}>
        <div className="space-y-6">
          <div className="text-center mb-4 md:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 mb-3 md:mb-4">
              <Phone className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold">{t("forms.contact.contactStepTitle")}</h3>
            <p className="text-sm md:text-base text-muted-foreground">{t("forms.contact.contactStepDescription")}</p>
          </div>

          <FormFieldWrapper label={t("forms.contact.email")} htmlFor="email" required error={stepErrors.email}>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              className={cn("h-12 md:h-14 text-base md:text-lg", stepErrors.email && "border-red-400")}
            />
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.contact.phone")} htmlFor="phone" required error={stepErrors.phone}>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: formatSwissPhone(e.target.value) })}
              placeholder="+41 79 123 45 67"
              className={cn("h-12 md:h-14 text-base md:text-lg", stepErrors.phone && "border-red-400")}
            />
          </FormFieldWrapper>

          <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
            <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{t("forms.contact.privacyNote")}</p>
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

export default CarInsuranceForm;
