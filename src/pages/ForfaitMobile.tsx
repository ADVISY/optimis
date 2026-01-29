import { Smartphone, Check, Clock, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LocalizedLink from "@/components/LocalizedLink";
import llamaMascot from "@/assets/llama-mascot.png";

const providers = [
  { name: "Swisscom", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/swisscom-logo.svg" },
  { name: "Sunrise", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/sunrise-logo.svg" },
  { name: "Salt", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/salt-logo.svg" },
  { name: "Wingo", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/wingo-logo.svg" },
];

const ForfaitMobile = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Shield, titleKey: "mobile.bestOffers", descKey: "mobile.bestOffersDesc" },
    { icon: Clock, titleKey: "mobile.quickComparison", descKey: "mobile.quickComparisonDesc" },
    { icon: Check, titleKey: "mobile.noCommitment", descKey: "mobile.noCommitmentDesc" },
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
                <LocalizedLink to="/services" className="hover:text-primary"> {t('services.title')}</LocalizedLink> / {t('mobile.title')}
              </p>
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
                {t('mobile.title')}
              </h1>
              <h2 className="text-xl text-muted-foreground">
                {t('mobile.heroSubtitle')}
              </h2>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2">
                  <Smartphone className="h-5 w-5" />
                  {t('mobile.compareButton')}
                </Button>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <img
                src={llamaMascot}
                alt="Mascotte Optimis"
                className="h-64 w-auto md:h-80"
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
            <h3 className="text-2xl font-bold text-foreground mb-6">{t('mobile.whyCompare')}</h3>
            <p className="text-muted-foreground mb-6">{t('mobile.whyCompareContent')}</p>
            
            <h4 className="text-xl font-semibold text-foreground mb-4">{t('mobile.whatToLookFor')}</h4>
            <ul className="space-y-3 text-muted-foreground mb-8">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                {t('mobile.criteria1')}
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                {t('mobile.criteria2')}
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                {t('mobile.criteria3')}
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                {t('mobile.criteria4')}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Providers */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h3 className="text-sm font-semibold text-primary mb-2">{t('common.partners')}</h3>
            <p className="text-lg text-foreground">{t('mobile.compareProviders')}</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {providers.map((provider) => (
              <img
                key={provider.name}
                src={provider.logo}
                alt={provider.name}
                className="h-10 md:h-12 object-contain opacity-70 hover:opacity-100 transition-opacity"
              />
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
                {t('mobile.readyToCompare')}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                {t('mobile.getEstimate')}
              </p>
              <Button size="lg" className="gap-2">
                <Smartphone className="h-5 w-5" />
                {t('mobile.compareNow')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default ForfaitMobile;
