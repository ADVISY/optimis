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

    const leadData: LeadData = {
      ...normalizedFormData,
      formType,
      language: i18n.language,
      source: document.referrer || "direct",
      pageUrl: window.location.href,
      timestamp: (() => {
        const now = new Date();
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      })(),
      leadId: generateLeadId(),
      webhookUrl: webhookUrl, // Pass custom webhook if provided
    };

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
