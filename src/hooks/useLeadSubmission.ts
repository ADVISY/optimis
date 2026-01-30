import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

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

    const leadData: LeadData = {
      ...formData,
      formType,
      language: i18n.language,
      source: document.referrer || "direct",
      timestamp: new Date().toISOString(),
      leadId: generateLeadId(),
      pageUrl: window.location.href,
    };

    console.log("Lead data to submit:", leadData);

    // If webhook URL is provided, send to Zapier
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify(leadData),
        });

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
    } else {
      // Demo mode - just log and show success
      console.log("Demo mode - Lead captured:", leadData);
      toast({
        title: t("forms.successTitle"),
        description: t("forms.successDescription"),
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
