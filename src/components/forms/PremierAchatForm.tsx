import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import { useLeadSubmission } from "@/hooks/useLeadSubmission";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormFieldWrapper from "@/components/forms/FormField";
import FormStep from "@/components/forms/FormStep";
import FormProgress from "@/components/forms/FormProgress";
import FormGuide from "@/components/forms/FormGuide";
import FormNavigation from "@/components/forms/FormNavigation";
import { PhoneInputCH } from "@/components/forms/PhoneInputCH";
import LocalizedLink from "@/components/LocalizedLink";
import { swissCantons, getCantonName } from "@/data/swissCantons";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------------
// PremierAchatForm — "Plan d'action propriétaire" en tunnel guidé multi-étapes.
//   • 1 question par écran, mascotte Optimis qui accompagne, barre de progression.
//   • Même backend que la version single-écran : formType "premier-achat",
//     même règle de distribution (âge > 63 / non-locataire / revenu < 6'000),
//     `age` numérique brut, tags statutDistribution/motifNonDistribution,
//     consentement nLPD bloquant. Aucune modification edge nécessaire.
// ----------------------------------------------------------------------------

interface PremierAchatFormData {
  isRenter: string; // "yes" | "no"
  purchaseHorizon: string; // "soon" | "1-3-years" | "exploring"
  incomeRange: string; // "less-6000" | "6000-8000" | "more-8000"
  hasSavings: string; // "yes" | "no" | "unsure"
  canton: string;
  postalCode: string;
  birthYear: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const initialData: PremierAchatFormData = {
  isRenter: "",
  purchaseHorizon: "",
  incomeRange: "",
  hasSavings: "",
  canton: "",
  postalCode: "",
  birthYear: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

const TOTAL_STEPS = 8;
const CURRENT_YEAR = new Date().getFullYear();

/** Boutons de choix empilés (pleine largeur) — lisibles dans une carte étroite. */
const ChoiceButtons = ({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel?: string;
}) => (
  <div role="radiogroup" aria-label={ariaLabel} className="grid gap-2.5">
    {options.map((opt) => {
      const selected = value === opt.value;
      return (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={selected}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex items-center rounded-xl border-2 px-4 py-3.5 text-left text-sm md:text-base font-medium transition-all duration-200",
            selected
              ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20 shadow-sm"
              : "border-border bg-white hover:border-primary/50 text-foreground",
          )}
        >
          <span className="flex-1">{opt.label}</span>
        </button>
      );
    })}
  </div>
);

const PremierAchatForm = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();
  const {
    isValidEmail,
    isValidPhone,
    formatSwissPhone,
    getContactErrors,
    getIdentityErrors,
    attemptedNext,
    markAttempted,
    resetAttempted,
    showValidationToast,
  } = useFormValidation();

  const [consent, setConsent] = useState(false);

  const { submitLead } = useLeadSubmission({ formType: "premier-achat" });

  // Cantons triés par libellé localisé (les 26 acceptés pour ne perdre aucun lead)
  const cantons = useMemo(
    () =>
      [...swissCantons].sort((a, b) =>
        getCantonName(a.code, i18n.language).localeCompare(getCantonName(b.code, i18n.language)),
      ),
    [i18n.language],
  );

  const isValidBirthYear = useCallback((raw: string) => {
    const year = parseInt(raw, 10);
    return /^\d{4}$/.test(raw) && year >= 1930 && year <= CURRENT_YEAR - 18;
  }, []);

  const doSubmit = useCallback(
    async (data: PremierAchatFormData) => {
      // --- Règle de distribution Optimis, taggée dans le payload ---
      const age = CURRENT_YEAR - parseInt(data.birthYear, 10);
      let motif = "";
      if (age > 63) motif = "Âge > 63 ans";
      else if (data.isRenter === "no") motif = "Non locataire";
      else if (data.incomeRange === "less-6000") motif = "Revenu < 6'000 CHF/mois";
      const distribuable = motif === "";

      const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone,
        email: data.email.trim(),
        canton: data.canton,
        postalCode: data.postalCode.trim(),
        isRenter: data.isRenter,
        incomeRange: data.incomeRange,
        birthYear: data.birthYear,
        // Clé technique brute (lue par l'edge + trigger pour la colonne `age`)
        age,
        purchaseHorizon: data.purchaseHorizon,
        hasSavings: data.hasSavings,
        statutDistribution: distribuable ? "Distribuable" : "Non distribuable",
        motifNonDistribution: motif,
      };

      const result = await submitLead(payload as unknown as Record<string, unknown>);
      if (result) {
        navigate(localizedPath("/merci"));
      }
    },
    [submitLead, navigate, localizedPath],
  );

  const {
    currentStep,
    formData,
    isLastStep,
    isSubmitting,
    updateFormData,
    nextStep,
    previousStep,
    handleSubmit,
  } = useMultiStepForm<PremierAchatFormData>({
    initialData,
    totalSteps: TOTAL_STEPS,
    onSubmit: doSubmit,
  });

  const incomeOptions = [
    { value: "less-6000", label: t("forms.premierAchat.incomeLess6000", "Moins de 6'000 CHF") },
    { value: "6000-8000", label: t("forms.premierAchat.income6000to8000", "6'000 – 8'000 CHF") },
    { value: "more-8000", label: t("forms.premierAchat.incomeMore8000", "Plus de 8'000 CHF") },
  ];

  const horizonOptions = [
    { value: "soon", label: t("forms.premierAchat.horizonSoon", "D'ici 1 an") },
    { value: "1-3-years", label: t("forms.premierAchat.horizon1to3", "Dans 1 à 3 ans") },
    { value: "exploring", label: t("forms.premierAchat.horizonExploring", "Je me renseigne") },
  ];

  const savingsOptions = [
    { value: "yes", label: t("forms.premierAchat.savingsYes", "Oui") },
    { value: "no", label: t("forms.premierAchat.savingsNo", "Non") },
    { value: "unsure", label: t("forms.premierAchat.savingsUnsure", "Je ne sais pas") },
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: return formData.isRenter !== "";
      case 2: return formData.purchaseHorizon !== "";
      case 3: return formData.incomeRange !== "";
      case 4: return formData.hasSavings !== "";
      case 5: return formData.canton !== "";
      case 6: return isValidBirthYear(formData.birthYear);
      case 7: return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
      case 8: return isValidEmail(formData.email) && isValidPhone(formData.phone) && consent;
      default: return true;
    }
  };

  const getStepErrors = (step: number): Record<string, string> => {
    if (step === 6 && !isValidBirthYear(formData.birthYear))
      return { birthYear: t("forms.premierAchat.birthYearError", "Année de naissance non valide") };
    if (step === 7) return getIdentityErrors(formData.firstName, formData.lastName);
    if (step === 8) return getContactErrors(formData.email, formData.phone);
    return {};
  };

  const canProceed = validateStep(currentStep);
  const { notify, notifyDelayed, notifyDelayedLong } = useAutoAdvance(
    currentStep,
    nextStep,
    canProceed,
    isLastStep,
    () => handleSubmit(),
  );
  const stepErrors = attemptedNext ? getStepErrors(currentStep) : {};
  const consentError = attemptedNext && currentStep === 8 && !consent
    ? t("forms.premierAchat.consentError", "Merci d'accepter pour continuer.")
    : undefined;

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

  const guideMessages = [
    t("forms.premierAchat.guide.renter", "Première étape vers ton chez-toi : es-tu locataire aujourd'hui ?"),
    t("forms.premierAchat.guide.horizon", "On avance ! À quel horizon te vois-tu propriétaire ?"),
    t("forms.premierAchat.guide.income", "Ça m'aide à bâtir ton plan : quel est le revenu du ménage ?"),
    t("forms.premierAchat.guide.savings", "As-tu déjà mis un peu de côté ? Aucun souci si ce n'est pas encore le cas."),
    t("forms.premierAchat.guide.canton", "Dans quel canton rêves-tu de poser tes valises ?"),
    t("forms.premierAchat.guide.birthYear", "Encore une info sur ton profil, puis on prépare ton plan."),
    t("forms.premierAchat.guide.identity", "Enchanté ! Comment dois-je t'appeler ?"),
    t("forms.premierAchat.guide.contact", "Ton plan d'action est prêt : laisse-moi tes coordonnées pour te l'envoyer."),
  ];

  return (
    <div className="space-y-4">
      {/* Mascotte accompagnante */}
      <FormGuide
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        clientName={formData.firstName}
        messages={guideMessages}
        product="immobilier"
        variant="bar"
      />

      {/* Progression */}
      <FormProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      {/* Zone questions (1 par étape) */}
      <div className="min-h-[190px]">
        {/* Étape 1 : locataire ? */}
        <FormStep isActive={currentStep === 1}>
          <FormFieldWrapper label={t("forms.premierAchat.isRenterLabel", "Êtes-vous actuellement locataire ?")} required>
            <ChoiceButtons
              value={formData.isRenter}
              onChange={(v) => { updateFormData({ isRenter: v }); notify(); }}
              ariaLabel={t("forms.premierAchat.isRenterLabel", "Êtes-vous actuellement locataire ?")}
              options={[
                { value: "yes", label: t("common.yes") },
                { value: "no", label: t("common.no") },
              ]}
            />
          </FormFieldWrapper>
        </FormStep>

        {/* Étape 2 : horizon d'achat */}
        <FormStep isActive={currentStep === 2}>
          <FormFieldWrapper label={t("forms.premierAchat.horizonLabel", "Quand souhaitez-vous acheter ?")} required>
            <ChoiceButtons
              value={formData.purchaseHorizon}
              onChange={(v) => { updateFormData({ purchaseHorizon: v }); notify(); }}
              ariaLabel={t("forms.premierAchat.horizonLabel", "Quand souhaitez-vous acheter ?")}
              options={horizonOptions}
            />
          </FormFieldWrapper>
        </FormStep>

        {/* Étape 3 : revenu du ménage */}
        <FormStep isActive={currentStep === 3}>
          <FormFieldWrapper label={t("forms.premierAchat.incomeLabel", "Revenu mensuel brut du ménage")} required>
            <ChoiceButtons
              value={formData.incomeRange}
              onChange={(v) => { updateFormData({ incomeRange: v }); notify(); }}
              ariaLabel={t("forms.premierAchat.incomeLabel", "Revenu mensuel brut du ménage")}
              options={incomeOptions}
            />
          </FormFieldWrapper>
        </FormStep>

        {/* Étape 4 : épargne en cours */}
        <FormStep isActive={currentStep === 4}>
          <FormFieldWrapper label={t("forms.premierAchat.savingsLabel", "Avez-vous déjà une épargne en cours ?")} required>
            <ChoiceButtons
              value={formData.hasSavings}
              onChange={(v) => { updateFormData({ hasSavings: v }); notify(); }}
              ariaLabel={t("forms.premierAchat.savingsLabel", "Avez-vous déjà une épargne en cours ?")}
              options={savingsOptions}
            />
          </FormFieldWrapper>
        </FormStep>

        {/* Étape 5 : canton (+ NPA facultatif) */}
        <FormStep isActive={currentStep === 5}>
          <div className="space-y-3 md:space-y-4">
            <FormFieldWrapper label={t("forms.healthInsurance.canton")} required>
              <Select value={formData.canton} onValueChange={(v) => { updateFormData({ canton: v }); notify(); }}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={t("forms.healthInsurance.selectCanton")} />
                </SelectTrigger>
                <SelectContent>
                  {cantons.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {getCantonName(c.code, i18n.language)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormFieldWrapper>

            <FormFieldWrapper
              label={t("forms.healthInsurance.postalCode")}
              htmlFor="pa-npa"
              helpText={t("forms.premierAchat.optional", "Facultatif")}
            >
              <Input
                id="pa-npa"
                inputMode="numeric"
                autoComplete="postal-code"
                value={formData.postalCode}
                onChange={(e) => updateFormData({ postalCode: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                placeholder="1000"
                className="h-12"
              />
            </FormFieldWrapper>
          </div>
        </FormStep>

        {/* Étape 6 : année de naissance */}
        <FormStep isActive={currentStep === 6}>
          <FormFieldWrapper
            label={t("forms.premierAchat.birthYearLabel", "Année de naissance")}
            htmlFor="pa-birthYear"
            required
            error={stepErrors.birthYear}
          >
            <Input
              id="pa-birthYear"
              inputMode="numeric"
              value={formData.birthYear}
              onChange={(e) => { updateFormData({ birthYear: e.target.value.replace(/\D/g, "").slice(0, 4) }); notifyDelayed(); }}
              placeholder="1985"
              className={cn("h-12", stepErrors.birthYear && "border-red-400")}
            />
          </FormFieldWrapper>
        </FormStep>

        {/* Étape 7 : identité */}
        <FormStep isActive={currentStep === 7}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormFieldWrapper label={t("forms.contact.firstName")} htmlFor="pa-firstName" required error={stepErrors.firstName}>
              <Input
                id="pa-firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={(e) => { updateFormData({ firstName: e.target.value }); notifyDelayedLong(); }}
                className={cn("h-12", stepErrors.firstName && "border-red-400")}
              />
            </FormFieldWrapper>
            <FormFieldWrapper label={t("forms.contact.lastName")} htmlFor="pa-lastName" required error={stepErrors.lastName}>
              <Input
                id="pa-lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={(e) => { updateFormData({ lastName: e.target.value }); notifyDelayedLong(); }}
                className={cn("h-12", stepErrors.lastName && "border-red-400")}
              />
            </FormFieldWrapper>
          </div>
        </FormStep>

        {/* Étape 8 : coordonnées + consentement */}
        <FormStep isActive={currentStep === 8}>
          <div className="space-y-4">
            <FormFieldWrapper
              label={t("forms.contact.phone")}
              htmlFor="pa-phone"
              required
              error={stepErrors.phone}
              helpText={t("forms.premierAchat.phoneHelp", "C'est par téléphone que votre conseiller vous rappelle gratuitement.")}
            >
              <PhoneInputCH
                id="pa-phone"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: formatSwissPhone(e.target.value) })}
                placeholder="79 123 45 67"
                hasError={!!stepErrors.phone}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label={t("forms.contact.email")} htmlFor="pa-email" required error={stepErrors.email}>
              <Input
                id="pa-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                className={cn("h-12", stepErrors.email && "border-red-400")}
              />
            </FormFieldWrapper>

            {/* Consentement nLPD/RGPD (bloquant) */}
            <div>
              <div className="flex items-start gap-3 rounded-xl border-2 border-border bg-muted/30 p-4">
                <Checkbox
                  id="pa-consent"
                  checked={consent}
                  onCheckedChange={(c) => setConsent(c === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="pa-consent" className="text-xs md:text-sm text-muted-foreground font-normal leading-relaxed cursor-pointer">
                  {t("forms.premierAchat.consentPre", "J'accepte d'être recontacté(e) et que mes données soient traitées conformément à la")}{" "}
                  <LocalizedLink to="/politique-de-confidentialite" className="text-primary underline underline-offset-2" target="_blank">
                    {t("forms.premierAchat.consentLinkText", "politique de confidentialité")}
                  </LocalizedLink>
                  {t("forms.premierAchat.consentPost", ".")}
                </Label>
              </div>
              {consentError && <p className="mt-1 text-xs md:text-sm text-red-500">{consentError}</p>}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              <span>{t("forms.premierAchat.privacyNote", "Vos données restent confidentielles et ne servent qu'à préparer votre plan.")}</span>
            </div>
          </div>
        </FormStep>
      </div>

      {/* Navigation épinglée */}
      <FormNavigation
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onPrevious={previousStep}
        onNext={handleNext}
        isSubmitting={isSubmitting}
        isLastStep={isLastStep}
        canProceed={canProceed}
        lastStepLabel={t("forms.premierAchat.submit", "Recevoir mon plan gratuit")}
      />
    </div>
  );
};

export default PremierAchatForm;
