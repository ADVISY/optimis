import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import FormContainer from "@/components/forms/FormContainer";
import FormStep from "@/components/forms/FormStep";
import FormNavigation from "@/components/forms/FormNavigation";
import FormFieldWrapper from "@/components/forms/FormField";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { useLeadSubmission } from "@/hooks/useLeadSubmission";
import { Input } from "@/components/ui/input";
import { PhoneInputCH } from "@/components/forms/PhoneInputCH";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateInput from "@/components/ui/date-input";
import { swissCantons, getCantonName } from "@/data/swissCantons";
import { Lock, User, Phone, HeartPulse, Stethoscope, Dumbbell, Sparkles, Eye, Globe2, Bed } from "lucide-react";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";
import { useOtpFormFlow } from "@/hooks/useOtpFormFlow";
import SmsVerificationModal from "@/components/forms/SmsVerificationModal";
import { cn } from "@/lib/utils";

interface ComplementaryFormData {
  needs: {
    hospitalization: boolean;
    dental: boolean;
    fitness: boolean;
    alternativeMedicine: boolean;
    glasses: boolean;
    worldwide: boolean;
  };
  hasCurrentInsurance: boolean | null;
  currentInsurer: string;
  currentSince: string;
  healthStatus: string;
  familySituation: string;
  birthDate: Date | null;
  canton: string;
  postalCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const TOTAL_STEPS = 7;

const NEEDS_OPTIONS: { key: keyof ComplementaryFormData["needs"]; label: string; icon: any }[] = [
  { key: "hospitalization", label: "Hospitalisation (privé / semi-privé)", icon: Bed },
  { key: "dental", label: "Soins dentaires", icon: Stethoscope },
  { key: "fitness", label: "Fitness & prévention", icon: Dumbbell },
  { key: "alternativeMedicine", label: "Médecine alternative", icon: Sparkles },
  { key: "glasses", label: "Lunettes & lentilles", icon: Eye },
  { key: "worldwide", label: "Couverture mondiale", icon: Globe2 },
];

const ComplementaryInsuranceForm = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { localizedPath } = useLocalizedPath();
  const {
    attemptedNext,
    markAttempted,
    resetAttempted,
    formatSwissPhone,
    isValidEmail,
    isValidPhone,
    getContactErrors,
    getIdentityErrors,
    showValidationToast,
  } = useFormValidation();

  const initialData: ComplementaryFormData = {
    needs: {
      hospitalization: false,
      dental: false,
      fitness: false,
      alternativeMedicine: false,
      glasses: false,
      worldwide: false,
    },
    hasCurrentInsurance: null,
    currentInsurer: "",
    currentSince: "",
    healthStatus: "",
    familySituation: "",
    birthDate: null,
    canton: "",
    postalCode: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  };

  const { submitLead, isSubmitting } = useLeadSubmission({
    formType: "complementary-insurance",
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

  const prepareLeadData = () => {
    const birthDate = formData.birthDate
      ? formData.birthDate.toLocaleDateString(i18n.language === "de" ? "de-CH" : i18n.language === "it" ? "it-CH" : "fr-CH")
      : "";

    const selectedNeeds = NEEDS_OPTIONS
      .filter((opt) => formData.needs[opt.key])
      .map((opt) => opt.label);

    const healthLabels: Record<string, string> = {
      excellent: "Excellente forme",
      good: "Plutôt en forme",
      average: "Moyenne",
      issues: "Quelques soucis de santé",
    };

    const familyLabels: Record<string, string> = {
      single: "Seul(e)",
      couple: "Couple",
      coupleWithChildren: "Couple avec enfants",
      singleWithChildren: "Seul(e) avec enfants",
    };

    return {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      canton: formData.canton,
      postalCode: formData.postalCode,
      besoins: selectedNeeds.length > 0 ? selectedNeeds.join(", ") : "-",
      assuranceComplementaireActuelle: formData.hasCurrentInsurance ? "Oui" : "Non",
      assureurActuel: formData.currentInsurer || "-",
      clientDepuis: formData.currentSince || "-",
      etatDeSante: healthLabels[formData.healthStatus] || formData.healthStatus || "-",
      situationFamiliale: familyLabels[formData.familySituation] || formData.familySituation,
      dateDeNaissance: birthDate,
    };
  };

  const performSubmit = useCallback(async () => {
    const leadData = prepareLeadData();
    await submitLead(leadData);
    navigate(localizedPath("/merci"), { state: { returnUrl: location.pathname } });
  }, [formData, submitLead, navigate, localizedPath, location.pathname]);

  const { startOtpFlow, otpModalProps } = useOtpFormFlow({
    onOtpVerified: performSubmit,
    getPhone: () => formData.phone,
  });

  const handleSubmit = async () => {
    await startOtpFlow();
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return Object.values(formData.needs).some((v) => v);
      case 2:
        if (formData.hasCurrentInsurance === null) return false;
        if (formData.hasCurrentInsurance && formData.currentInsurer.trim() === "") return false;
        return true;
      case 3:
        return formData.healthStatus !== "";
      case 4:
        return formData.familySituation !== "" && formData.birthDate !== null;
      case 5:
        return formData.canton !== "" && formData.postalCode.replace(/\D/g, "").length >= 4;
      case 6:
        return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
      case 7:
        return isValidEmail(formData.email) && isValidPhone(formData.phone);
      default:
        return true;
    }
  };

  const getStepErrors = (step: number): Record<string, string> => {
    if (step === 6) return getIdentityErrors(formData.firstName, formData.lastName);
    if (step === 7) return getContactErrors(formData.email, formData.phone);
    return {};
  };

  const canProceed = validateStep(currentStep);
  const { notify, notifyDelayed, notifyDelayedLong } = useAutoAdvance(
    currentStep,
    nextStep,
    canProceed,
    isLastStep,
    handleSubmit,
  );
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

  const toggleNeed = (key: keyof ComplementaryFormData["needs"]) => {
    updateFormData({
      needs: { ...formData.needs, [key]: !formData.needs[key] },
    });
  };

  return (
    <>
      <FormContainer
        title="Comparez et optimisez vos assurances complémentaires"
        description="Quelques questions pour trouver la meilleure couverture LCA adaptée à vos besoins."
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
      >
        <div className="mb-3 md:mb-6 text-xs md:text-sm text-red-500 flex items-center gap-1.5">
          <span className="text-red-500 font-bold text-sm md:text-base">*</span>
          <span>{t("forms.requiredFields", "Champs obligatoires")}</span>
        </div>

        {/* Step 1: Besoins (multi-choix) */}
        <FormStep isActive={currentStep === 1}>
          <div className="space-y-4">
            <FormFieldWrapper label="Qu'est-ce qui est important pour vous ? (choix multiples)" required>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {NEEDS_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const checked = formData.needs[opt.key];
                  return (
                    <label
                      key={opt.key}
                      className={cn(
                        "flex items-center gap-3 p-3 sm:p-4 border rounded-lg cursor-pointer transition-all min-h-[52px]",
                        checked
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleNeed(opt.key)}
                      />
                      <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm sm:text-base flex-1 leading-snug">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </FormFieldWrapper>
          </div>
        </FormStep>

        {/* Step 2: Assurance actuelle */}
        <FormStep isActive={currentStep === 2}>
          <div className="space-y-4">
            <FormFieldWrapper label="Avez-vous déjà une assurance complémentaire ?" required>
              <RadioGroup
                value={
                  formData.hasCurrentInsurance === null
                    ? ""
                    : formData.hasCurrentInsurance
                    ? "yes"
                    : "no"
                }
                onValueChange={(value) => {
                  const yes = value === "yes";
                  updateFormData({
                    hasCurrentInsurance: yes,
                    currentInsurer: yes ? formData.currentInsurer : "",
                    currentSince: yes ? formData.currentSince : "",
                  });
                  if (!yes) notify();
                }}
                className="grid grid-cols-2 gap-2.5 sm:gap-3"
              >
                <label className="flex items-center justify-center space-x-2 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer min-h-[52px]">
                  <RadioGroupItem value="yes" id="ci-yes" />
                  <span className="text-base sm:text-lg">Oui</span>
                </label>
                <label className="flex items-center justify-center space-x-2 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer min-h-[52px]">
                  <RadioGroupItem value="no" id="ci-no" />
                  <span className="text-base sm:text-lg">Non</span>
                </label>
              </RadioGroup>
            </FormFieldWrapper>

            {formData.hasCurrentInsurance === true && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormFieldWrapper label="Quel est votre assureur actuel ?" htmlFor="currentInsurer" required>
                  <Input
                    id="currentInsurer"
                    value={formData.currentInsurer}
                    onChange={(e) => {
                      updateFormData({ currentInsurer: e.target.value });
                      notifyDelayedLong();
                    }}
                    placeholder="Ex. Helsana, CSS, SWICA..."
                    className="h-11 sm:h-14 text-base sm:text-lg"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper label="Depuis quelle année ?" htmlFor="currentSince">
                  <Input
                    id="currentSince"
                    type="number"
                    inputMode="numeric"
                    min={1970}
                    max={new Date().getFullYear()}
                    value={formData.currentSince}
                    onChange={(e) => {
                      updateFormData({ currentSince: e.target.value });
                      notifyDelayedLong();
                    }}
                    placeholder="Ex. 2018"
                    className="h-11 sm:h-14 text-base sm:text-lg"
                  />
                </FormFieldWrapper>
              </div>
            )}
          </div>
        </FormStep>

        {/* Step 3: État de santé */}
        <FormStep isActive={currentStep === 3}>
          <div className="space-y-4">
            <FormFieldWrapper label="Êtes-vous en pleine forme ?" required>
              <RadioGroup
                value={formData.healthStatus}
                onValueChange={(value) => {
                  updateFormData({ healthStatus: value });
                  notify();
                }}
                className="grid gap-2.5 sm:gap-3"
              >
                {[
                  { value: "excellent", label: "Oui, excellente forme" },
                  { value: "good", label: "Plutôt en forme" },
                  { value: "average", label: "Moyenne" },
                  { value: "issues", label: "Quelques soucis de santé" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center space-x-2 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer min-h-[52px]"
                  >
                    <RadioGroupItem value={opt.value} id={`hs-${opt.value}`} />
                    <span className="text-base sm:text-lg flex-1">{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </FormFieldWrapper>
          </div>
        </FormStep>

        {/* Step 4: Situation familiale + date de naissance */}
        <FormStep isActive={currentStep === 4}>
          <div className="space-y-4">
            <FormFieldWrapper label="Situation familiale" required>
              <RadioGroup
                value={formData.familySituation}
                onValueChange={(value) => updateFormData({ familySituation: value })}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3"
              >
                {[
                  { value: "single", label: "Seul(e)" },
                  { value: "couple", label: "Couple" },
                  { value: "coupleWithChildren", label: "Couple avec enfants" },
                  { value: "singleWithChildren", label: "Seul(e) avec enfants" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center space-x-2 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer min-h-[52px]"
                  >
                    <RadioGroupItem value={opt.value} id={`fam-${opt.value}`} />
                    <span className="text-base sm:text-lg flex-1">{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </FormFieldWrapper>

            <FormFieldWrapper label="Date de naissance" htmlFor="birthDate" required>
              <DateInput
                value={formData.birthDate}
                onChange={(date) => updateFormData({ birthDate: date })}
              />
            </FormFieldWrapper>
          </div>
        </FormStep>

        {/* Step 5: Localisation */}
        <FormStep isActive={currentStep === 5}>
          <div className="space-y-4">
            <FormFieldWrapper label={t("forms.healthInsurance.canton", "Canton")} required>
              <Select
                value={formData.canton}
                onValueChange={(value) => updateFormData({ canton: value })}
              >
                <SelectTrigger className="h-11 sm:h-14 text-base sm:text-lg">
                  <SelectValue placeholder={t("forms.healthInsurance.selectCanton", "Sélectionnez votre canton")} />
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

            <FormFieldWrapper label={t("forms.healthInsurance.postalCode", "Code postal")} htmlFor="postalCode" required>
              <Input
                id="postalCode"
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={formData.postalCode}
                onChange={(e) => {
                  updateFormData({ postalCode: e.target.value });
                  notifyDelayed();
                }}
                placeholder="1000"
                className="h-11 sm:h-14 text-base sm:text-lg"
              />
            </FormFieldWrapper>
          </div>
        </FormStep>

        {/* Step 6: Identité */}
        <FormStep isActive={currentStep === 6}>
          <div className="space-y-5 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">{t("forms.contact.almostDone", "C'est presque terminé !")}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("forms.contact.nameStepDescription", "Comment pouvons-nous vous appeler ?")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormFieldWrapper label={t("forms.contact.firstName", "Prénom")} htmlFor="firstName" required error={stepErrors.firstName}>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={(e) => {
                    updateFormData({ firstName: e.target.value });
                    notifyDelayedLong();
                  }}
                  className="h-11 sm:h-14 text-base sm:text-lg"
                />
              </FormFieldWrapper>
              <FormFieldWrapper label={t("forms.contact.lastName", "Nom")} htmlFor="lastName" required error={stepErrors.lastName}>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={(e) => {
                    updateFormData({ lastName: e.target.value });
                    notifyDelayedLong();
                  }}
                  className="h-11 sm:h-14 text-base sm:text-lg"
                />
              </FormFieldWrapper>
            </div>
          </div>
        </FormStep>

        {/* Step 7: Contact */}
        <FormStep isActive={currentStep === 7}>
          <div className="space-y-5 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4">
                <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">
                {t("forms.contact.contactStepTitle", "Recevez votre comparatif personnalisé")}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("forms.contact.contactStepDescription", "Un expert vous contacte gratuitement et sans engagement.")}
              </p>
            </div>

            <FormFieldWrapper label={t("forms.contact.email", "Email")} htmlFor="email" required error={stepErrors.email}>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => {
                  updateFormData({ email: e.target.value });
                  notifyDelayed();
                }}
                className={cn("h-11 sm:h-14 text-base sm:text-lg", stepErrors.email && "border-red-400")}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label={t("forms.contact.phone", "Téléphone")} htmlFor="phone" required error={stepErrors.phone}>
              <PhoneInputCH
                id="phone"
                value={formData.phone}
                onChange={(e) => {
                  updateFormData({ phone: formatSwissPhone(e.target.value) });
                  notifyDelayed();
                }}
                placeholder="79 123 45 67"
                hasError={!!stepErrors.phone}
              />
            </FormFieldWrapper>

            <div className="flex items-center gap-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("forms.contact.privacyNote", "Vos données sont protégées et ne seront jamais partagées sans votre accord.")}
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
      <SmsVerificationModal {...otpModalProps} />
    </>
  );
};

export default ComplementaryInsuranceForm;
