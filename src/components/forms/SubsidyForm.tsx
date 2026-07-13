import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import FormContainer from "@/components/forms/FormContainer";
import FormStep from "@/components/forms/FormStep";
import FormNavigation from "@/components/forms/FormNavigation";
import FormFieldWrapper from "@/components/forms/FormField";
import IllustratedChoice from "@/components/forms/IllustratedChoice";
import HouseholdIllustration from "@/components/forms/illustrations/HouseholdIllustrations";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { useLeadSubmission } from "@/hooks/useLeadSubmission";
import { fireLeadConversion, getLastLeadId } from "@/lib/leadTracking";
import { Input } from "@/components/ui/input";
import { PhoneInputCH } from "@/components/forms/PhoneInputCH";
import DateInput from "@/components/ui/date-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, FileText, Lock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";
import { useOtpFormFlow } from "@/hooks/useOtpFormFlow";
import SmsVerificationModal from "@/components/forms/SmsVerificationModal";
import { cn } from "@/lib/utils";

interface SubsidyFormData {
  postalCode: string;
  birthDate: Date | null;
  householdSize: string;
  hasCurrentInsurance: string;
  currentInsurer: string;
  currentDeductible: string;
  incomeRange: string;
  specialSituation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const TOTAL_STEPS = 9;

const SubsidyForm = () => {
  const { t, i18n } = useTranslation();
  const [showResults, setShowResults] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const { attemptedNext, markAttempted, resetAttempted, formatSwissPhone, isValidEmail, isValidPhone, getContactErrors, getIdentityErrors, showValidationToast } = useFormValidation();

  const initialData: SubsidyFormData = {
    postalCode: "",
    birthDate: null,
    householdSize: "",
    hasCurrentInsurance: "",
    currentInsurer: "",
    currentDeductible: "",
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
    goToStep,
    nextStep,
    previousStep,
  } = useMultiStepForm({
    initialData,
    totalSteps: TOTAL_STEPS,
    onSubmit: async (data) => {
      await submitLead(data as unknown as Record<string, unknown>);
    },
  });

  const performSubmit = useCallback(async () => {
    const householdMap: Record<string, string> = {
      single: t("forms.subsidy.household.single"),
      couple: t("forms.subsidy.household.couple"),
      coupleChildren: t("forms.subsidy.household.coupleChildren"),
      singleChildren: t("forms.subsidy.household.singleChildren"),
    };
    const situationMap: Record<string, string> = {
      none: t("forms.subsidy.situations.none"),
      avs: t("forms.subsidy.situations.avs"),
      ai: t("forms.subsidy.situations.ai"),
      student: t("forms.subsidy.situations.student"),
      unemployed: t("forms.subsidy.situations.unemployed"),
    };
    const hasInsuranceMap: Record<string, string> = { yes: t("common.yes"), no: t("common.no") };
    const insurerMap: Record<string, string> = {
      assura: "Assura", css: "CSS", "groupe-mutuel": "Groupe Mutuel", helsana: "Helsana",
      sanitas: "Sanitas", swica: "Swica", visana: "Visana", concordia: "Concordia",
      kpt: "KPT", atupri: "Atupri", sympany: "Sympany", other: t("forms.subsidy.otherInsurer"),
    };
    const translatedData = {
      ...formData,
      householdSize: householdMap[formData.householdSize] ?? formData.householdSize,
      specialSituation: situationMap[formData.specialSituation] ?? formData.specialSituation,
      hasCurrentInsurance: hasInsuranceMap[formData.hasCurrentInsurance] ?? formData.hasCurrentInsurance,
      currentDeductible: formData.currentDeductible ? `CHF ${formData.currentDeductible}` : "-",
      currentInsurer: (insurerMap[formData.currentInsurer] ?? formData.currentInsurer) || "-",
      incomeRange: formData.incomeRange ? `CHF ${formData.incomeRange}` : "-",
    };
    await submitLead(translatedData as unknown as Record<string, unknown>);
    const incomeValue = parseInt(formData.incomeRange) || 0;
    setIsEligible(incomeValue > 0 && incomeValue <= 70000);
    setShowResults(true);
    fireLeadConversion({
      pageKey: "merci-subside",
      leadId: getLastLeadId(),
      googleAdsSendTo: "AW-16586911321/1MwiCK30gpAcENncoOU9",
    });
  }, [formData, submitLead, t]);

  const { startOtpFlow, otpModalProps } = useOtpFormFlow({
    onOtpVerified: performSubmit,
    getPhone: () => formData.phone,
  });

  const handleSubmit = async () => {
    await startOtpFlow();
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: return formData.postalCode.replace(/\D/g, '').length >= 4;
      case 2: return formData.birthDate !== null;
      case 3: return formData.householdSize !== "";
      case 4: return formData.hasCurrentInsurance !== "";
      case 5: return formData.currentInsurer !== "";
      case 6: return formData.incomeRange !== "";
      case 7: return true;
      case 8: return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
      case 9: return isValidEmail(formData.email) && isValidPhone(formData.phone);
      default: return true;
    }
  };

  const getStepErrors = (step: number): Record<string, string> => {
    if (step === 8) return getIdentityErrors(formData.firstName, formData.lastName);
    if (step === 9) return getContactErrors(formData.email, formData.phone);
    return {};
  };

  const canProceed = validateStep(currentStep);

  const handleAdvance = useCallback(() => {
    if (currentStep === 4 && formData.hasCurrentInsurance === "no") {
      goToStep(6);
    } else {
      nextStep();
    }
  }, [currentStep, formData.hasCurrentInsurance, goToStep, nextStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep === 6 && formData.hasCurrentInsurance === "no") {
      goToStep(4);
    } else {
      previousStep();
    }
  }, [currentStep, formData.hasCurrentInsurance, goToStep, previousStep]);

  const { notify, notifyDelayed, notifyDelayedLong } = useAutoAdvance(currentStep, handleAdvance, canProceed, isLastStep, handleSubmit);
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
      handleAdvance();
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
    <>
    <FormContainer
      title={t("forms.subsidy.title")}
      description={t("forms.subsidy.description")}
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      clientName={formData.firstName}
      product="subside"
      guideMessages={[
        t("forms.subsidy.guide.postalStep", { defaultValue: "Vérifions votre droit au subside : commençons par votre code postal." }),
        t("forms.subsidy.guide.birthStep", { defaultValue: "Votre date de naissance, pour situer votre tranche d'âge." }),
        t("forms.subsidy.guide.householdStep", { defaultValue: "Votre foyer détermine le montant de l'aide cantonale possible." }),
        t("forms.subsidy.guide.hasInsuranceStep", { defaultValue: "Êtes-vous déjà assuré ? Cela m'aide à cibler votre situation." }),
        t("forms.subsidy.guide.insurerStep", { defaultValue: "Chez quel assureur êtes-vous, et avec quelle franchise ?" }),
        t("forms.subsidy.guide.incomeStep", { defaultValue: "Vos revenus, en toute discrétion, pour estimer votre subside." }),
        t("forms.subsidy.guide.situationStep", { defaultValue: "Une situation particulière peut augmenter votre droit au subside." }),
        undefined,
        undefined,
      ]}
      navigation={
        <FormNavigation
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onPrevious={handlePrevious}
          onNext={handleNext}
          isSubmitting={isSubmitting}
          isLastStep={isLastStep}
          canProceed={canProceed}
        />
      }
    >
      {/* Step 1: Postal code */}
      <FormStep isActive={currentStep === 1}>
        <FormFieldWrapper label={t("forms.subsidy.postalCode")} htmlFor="postalCode" required>
          <Input
            id="postalCode"
            type="text"
            inputMode="numeric"
            value={formData.postalCode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4);
              updateFormData({ postalCode: val });
              if (val.length === 4) notifyDelayed();
            }}
            placeholder="1000"
            className="h-11 md:h-14 text-sm md:text-lg"
            maxLength={4}
          />
        </FormFieldWrapper>
      </FormStep>

      {/* Step 2: Birth date */}
      <FormStep isActive={currentStep === 2}>
        <FormFieldWrapper label={t("forms.subsidy.birthDate")} htmlFor="birthDate" required>
          <DateInput
            value={formData.birthDate}
            onChange={(date) => { updateFormData({ birthDate: date }); if (date) notify(); }}
            className="h-11 md:h-14 text-sm md:text-lg"
          />
        </FormFieldWrapper>
      </FormStep>

      {/* Step 3: Household composition */}
      <FormStep isActive={currentStep === 3}>
        <FormFieldWrapper label={t("forms.subsidy.householdComposition")} required>
          <IllustratedChoice
            ariaLabel={t("forms.subsidy.householdComposition")}
            value={formData.householdSize}
            onValueChange={(value) => { updateFormData({ householdSize: value }); notify(); }}
            columns={4}
            options={[
              {
                value: "single",
                label: t("forms.subsidy.household.single"),
                illustration: <HouseholdIllustration type="single" />,
              },
              {
                value: "couple",
                label: t("forms.subsidy.household.couple"),
                illustration: <HouseholdIllustration type="couple" />,
              },
              {
                value: "coupleChildren",
                label: t("forms.subsidy.household.coupleChildren"),
                illustration: <HouseholdIllustration type="coupleWithChildren" />,
              },
              {
                value: "singleChildren",
                label: t("forms.subsidy.household.singleChildren"),
                illustration: <HouseholdIllustration type="singleWithChildren" />,
              },
            ]}
          />
        </FormFieldWrapper>
      </FormStep>

      {/* Step 4: Current insurance yes/no */}
      <FormStep isActive={currentStep === 4}>
        <FormFieldWrapper label={t("forms.subsidy.hasCurrentInsurance")} required>
          <RadioGroup
            value={formData.hasCurrentInsurance}
            onValueChange={(value) => {
              updateFormData({
                hasCurrentInsurance: value,
                currentInsurer: value === "no" ? "" : formData.currentInsurer,
                currentDeductible: value === "no" ? "" : formData.currentDeductible,
              });
              notify();
            }}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { value: "yes", label: t("common.yes") },
              { value: "no", label: t("common.no") },
            ].map((option) => (
              <label key={option.value} htmlFor={`insurance-${option.value}`} className={cn("flex items-center space-x-2 p-3 md:p-4 border-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-all", formData.hasCurrentInsurance === option.value && "border-primary bg-primary/5")}>
                <RadioGroupItem value={option.value} id={`insurance-${option.value}`} />
                <span className="flex-1 text-sm md:text-lg">{option.label}</span>
              </label>
            ))}
          </RadioGroup>
        </FormFieldWrapper>
      </FormStep>

      {/* Step 5: Current insurer & deductible (conditional) */}
      <FormStep isActive={currentStep === 5}>
        <div className="space-y-3">
          <FormFieldWrapper label={t("forms.subsidy.currentInsurer")} htmlFor="currentInsurer" required>
            <select
              id="currentInsurer"
              value={formData.currentInsurer}
              onChange={(e) => updateFormData({ currentInsurer: e.target.value })}
              className="flex h-11 md:h-14 w-full items-center justify-between rounded-xl border-2 border-input bg-white text-gray-900 px-4 text-sm md:text-lg ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-primary/50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_1rem_center] bg-no-repeat pr-10"
            >
              <option value="" disabled>{t("forms.subsidy.selectInsurer")}</option>
              <option value="assura">Assura</option>
              <option value="css">CSS</option>
              <option value="groupe-mutuel">Groupe Mutuel</option>
              <option value="helsana">Helsana</option>
              <option value="sanitas">Sanitas</option>
              <option value="swica">Swica</option>
              <option value="visana">Visana</option>
              <option value="concordia">Concordia</option>
              <option value="kpt">KPT</option>
              <option value="atupri">Atupri</option>
              <option value="sympany">Sympany</option>
              <option value="other">{t("forms.subsidy.otherInsurer")}</option>
            </select>
          </FormFieldWrapper>

          <FormFieldWrapper label={t("forms.subsidy.currentDeductible")} htmlFor="currentDeductible">
            <select
              id="currentDeductible"
              value={formData.currentDeductible}
              onChange={(e) => updateFormData({ currentDeductible: e.target.value })}
              className="flex h-11 md:h-14 w-full items-center justify-between rounded-xl border-2 border-input bg-white text-gray-900 px-4 text-sm md:text-lg ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-primary/50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_1rem_center] bg-no-repeat pr-10"
            >
              <option value="" disabled>{t("forms.subsidy.selectDeductible")}</option>
              <option value="300">CHF 300</option>
              <option value="500">CHF 500</option>
              <option value="1000">CHF 1'000</option>
              <option value="1500">CHF 1'500</option>
              <option value="2000">CHF 2'000</option>
              <option value="2500">CHF 2'500</option>
            </select>
          </FormFieldWrapper>
        </div>
      </FormStep>

      {/* Step 6: Income */}
      <FormStep isActive={currentStep === 6}>
        <FormFieldWrapper label={t("forms.subsidy.incomeRange")} htmlFor="incomeRange" required>
          <Input
            id="incomeRange"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={formData.incomeRange}
            onChange={(e) => { updateFormData({ incomeRange: e.target.value.replace(/\D/g, '') }); notifyDelayed(); }}
            placeholder="65000"
            className="h-11 md:h-14 text-sm md:text-lg"
          />
        </FormFieldWrapper>
      </FormStep>

      {/* Step 7: Special situation */}
      <FormStep isActive={currentStep === 7}>
        <FormFieldWrapper label={t("forms.subsidy.specialSituation")}>
          <RadioGroup
            value={formData.specialSituation}
            onValueChange={(value) => { updateFormData({ specialSituation: value }); notify(); }}
            className="grid gap-3"
          >
            {[
              { value: "none", label: t("forms.subsidy.situations.none") },
              { value: "avs", label: t("forms.subsidy.situations.avs") },
              { value: "ai", label: t("forms.subsidy.situations.ai") },
              { value: "student", label: t("forms.subsidy.situations.student") },
              { value: "unemployed", label: t("forms.subsidy.situations.unemployed") },
            ].map((situation) => (
              <label key={situation.value} htmlFor={situation.value} className="flex items-center space-x-2 p-3 md:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value={situation.value} id={situation.value} />
                <span className="flex-1 text-sm md:text-lg">
                  {situation.label}
                </span>
              </label>
            ))}
          </RadioGroup>
        </FormFieldWrapper>
      </FormStep>

      {/* Step 8: Identity */}
      <FormStep isActive={currentStep === 8}>
        <div className="space-y-4 md:space-y-6">
          <div className="hidden text-center mb-3 md:mb-6">
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
                onChange={(e) => { updateFormData({ firstName: e.target.value }); notifyDelayedLong(); }}
                className="h-11 md:h-14 text-sm md:text-lg"
              />
            </FormFieldWrapper>
            <FormFieldWrapper label={t("forms.contact.lastName")} htmlFor="lastName" required>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => { updateFormData({ lastName: e.target.value }); notifyDelayedLong(); }}
                className="h-11 md:h-14 text-sm md:text-lg"
              />
            </FormFieldWrapper>
          </div>
        </div>
      </FormStep>

      {/* Step 9: Contact */}
      <FormStep isActive={currentStep === 9}>
        <div className="space-y-4 md:space-y-6">
          <div className="hidden text-center mb-3 md:mb-6">
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
            <PhoneInputCH
              id="phone"
              value={formData.phone}
              onChange={(e) => { updateFormData({ phone: formatSwissPhone(e.target.value) }); notifyDelayed(); }}
              placeholder="79 123 45 67" hasError={!!stepErrors.phone}
            />
          </FormFieldWrapper>

          <div className="flex items-center gap-2 p-3 md:p-4 bg-muted/50 rounded-lg">
            <Lock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
            <p className="text-xs md:text-sm text-muted-foreground">{t("forms.contact.privacyNote")}</p>
          </div>
        </div>
      </FormStep>
    </FormContainer>
    <SmsVerificationModal {...otpModalProps} />
    </>
  );
};

export default SubsidyForm;
