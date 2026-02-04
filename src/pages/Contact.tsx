import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin } from "lucide-react";

const Contact = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">{t('contact.title')}</h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('contact.getInTouch')}</h2>
              <p className="text-muted-foreground mb-6">{t('contact.description')}</p>
            </section>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span>+41 21 588 02 02</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <span>info@optimis.ch</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Lausanne, Suisse</span>
              </div>
            </div>

            <section>
              <h3 className="text-xl font-semibold mb-3">{t('contact.hoursTitle')}</h3>
              <p className="text-muted-foreground">{t('contact.hoursContent')}</p>
            </section>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-6">{t('contact.formTitle')}</h2>
            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('forms.fields.firstName')}</label>
                  <Input placeholder={t('forms.placeholders.firstName')} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('forms.fields.lastName')}</label>
                  <Input placeholder={t('forms.placeholders.lastName')} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('forms.fields.email')}</label>
                <Input type="email" placeholder={t('forms.placeholders.email')} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('forms.fields.phone')}</label>
                <Input type="tel" placeholder={t('forms.placeholders.phone')} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('contact.messageLabel')}</label>
                <Textarea placeholder={t('contact.messagePlaceholder')} rows={4} />
              </div>
              <Button type="submit" className="w-full">{t('common.send')}</Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
