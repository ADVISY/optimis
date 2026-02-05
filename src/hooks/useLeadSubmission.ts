import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

// Zapier webhook URL for lead submissions
const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/21326682/ul72n92/";

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
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(result, flattenObject(obj[key] as Record<string, unknown>, newKey));
        } else {
          result[newKey] = obj[key];
        }
      }
      return result;
    };

    const flatFormData = flattenObject(formData as Record<string, unknown>);

    const leadData: LeadData = {
      ...flatFormData,
      formType,
      language: i18n.language,
      source: document.referrer || "direct",
      timestamp: new Date().toISOString(),
      leadId: generateLeadId(),
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
    };

    console.log("Lead data to submit:", leadData);

    // Use provided webhook URL or default Zapier URL
    const targetUrl = webhookUrl || ZAPIER_WEBHOOK_URL;
    
    // Send to Zapier webhook
    if (targetUrl) {
      try {
        await fetch(targetUrl, {
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
        
        console.log("Lead sent successfully to webhook");
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
      console.log("Demo mode - Lead captured (configure ZAPIER_WEBHOOK_URL to send):", leadData);
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
