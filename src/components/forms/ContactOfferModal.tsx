import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInputCH } from "@/components/forms/PhoneInputCH";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Phone, Mail, FileText, CheckCircle, Loader2 } from "lucide-react";
import { useLeadSubmission } from "@/hooks/useLeadSubmission";
import { fireLeadConversion, getLastLeadId } from "@/lib/leadTracking";
import { InsuranceOffer } from "@/data/mockInsuranceData";

interface ContactOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: InsuranceOffer | null;
  contactType: "call" | "email" | "offer";
  formData?: Record<string, unknown>;
}

const ContactOfferModal = ({
  isOpen,
  onClose,
  offer,
  contactType,
  formData = {},
}: ContactOfferModalProps) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<"form" | "success">("form");
  const [contactData, setContactData] = useState({
    firstName: (formData.firstName as string) || "",
    lastName: (formData.lastName as string) || "",
    email: (formData.email as string) || "",
    phone: (formData.phone as string) || "",
    preferredTime: "morning",
    message: "",
  });

  // Réutilise l'ID du lead initial pour que Zapier puisse retrouver et
  // mettre à jour la fiche existante (Lookup row + Update row par "ID du lead").
  const initialLeadId = getLastLeadId();

  const { submitLead, isSubmitting } = useLeadSubmission({
    formType: `contact-${contactType}`,
    linkToLeadId: initialLeadId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await submitLead({
      ...contactData,
      offerDetails: offer ? {
        id: offer.id,
        companyName: offer.companyName,
        coverageType: offer.coverageType,
        monthlyPrice: offer.monthlyPrice,
      } : null,
      originalFormData: formData,
      requestType: contactType,
    });

    fireLeadConversion({
      pageKey: `contact-${contactType}`,
      leadId: getLastLeadId(),
      formType: `contact-${contactType}`,
      googleAdsSendTo: "AW-16586911321/1MwiCK30gpAcENncoOU9",
    });

    setStep("success");
  };

  const handleClose = () => {
    setStep("form");
    onClose();
  };

  const getTitle = () => {
    switch (contactType) {
      case "call":
        return t("contact.callbackTitle", "Être rappelé");
      case "email":
        return t("contact.emailTitle", "Recevoir par email");
      case "offer":
        return t("contact.offerTitle", "Demander cette offre");
      default:
        return "";
    }
  };

  const getDescription = () => {
    switch (contactType) {
      case "call":
        return t("contact.callbackDescription", "Un conseiller vous rappellera dans les plus brefs délais");
      case "email":
        return t("contact.emailDescription", "Recevez le détail de cette offre par email");
      case "offer":
        return t("contact.offerDescription", "Complétez vos informations pour recevoir cette offre personnalisée");
      default:
        return "";
    }
  };

  const getIcon = () => {
    switch (contactType) {
      case "call":
        return <Phone className="h-5 w-5" />;
      case "email":
        return <Mail className="h-5 w-5" />;
      case "offer":
        return <FileText className="h-5 w-5" />;
      default:
        return null;
    }
  };

  if (step === "success") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center py-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">
            {t("contact.successTitle", "Demande envoyée !")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {contactType === "call" 
                ? t("contact.successCallMessage", "Un conseiller vous contactera très bientôt.")
                : contactType === "email"
                ? t("contact.successEmailMessage", "Vous allez recevoir les détails par email.")
                : t("contact.successOfferMessage", "Nous traitons votre demande et vous recontactons rapidement.")}
            </p>
            <Button onClick={handleClose}>
              {t("common.close", "Fermer")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        {offer && (
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{offer.companyName}</p>
                <p className="text-sm text-muted-foreground">{offer.coverageType}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">CHF {offer.monthlyPrice.toFixed(2)}/mois</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("forms.contact.firstName", "Prénom")} *</Label>
              <Input
                id="firstName"
                required
                value={contactData.firstName}
                onChange={(e) => setContactData({ ...contactData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t("forms.contact.lastName", "Nom")} *</Label>
              <Input
                id="lastName"
                required
                value={contactData.lastName}
                onChange={(e) => setContactData({ ...contactData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("forms.contact.email", "Email")} *</Label>
            <Input
              id="email"
              type="email"
              required
              value={contactData.email}
              onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
            />
          </div>

          {(contactType === "call" || contactType === "offer") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("forms.contact.phone", "Téléphone")} *</Label>
                <PhoneInputCH
              id="phone"
              value={contactData.phone}
              onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
              placeholder="79 123 45 67"
            />
              </div>

              <div className="space-y-2">
                <Label>{t("contact.preferredTime", "Quand souhaitez-vous être rappelé ?")}</Label>
                <RadioGroup
                  value={contactData.preferredTime}
                  onValueChange={(value) => setContactData({ ...contactData, preferredTime: value })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="morning" id="morning" />
                    <Label htmlFor="morning" className="cursor-pointer">
                      {t("contact.morning", "Matin")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="afternoon" id="afternoon" />
                    <Label htmlFor="afternoon" className="cursor-pointer">
                      {t("contact.afternoon", "Après-midi")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="evening" id="evening" />
                    <Label htmlFor="evening" className="cursor-pointer">
                      {t("contact.evening", "Soir")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">{t("contact.message", "Message (optionnel)")}</Label>
            <Textarea
              id="message"
              value={contactData.message}
              onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
              placeholder={t("contact.messagePlaceholder", "Avez-vous des questions particulières ?")}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              {t("common.cancel", "Annuler")}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("common.sending", "Envoi...")}
                </>
              ) : (
                <>
                  {getIcon()}
                  {t("common.send", "Envoyer")}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactOfferModal;
