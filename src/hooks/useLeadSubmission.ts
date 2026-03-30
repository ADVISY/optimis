import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

interface LeadData {
  formType: string;
  language: string;
  source: string;
  timestamp: string;
  leadId: string;
  [key: string]: unknown;
}

interface UseLeadSubmissionOptions {
  webhookUrl?: string;
  formType: string;
}

export function useLeadSubmission({ webhookUrl, formType }: UseLeadSubmissionOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { i18n, t } = useTranslation();

  const generateLeadId = () => {
    return `${formType.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const submitLead = async (formData: Record<string, unknown>) => {
    setIsSubmitting(true);

    // Flatten nested objects for Zapier compatibility
    const flattenObject = (obj: Record<string, unknown>, prefix = ''): Record<string, unknown> => {
      const result: Record<string, unknown> = {};
      for (const key in obj) {
        const newKey = prefix ? `${prefix}_${key}` : key;
        const value = obj[key];
        if (value instanceof Date) {
          // Format dates as DD/MM/YYYY for readability in Google Sheets
          const day = value.getDate().toString().padStart(2, '0');
          const month = (value.getMonth() + 1).toString().padStart(2, '0');
          const year = value.getFullYear().toString();
          result[newKey] = `${day}/${month}/${year}`;
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
        } else {
          result[newKey] = value;
        }
      }
      return result;
    };

    const flatFormData = flattenObject(formData as Record<string, unknown>);

    // Keep payload clean for Zapier/Google Sheets and convert technical codes to readable labels
    const normalizedFormData = { ...flatFormData };

    if (formType === "mortgage") {
      const projectTypeMap: Record<string, string> = {
        acquisition: t("forms.mortgage.projects.acquisition"),
        renewal: t("forms.mortgage.projects.renewal"),
        refinancing: t("forms.mortgage.projects.refinancing"),
      };

      const propertyTypeMap: Record<string, string> = {
        apartment: t("forms.mortgage.propertyTypes.apartment"),
        house: t("forms.mortgage.propertyTypes.house"),
        building: t("forms.mortgage.propertyTypes.building"),
        other: t("forms.mortgage.propertyTypes.other"),
      };

      const statusMap: Record<string, string> = {
        employee: t("forms.pillar3.status.employee"),
        "self-employed": t("forms.pillar3.status.selfEmployed"),
        executive: t("forms.pillar3.status.executive"),
        retired: t("forms.mortgage.status.retired"),
      };

      if (typeof normalizedFormData.projectType === "string") {
        normalizedFormData.projectType = projectTypeMap[normalizedFormData.projectType] ?? normalizedFormData.projectType;
      }

      if (typeof normalizedFormData.propertyType === "string") {
        normalizedFormData.propertyType = propertyTypeMap[normalizedFormData.propertyType] ?? normalizedFormData.propertyType;
      }

      if (typeof normalizedFormData.professionalStatus === "string") {
        normalizedFormData.professionalStatus = statusMap[normalizedFormData.professionalStatus] ?? normalizedFormData.professionalStatus;
      }
    }

    // LPP: convert technical codes to translated labels
    if (formType === "lpp-libre-passage") {
      const objectiveMap: Record<string, string> = {
        find: t("forms.lpp.objectives.find"),
        consolidate: t("forms.lpp.objectives.consolidate"),
      };
      const situationMap: Record<string, string> = {
        employed: t("forms.lpp.situations.employed"),
        "self-employed": t("forms.lpp.situations.selfEmployed"),
        unemployed: t("forms.lpp.situations.unemployed"),
        other: t("forms.lpp.situations.other"),
      };
      const yearsMap: Record<string, string> = {
        "less-10": t("forms.lpp.years.less10"),
        "10-plus": t("forms.lpp.years.plus10"),
        "20-plus": t("forms.lpp.years.plus20"),
        "30-plus": t("forms.lpp.years.plus30"),
      };

      if (typeof normalizedFormData.objective === "string") {
        normalizedFormData.objective = objectiveMap[normalizedFormData.objective] ?? normalizedFormData.objective;
      }
      if (typeof normalizedFormData.situation === "string") {
        normalizedFormData.situation = situationMap[normalizedFormData.situation] ?? normalizedFormData.situation;
      }
      if (typeof normalizedFormData.yearsWorked === "string") {
        normalizedFormData.yearsWorked = yearsMap[normalizedFormData.yearsWorked] ?? normalizedFormData.yearsWorked;
      }
    }

    // Professional insurance: combine insuranceTypes into a single readable string
    if (formType === "professional-insurance") {
      const typeLabels: Record<string, string> = {
        insuranceTypes_rcProfessional: "RC Professionnelle",
        insuranceTypes_lossOfEarnings: "Perte de gain",
        insuranceTypes_laa: "LAA (Accident)",
        insuranceTypes_lpp: "LPP (Prévoyance)",
        insuranceTypes_legalProtection: "Protection juridique",
        insuranceTypes_multiRisk: "Multirisque entreprise",
      };
      const selected = Object.entries(typeLabels)
        .filter(([key]) => normalizedFormData[key] === true)
        .map(([, label]) => label);
      Object.keys(typeLabels).forEach((key) => delete normalizedFormData[key]);
      normalizedFormData.insuranceTypes = selected.join(", ") || "Aucun";
    }

    // Rename fields to clean French labels for Google Sheets
    const fieldLabels: Record<string, Record<string, string>> = {
      // Common fields (applied to all forms)
      _common: {
        firstName: "Prénom",
        lastName: "Nom",
        email: "Email",
        phone: "Téléphone",
        canton: "Canton",
        postalCode: "Code postal",
        formType: "Type de formulaire",
        language: "Langue",
        source: "Source",
        pageUrl: "URL de la page",
        timestamp: "Date et heure",
        leadId: "ID du lead",
      },
      "health-insurance": {
        hasCurrentInsurance: "Assurance actuelle",
        currentInsurer: "Assureur actuel",
        familySituation: "Situation familiale",
        birthDate: "Date de naissance",
        lamalModel: "Modèle LAMal",
        franchise: "Franchise",
        accidentCoverage: "Couverture accident",
        complementaryTier: "Niveau complémentaire",
        complementary_dental: "Complémentaire dentaire",
        complementary_hospitalization: "Complémentaire hospitalisation",
        complementary_glasses: "Complémentaire lunettes",
        complementary_alternativeMedicine: "Complémentaire médecine alternative",
        complementary_worldwide: "Complémentaire monde entier",
        availability: "Disponibilité",
      },
      "car-insurance": {
        vehiclePlate: "Plaque d'immatriculation",
        vehicleBrand: "Marque du véhicule",
        vehicleModel: "Modèle du véhicule",
        vehicleYear: "Année du véhicule",
        usage: "Utilisation",
        annualKm: "Km annuels",
        driverBirthDate: "Date de naissance du conducteur",
        licenseYear: "Année du permis",
        accidentsLast5Years: "Accidents (5 dernières années)",
        coverageType: "Type de couverture",
        options_glassBreakage: "Option bris de glace",
        options_assistance: "Option assistance",
        options_replacementVehicle: "Option véhicule de remplacement",
      },
      "household-insurance": {
        propertyType: "Type de bien",
        ownershipStatus: "Statut de propriété",
        livingSpace: "Surface habitable",
        numberOfRooms: "Nombre de pièces",
        propertyValue: "Valeur du bien",
      },
      "legal-protection": {
        coverageType: "Type de couverture",
        coverageAreas_traffic: "Couverture circulation",
        coverageAreas_private: "Couverture privée",
        coverageAreas_work: "Couverture travail",
        coverageAreas_property: "Couverture propriété",
        coverageAreas_tenant: "Couverture locataire",
        householdSize: "Taille du ménage",
      },
      "pillar-3a": {
        hasExistingPillar3: "3ème pilier existant",
        existingProvider: "Prestataire actuel",
        objective: "Objectif",
        age: "Âge",
        professionalStatus: "Statut professionnel",
        incomeRange: "Tranche de revenu",
        savingsAmount: "Montant d'épargne",
        investmentHorizon: "Horizon de placement",
        riskProfile: "Profil de risque",
      },
      mortgage: {
        projectType: "Type de projet",
        propertyType: "Type de bien",
        propertyValue: "Valeur du bien",
        commune: "Commune",
        numberOfBorrowers: "Nombre d'emprunteurs",
        professionalStatus: "Statut professionnel",
        incomeRange: "Tranche de revenu",
        ownFundsRange: "Fonds propres",
      },
      "professional-insurance": {
        insuranceTypes: "Types d'assurance",
        activityType: "Type d'activité",
        legalForm: "Forme juridique",
        employeesCount: "Nombre d'employés",
        revenue: "Chiffre d'affaires annuel",
        contractStartDate: "Date de début de contrat",
        message: "Message",
      },
      "lpp-libre-passage": {
        objective: "Objectif",
        situation: "Situation actuelle",
        yearsWorked: "Années travaillées en Suisse",
        birthDate: "Date de naissance",
      },
      "estimation-immobiliere": {
        address: "Adresse du bien",
        propertyType: "Type de bien",
        rooms: "Nombre de pièces",
        surface: "Surface (m²)",
        saleTimeline: "Délai de vente",
        hasMandate: "Mandat agence signé",
      },
      subsidy: {
        birthDate: "Date de naissance",
        householdSize: "Composition du ménage",
        hasCurrentInsurance: "Assurance actuelle",
        currentInsurer: "Assureur actuel",
        currentDeductible: "Franchise actuelle",
        incomeRange: "Revenu annuel",
        specialSituation: "Situation particulière",
      },
      termination: {
        contractType: "Type de contrat",
        currentInsurer: "Assureur actuel",
        policyNumber: "Numéro de police",
        terminationDate: "Date de résiliation",
        address: "Adresse",
        city: "Ville",
      },
    };

    // Apply field renaming
    const formLabels = { ...fieldLabels._common, ...(fieldLabels[formType] || {}) };
    const renamedData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(normalizedFormData)) {
      const label = formLabels[key] || key;
      renamedData[label] = value;
    }

    const leadData: LeadData = {
      ...renamedData as Record<string, unknown>,
      "Type de formulaire": formType,
      "Langue": i18n.language,
      "Source": document.referrer || "direct",
      "URL de la page": window.location.href,
      "Date et heure": (() => {
        const now = new Date();
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      })(),
      "ID du lead": generateLeadId(),
      formType, // Keep for edge function routing
      language: i18n.language,
      leadId: generateLeadId(),
      timestamp: new Date().toISOString(),
      webhookUrl: webhookUrl,
    } as unknown as LeadData;

    console.log("Lead data to submit:", leadData);

    try {
      // Use Edge Function to submit lead (proper server-side request)
      const { data, error } = await supabase.functions.invoke('submit-lead', {
        body: leadData,
      });

      if (error) {
        console.error("Error from submit-lead function:", error);
        throw error;
      }

      console.log("Lead submitted successfully:", data);
      
      // Track Lead event for Meta Pixel
      if ((window as any).fbq) {
        (window as any).fbq('track', 'Lead');
        console.log("Meta Pixel: Lead event tracked");
      }
      
      // Track Lead event for TikTok Pixel
      if ((window as any).ttq) {
        (window as any).ttq.track('SubmitForm');
        console.log("TikTok Pixel: SubmitForm event tracked");
      }
      
      toast({
        title: t("forms.successTitle"),
        description: t("forms.successDescription"),
      });
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast({
        title: t("forms.errorTitle"),
        description: t("forms.errorDescription"),
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
    setIsSubmitted(true);

    return leadData;
  };

  return {
    isSubmitting,
    isSubmitted,
    submitLead,
  };
}
