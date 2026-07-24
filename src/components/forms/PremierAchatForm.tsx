import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock, ShieldCheck, Loader2 } from "lucide-react";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import { useLeadSubmission } from "@/hooks/useLeadSubmission";
import { useFormValidation } from "@/hooks/useFormValidation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormFieldWrapper from "@/components/forms/FormField";
import { PhoneInputCH } from "@/components/forms/PhoneInputCH";
import LocalizedLink from "@/components/LocalizedLink";
import { swissCantons, getCantonName } from "@/data/swissCantons";
import { cn } from "@/lib/utils";

interface PremierAchatFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  canton: string;
  postalCode: string;
  isRenter: string; // "yes" | "no"
  incomeRange: string; // "less-6000" | "6000-8000" | "more-8000"
  birthYear: string;
  purchaseHorizon: string; // "soon" | "1-3-years" | "exploring"
  hasSavings: string; // "yes" | "no" | "unsure"
}

const initialData: PremierAchatFormData = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  canton: "",
  postalCode: "",
  isRenter: "",
  incomeRange: "",
  birthYear: "",
  purchaseHorizon: "",
  hasSavings: "",
};

const CURRENT_YEAR = new Date().getFullYear();

const PremierAchatForm = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();
  const { isValidEmail, isValidPhone, formatSwissPhone } = useFormValidation();

  const [formData, setFormData] = useState<PremierAchatFormData>(initialData);
  const [consent, setConsent] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const { submitLead, isSubmitting } = useLeadSubmission({ formType: "premier-achat" });

  const update = (patch: Partial<PremierAchatFormData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  // Cantons triés par libellé localisé (accepte les 26 pour ne perdre aucun lead)
  const cantons = useMemo(() => {
    return [...swissCantons].sort((a, b) =>
      getCantonName(a.code, i18n.language).localeCompare(getCantonName(b.code, i18n.language))
    );
  }, [i18n.language]);

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

  // --- Erreurs de validation ---
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const req = t("forms.validation.required", "Ce champ est obligatoire");
    if (!formData.firstName.trim()) e.firstName = req;
    if (!formData.lastName.trim()) e.lastName = req;
    if (!formData.phone.trim() || !isValidPhone(formData.phone))
      e.phone = t("forms.validation.mobileOnly", "Seuls les numéros mobiles sont acceptés (06, 07, +41 7X, +33 6/7)");
    if (!formData.email.trim() || !isValidEmail(formData.email))
      e.email = t("forms.validation.invalidEmail", "Adresse email non valide");
    if (!formData.canton) e.canton = req;
    const year = parseInt(formData.birthYear, 10);
    if (!/^\d{4}$/.test(formData.birthYear) || year < 1930 || year > CURRENT_YEAR - 18)
      e.birthYear = t("forms.premierAchat.birthYearError", "Année de naissance non valide");
    if (!formData.isRenter) e.isRenter = req;
    if (!formData.incomeRange) e.incomeRange = req;
    if (!consent) e.consent = t("forms.premierAchat.consentError", "Merci d'accepter pour continuer.");
    return e;
  }, [formData, consent, isValidEmail, isValidPhone, t]);

  const showError = (key: string) => (attempted ? errors[key] : undefined);

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    setAttempted(true);
    if (Object.keys(errors).length > 0) {
      // Amène l'utilisateur au premier champ en erreur
      const first = document.querySelector<HTMLElement>("[data-error='true']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // --- Calcul du statut de distribution (règles Optimis), taggé dans le payload ---
    const age = CURRENT_YEAR - parseInt(formData.birthYear, 10);
    let motif = "";
    if (age > 63) motif = "Âge > 63 ans";
    else if (formData.isRenter === "no") motif = "Non locataire";
    else if (formData.incomeRange === "less-6000") motif = "Revenu < 6'000 CHF/mois";
    const distribuable = motif === "";

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone,
      email: formData.email.trim(),
      canton: formData.canton,
      postalCode: formData.postalCode.trim(),
      isRenter: formData.isRenter,
      incomeRange: formData.incomeRange,
      birthYear: formData.birthYear,
      // Clé technique brute (lue par l'edge + trigger pour la colonne `age`)
      age,
      purchaseHorizon: formData.purchaseHorizon,
      hasSavings: formData.hasSavings,
      statutDistribution: distribuable ? "Distribuable" : "Non distribuable",
      motifNonDistribution: motif,
    };

    const result = await submitLead(payload as unknown as Record<string, unknown>);
    if (result) {
      navigate(localizedPath("/merci"));
    }
  };

  const radioCard = (
    field: keyof PremierAchatFormData,
    option: { value: string; label: string },
    groupPrefix: string
  ) => (
    <label
      key={option.value}
      htmlFor={`${groupPrefix}-${option.value}`}
      className={cn(
        "flex items-center gap-2 px-3 py-2.5 border-2 rounded-xl cursor-pointer transition-all text-sm",
        formData[field] === option.value
          ? "border-primary bg-primary/5 font-medium"
          : "border-border hover:border-primary/50"
      )}
    >
      <RadioGroupItem value={option.value} id={`${groupPrefix}-${option.value}`} />
      <span className="flex-1">{option.label}</span>
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Coordonnées */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">
          {t("forms.premierAchat.sectionContact", "Vos coordonnées")}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div data-error={!!showError("firstName")}>
            <FormFieldWrapper label={t("forms.contact.firstName")} htmlFor="pa-firstName" required error={showError("firstName")}>
              <Input
                id="pa-firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={(e) => update({ firstName: e.target.value })}
                className="h-12"
              />
            </FormFieldWrapper>
          </div>
          <div data-error={!!showError("lastName")}>
            <FormFieldWrapper label={t("forms.contact.lastName")} htmlFor="pa-lastName" required error={showError("lastName")}>
              <Input
                id="pa-lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={(e) => update({ lastName: e.target.value })}
                className="h-12"
              />
            </FormFieldWrapper>
          </div>
        </div>

        <div data-error={!!showError("phone")}>
          <FormFieldWrapper
            label={t("forms.contact.phone")}
            htmlFor="pa-phone"
            required
            error={showError("phone")}
            helpText={t("forms.premierAchat.phoneHelp", "C'est par téléphone que votre conseiller vous rappelle gratuitement.")}
          >
            <PhoneInputCH
              id="pa-phone"
              value={formData.phone}
              onChange={(e) => update({ phone: formatSwissPhone(e.target.value) })}
              placeholder="79 123 45 67"
              hasError={!!showError("phone")}
            />
          </FormFieldWrapper>
        </div>

        <div data-error={!!showError("email")}>
          <FormFieldWrapper label={t("forms.contact.email")} htmlFor="pa-email" required error={showError("email")}>
            <Input
              id="pa-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => update({ email: e.target.value })}
              className="h-12"
            />
          </FormFieldWrapper>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div data-error={!!showError("canton")}>
            <FormFieldWrapper label={t("forms.healthInsurance.canton")} required error={showError("canton")}>
              <Select value={formData.canton} onValueChange={(v) => update({ canton: v })}>
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
          </div>
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
              onChange={(e) => update({ postalCode: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              placeholder="1000"
              className="h-12"
            />
          </FormFieldWrapper>
        </div>
      </div>

      {/* Projet */}
      <div className="space-y-4 pt-2">
        <h3 className="text-base font-semibold text-foreground">
          {t("forms.premierAchat.sectionProject", "Votre projet")}
        </h3>

        <div data-error={!!showError("isRenter")}>
          <FormFieldWrapper label={t("forms.premierAchat.isRenterLabel", "Êtes-vous actuellement locataire ?")} required error={showError("isRenter")}>
            <RadioGroup
              value={formData.isRenter}
              onValueChange={(v) => update({ isRenter: v })}
              className="grid grid-cols-2 gap-3"
            >
              {[
                { value: "yes", label: t("common.yes") },
                { value: "no", label: t("common.no") },
              ].map((o) => radioCard("isRenter", o, "renter"))}
            </RadioGroup>
          </FormFieldWrapper>
        </div>

        <div data-error={!!showError("incomeRange")}>
          <FormFieldWrapper label={t("forms.premierAchat.incomeLabel", "Revenu mensuel brut du ménage")} required error={showError("incomeRange")}>
            <RadioGroup
              value={formData.incomeRange}
              onValueChange={(v) => update({ incomeRange: v })}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {incomeOptions.map((o) => radioCard("incomeRange", o, "income"))}
            </RadioGroup>
          </FormFieldWrapper>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div data-error={!!showError("birthYear")}>
            <FormFieldWrapper label={t("forms.premierAchat.birthYearLabel", "Année de naissance")} htmlFor="pa-birthYear" required error={showError("birthYear")}>
              <Input
                id="pa-birthYear"
                inputMode="numeric"
                value={formData.birthYear}
                onChange={(e) => update({ birthYear: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                placeholder="1985"
                className="h-12"
              />
            </FormFieldWrapper>
          </div>
          <FormFieldWrapper label={t("forms.premierAchat.horizonLabel", "Quand souhaitez-vous acheter ?")}>
            <Select value={formData.purchaseHorizon} onValueChange={(v) => update({ purchaseHorizon: v })}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder={t("forms.premierAchat.horizonPlaceholder", "Sélectionnez")} />
              </SelectTrigger>
              <SelectContent>
                {horizonOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormFieldWrapper>
        </div>

        <FormFieldWrapper label={t("forms.premierAchat.savingsLabel", "Avez-vous déjà une épargne en cours ?")}>
          <RadioGroup
            value={formData.hasSavings}
            onValueChange={(v) => update({ hasSavings: v })}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {savingsOptions.map((o) => radioCard("hasSavings", o, "savings"))}
          </RadioGroup>
        </FormFieldWrapper>
      </div>

      {/* Consentement nLPD/RGPD (bloquant) */}
      <div data-error={!!showError("consent")} className="pt-2">
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
        {showError("consent") && <p className="mt-1 text-xs md:text-sm text-red-500">{showError("consent")}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full gap-2 h-13 text-base" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
        {isSubmitting
          ? t("forms.premierAchat.submitting", "Envoi en cours...")
          : t("forms.premierAchat.submit", "Recevoir mon plan gratuit")}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        <span>{t("forms.premierAchat.privacyNote", "Vos données restent confidentielles et ne servent qu'à préparer votre plan.")}</span>
      </div>
    </form>
  );
};

export default PremierAchatForm;
