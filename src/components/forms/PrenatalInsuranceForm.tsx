import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import FormContainer from "@/components/forms/FormContainer";
import FormStep from "@/components/forms/FormStep";
import FormNavigation from "@/components/forms/FormNavigation";
import FormFieldWrapper from "@/components/forms/FormField";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { useLeadSubmission } from "@/hooks/useLeadSubmission";
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
import { User, Phone, Baby } from "lucide-react";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";
import { useOtpFormFlow } from "@/hooks/useOtpFormFlow";
import SmsVerificationModal from "@/components/forms/SmsVerificationModal";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import { cn } from "@/lib/utils";

interface PrenatalFormData {
  dueDate: Date | null;
  canton: string;
  postalCode: string;
  coverageLevel: string;
  lamalModel: string;
  childDeductible: string;
  childDental: string;
  motherHasInsurance: string;
  motherInsurer: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const TOTAL_STEPS = 5;

const PrenatalInsuranceForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();
  const {
    attemptedNext,
    markAttempted,
    resetAttempted,
    isValidEmail,
    isValidPhone,
    getContactErrors,
    getIdentityErrors,
    showValidationToast,
  } = useFormValidation();

  const initialData: PrenatalFormData = {
    dueDate: null,
    canton: "",
    postalCode: "",
    coverageLevel: "",
    lamalModel: "standard",
    childDeductible: "0",
    childDental: "",
    motherHasInsurance: "",
    motherInsurer: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  };

  const { submitLead, isSubmitting } = useLeadSubmission({
    formType: "prenatal-insurance",
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
    onSubmit: async () => {},
  });

  const performSubmit = useCallback(async () => {
    const coverageMap: Record<string, string> = {
      basic: t("forms.prenatal.coverage.basic"),
      premium: t("forms.prenatal.coverage.premium"),
      diamond: t("forms.prenatal.coverage.diamond"),
    };
    const modelMap: Record<string, string> = {
      "family-doctor": t("forms.healthInsurance.models.familyDoctor"),
      hmo: t("forms.prenatal.models.careNetwork", "Réseau de soins"),
      telmed: t("forms.healthInsurance.models.telemedicine"),
      standard: t("forms.healthInsurance.models.standard"),
    };
    const yesNoMap: Record<string, string> = { yes: t("common.yes"), no: t("common.no") };
    const insurerMap: Record<string, string> = {
      assura: "Assura", css: "CSS", "groupe-mutuel": "Groupe Mutuel", helsana: "Helsana",
      sanitas: "Sanitas", swica: "Swica", visana: "Visana", concordia: "Concordia",
      kpt: "KPT", atupri: "Atupri", sympany: "Sympany", other: t("forms.subsidy.otherInsurer"),
    };
    const translated = {
      ...formData,
      coverageLevel: coverageMap[formData.coverageLevel] ?? formData.coverageLevel,
      lamalModel: modelMap[formData.lamalModel] ?? formData.lamalModel,
      childDeductible: `CHF ${formData.childDeductible}`,
      childDental: yesNoMap[formData.childDental] ?? formData.childDental,
      motherHasInsurance: yesNoMap[formData.motherHasInsurance] ?? formData.motherHasInsurance,
      motherInsurer: (insurerMap[formData.motherInsurer] ?? formData.motherInsurer) || "-",
    };
    await submitLead(translated as unknown as Record<string, unknown>);
    navigate(localizedPath("/merci-prenatale"));
  }, [formData, submitLead, t, navigate, localizedPath]);

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
        return (
          formData.dueDate !== null &&
          formData.canton !== "" &&
          formData.postalCode.replace(/\D/g, "").length >= 4
        );
      case 2:
        return formData.coverageLevel !== "";
      case 3:
        return formData.motherHasInsurance !== "";
      case 4:
        return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
      case 5:
        return isValidEmail(formData.email) && isValidPhone(formData.phone);
      default:
        return true;
    }
  };

  const getStepErrors = (step: number): Record<string, string> => {
    if (step === 4) return getIdentityErrors(formData.firstName, formData.lastName);
    if (step === 5) return getContactErrors(formData.email, formData.phone);
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
    if (isLastStep) handleSubmit();
    else nextStep();
  };

  const cantons = [
    "AG", "AI", "AR", "BE", "BL", "BS", "FR", "GE", "GL", "GR",
    "JU", "LU", "NE", "NW", "OW", "SG", "SH", "SO", "SZ", "TG",
    "TI", "UR", "VD", "VS", "ZG", "ZH",
  ];

  return (
    <>
      <FormContainer
        title={t("forms.prenatal.title")}
        description={t("forms.prenatal.description")}
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
      >
        {/* Step 1: Due date + canton + postal code */}
        <FormStep isActive={currentStep === 1}>
          <div className="space-y-3">
            <div className="text-center mb-3">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 mb-2">
                <Baby className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <h3 className="text-base md:text-xl font-semibold">
                {t("forms.prenatal.babyOnTheWay")}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                {t("forms.prenatal.babyOnTheWayDesc")}
              </p>
            </div>

            <FormFieldWrapper label={t("forms.prenatal.dueDate")} htmlFor="dueDate" required>
              <DateInput
                value={formData.dueDate}
                onChange={(date) => {
                  updateFormData({ dueDate: date });
                  if (date) notify();
                }}
                className="h-11 md:h-14 text-sm md:text-lg"
              />
            </FormFieldWrapper>

            <FormFieldWrapper label={t("forms.prenatal.canton")} required>
              <Select
                value={formData.canton}
                onValueChange={(value) => {
                  updateFormData({ canton: value });
                  notifyDelayed();
                }}
              >
                <SelectTrigger className="h-11 md:h-14 text-sm md:text-lg">
                  <SelectValue placeholder={t("forms.prenatal.selectCanton")} />
                </SelectTrigger>
                <SelectContent>
                  {cantons.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormFieldWrapper>

            <FormFieldWrapper label={t("forms.prenatal.postalCode")} htmlFor="postalCode" required>
              <Input
                id="postalCode"
                type="text"
                inputMode="numeric"
                value={formData.postalCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  updateFormData({ postalCode: val });
                  if (val.length === 4) notifyDelayed();
                }}
                placeholder="1000"
                className="h-11 md:h-14 text-sm md:text-lg"
                maxLength={4}
              />
            </FormFieldWrapper>
          </div>
        </FormStep>

        {/* Step 2: Coverage choice */}
        <FormStep isActive={currentStep === 2}>
          <div className="space-y-3">
            <FormFieldWrapper label={t("forms.prenatal.coverageLevel")} required>
              <RadioGroup
                value={formData.coverageLevel}
                onValueChange={(value) => updateFormData({ coverageLevel: value })}
                className="grid gap-3"
              >
                {[
                  { value: "basic", label: t("forms.prenatal.coverage.basic"), desc: t("forms.prenatal.coverage.basicDesc") },
                  { value: "premium", label: t("forms.prenatal.coverage.premium"), desc: t("forms.prenatal.coverage.premiumDesc") },
                  { value: "diamond", label: t("forms.prenatal.coverage.diamond"), desc: t("forms.prenatal.coverage.diamondDesc") },
                ].map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`coverage-${option.value}`}
                    className={cn(
                      "flex items-start space-x-3 p-3 md:p-4 border-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-all",
                      formData.coverageLevel === option.value && "border-primary bg-primary/5",
                    )}
                  >
                    <RadioGroupItem value={option.value} id={`coverage-${option.value}`} className="mt-1" />
                    <div className="flex-1">
                      <p className="text-sm md:text-lg font-semibold">{option.label}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </FormFieldWrapper>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormFieldWrapper label={t("forms.prenatal.lamalModel", "Modèle LAMal souhaité")} required>
                <Select
                  value={formData.lamalModel}
                  onValueChange={(value) => updateFormData({ lamalModel: value })}
                >
                  <SelectTrigger className="h-11 md:h-14 text-sm md:text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">{t("forms.healthInsurance.models.standard")}</SelectItem>
                    <SelectItem value="family-doctor">{t("forms.healthInsurance.models.familyDoctor")}</SelectItem>
                    <SelectItem value="hmo">{t("forms.healthInsurance.models.hmo")}</SelectItem>
                    <SelectItem value="telmed">{t("forms.healthInsurance.models.telemedicine")}</SelectItem>
                  </SelectContent>
                </Select>
              </FormFieldWrapper>

              <FormFieldWrapper
                label={t("forms.prenatal.childDeductible", "Franchise enfant (CHF)")}
                required
              >
                <Select
                  value={formData.childDeductible}
                  onValueChange={(value) => updateFormData({ childDeductible: value })}
                >
                  <SelectTrigger className="h-11 md:h-14 text-sm md:text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["0", "100", "200", "300", "400", "500", "600"].map((v) => (
                      <SelectItem key={v} value={v}>
                        CHF {v}
                        {v === "0" && ` — ${t("forms.prenatal.childDeductibleDefault", "recommandé pour bébé")}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormFieldWrapper>
            </div>

            <FormFieldWrapper label={t("forms.prenatal.childDental")}>
              <RadioGroup
                value={formData.childDental}
                onValueChange={(value) => updateFormData({ childDental: value })}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { value: "yes", label: t("common.yes") },
                  { value: "no", label: t("common.no") },
                ].map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`dent-${option.value}`}
                    className={cn(
                      "flex items-center space-x-2 p-3 md:p-4 border-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-all",
                      formData.childDental === option.value && "border-primary bg-primary/5",
                    )}
                  >
                    <RadioGroupItem value={option.value} id={`dent-${option.value}`} />
                    <span className="flex-1 text-sm md:text-lg">{option.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </FormFieldWrapper>
          </div>
        </FormStep>

        {/* Step 3: Mother's current insurance */}
        <FormStep isActive={currentStep === 3}>
          <div className="space-y-3">
            <FormFieldWrapper label={t("forms.prenatal.motherHasInsurance")} required>
              <RadioGroup
                value={formData.motherHasInsurance}
                onValueChange={(value) => {
                  updateFormData({
                    motherHasInsurance: value,
                    motherInsurer: value === "no" ? "" : formData.motherInsurer,
                  });
                }}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { value: "yes", label: t("common.yes") },
                  { value: "no", label: t("common.no") },
                ].map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`mother-${option.value}`}
                    className={cn(
                      "flex items-center space-x-2 p-3 md:p-4 border-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-all",
                      formData.motherHasInsurance === option.value && "border-primary bg-primary/5",
                    )}
                  >
                    <RadioGroupItem value={option.value} id={`mother-${option.value}`} />
                    <span className="flex-1 text-sm md:text-lg">{option.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </FormFieldWrapper>

            {formData.motherHasInsurance === "yes" && (
              <FormFieldWrapper label={t("forms.prenatal.motherInsurer")} htmlFor="motherInsurer">
                <Select
                  value={formData.motherInsurer}
                  onValueChange={(value) => updateFormData({ motherInsurer: value })}
                >
                  <SelectTrigger className="h-11 md:h-14 text-sm md:text-lg">
                    <SelectValue placeholder={t("forms.subsidy.selectInsurer")} />
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
                    <SelectItem value="other">{t("forms.subsidy.otherInsurer")}</SelectItem>
                  </SelectContent>
                </Select>
              </FormFieldWrapper>
            )}
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
              <p className="text-sm md:text-base text-muted-foreground">
                {t("forms.contact.nameStepDescription")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <FormFieldWrapper label={t("forms.contact.firstName")} htmlFor="firstName" required error={stepErrors.firstName}>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => {
                    updateFormData({ firstName: e.target.value });
                    notifyDelayedLong();
                  }}
                  className="h-11 md:h-14 text-sm md:text-lg"
                />
              </FormFieldWrapper>
              <FormFieldWrapper label={t("forms.contact.lastName")} htmlFor="lastName" required error={stepErrors.lastName}>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => {
                    updateFormData({ lastName: e.target.value });
                    notifyDelayedLong();
                  }}
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
              <h3 className="text-base md:text-xl font-semibold">{t("forms.contact.howToContact")}</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                {t("forms.contact.contactStepDescription")}
              </p>
            </div>

            <FormFieldWrapper label={t("forms.contact.email")} htmlFor="email" required error={stepErrors.email}>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  updateFormData({ email: e.target.value });
                  notifyDelayedLong();
                }}
                placeholder="exemple@email.ch"
                className="h-11 md:h-14 text-sm md:text-lg"
              />
            </FormFieldWrapper>

            <FormFieldWrapper label={t("forms.contact.phone")} htmlFor="phone" required error={stepErrors.phone}>
              <PhoneInputCH
                id="phone"
                value={formData.phone}
                onChange={(e) => {
                  updateFormData({ phone: e.target.value });
                  notifyDelayedLong();
                }}
              />

            </FormFieldWrapper>
          </div>
        </FormStep>

        <FormNavigation
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onNext={handleNext}
          onPrevious={previousStep}
          isLastStep={isLastStep}
          isSubmitting={isSubmitting}
          canProceed={true}
        />
      </FormContainer>

      <SmsVerificationModal {...otpModalProps} />
    </>
  );
};

export default PrenatalInsuranceForm;
