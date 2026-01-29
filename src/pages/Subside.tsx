import { CreditCard, Check, Clock, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LocalizedLink from "@/components/LocalizedLink";
import llamaMascot from "@/assets/llama-mascot.png";

const Subside = () => {
  const { t } = useTranslation();

  const features = [
    { icon: CreditCard, titleKey: "subsidy.financialHelp", descKey: "subsidy.financialHelpDesc" },
    { icon: Clock, titleKey: "subsidy.quickProcess", descKey: "subsidy.quickProcessDesc" },
    { icon: FileText, titleKey: "subsidy.freeAssistance", descKey: "subsidy.freeAssistanceDesc" },
  ];

  const cantons = [
    "Vaud", "Genève", "Fribourg", "Valais", "Neuchâtel", "Jura", "Berne", "Zurich"
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-optimis py-16 md:py-24">
        <div className="container">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <p className="text-sm font-medium text-muted-foreground">
                <LocalizedLink to="/" className="hover:text-primary">{t('common.home')}</LocalizedLink> / 
                <LocalizedLink to="/services" className="hover:text-primary"> {t('services.title')}</LocalizedLink> / {t('subsidy.title')}
              </p>
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
                {t('subsidy.title')}
              </h1>
              <h2 className="text-xl text-muted-foreground">
                {t('subsidy.heroSubtitle')}
              </h2>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t('subsidy.requestButton')}
                </Button>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <img
                src="https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/coins-5946827.jpg"
                alt="Subside"
                className="h-64 w-auto md:h-80 rounded-xl shadow-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.titleKey}>
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="rounded-full bg-primary/10 p-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{t(feature.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(feature.descKey)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-6">{t('subsidy.whatIsSubsidy')}</h3>
            <p className="text-muted-foreground mb-6">{t('subsidy.whatIsSubsidyContent')}</p>
            
            <h4 className="text-xl font-semibold text-foreground mb-4">{t('subsidy.eligibility')}</h4>
            <ul className="space-y-3 text-muted-foreground mb-8">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                {t('subsidy.eligibility1')}
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                {t('subsidy.eligibility2')}
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                {t('subsidy.eligibility3')}
              </li>
            </ul>

            <h4 className="text-xl font-semibold text-foreground mb-4">{t('subsidy.howToApply')}</h4>
            <p className="text-muted-foreground mb-6">{t('subsidy.howToApplyContent')}</p>
          </div>
        </div>
      </section>

      {/* Cantons */}
      <section className="py-16">
        <div className="container">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">{t('subsidy.byCantonTitle')}</h3>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {cantons.map((canton) => (
              <Card key={canton} className="hover:border-primary transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <p className="font-medium text-foreground">{canton}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <img src={llamaMascot} alt="Mascotte Optimis" className="h-24 mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('subsidy.needHelp')}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                {t('subsidy.helpDescription')}
              </p>
              <Button size="lg" className="gap-2">
                <CreditCard className="h-5 w-5" />
                {t('subsidy.requestNow')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Subside;
