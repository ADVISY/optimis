import { Heart, Shield, Clock, CheckCircle, Car, Scale, Home, Banknote } from "lucide-react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LocalizedLink from "@/components/LocalizedLink";
import llamaMascot from "@/assets/llama-mascot.png";

const partners = [
  { name: "Generali", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/general-1.svg" },
  { name: "Allianz", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/allianz-logo.svg" },
  { name: "AXA", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/0001_0003782804_2-640.jpg" },
  { name: "Swiss Life", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/Swiss_Life_AG_logo.svg" },
];

const AssuranceVie = () => {
  const { t } = useTranslation();

  const quickLinks = [
    { labelKey: "nav.carInsurance", href: "/assurance-voiture", icon: Car },
    { labelKey: "nav.healthInsurance", href: "/assurance-sante", icon: Heart },
    { labelKey: "nav.legalProtection", href: "/protection-juridique", icon: Scale },
    { labelKey: "nav.homeInsurance", href: "/assurance-menage", icon: Home },
  ];

  const features = [
    { icon: Shield, titleKey: "lifeInsurance.capitalProtection", descKey: "lifeInsurance.capitalProtectionDesc" },
    { icon: Clock, titleKey: "lifeInsurance.taxAdvantages", descKey: "lifeInsurance.taxAdvantagesDesc" },
    { icon: CheckCircle, titleKey: "lifeInsurance.familyProtection", descKey: "lifeInsurance.familyProtectionDesc" },
  ];

  const stats = [
    { labelKey: "stats.recommended", value: "95%", descriptionKey: "stats.byUsers" },
    { labelKey: "stats.join", value: "+10,000", descriptionKey: "stats.users" },
    { labelKey: "stats.noCommitment", value: "100%", descriptionKey: "stats.free" },
  ];

  const tableOfContents = [
    "lifeInsurance.whatIsLifeInsurance",
    "lifeInsurance.typesOfLifeInsurance",
    "lifeInsurance.thirdPillarExplained",
    "lifeInsurance.whoNeedsIt",
    "lifeInsurance.howToChoose",
    "lifeInsurance.taxBenefits",
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-optimis py-16 md:py-24">
        <div className="container">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <p className="text-sm font-medium text-muted-foreground">
                <LocalizedLink to="/" className="hover:text-primary">{t('common.home')}</LocalizedLink> / {t('lifeInsurance.title')}
              </p>
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
                {t('lifeInsurance.title')}
              </h1>
              <ul className="text-lg text-muted-foreground space-y-2">
                <li>• {t('lifeInsurance.feature1')}</li>
                <li>• {t('lifeInsurance.feature2')}</li>
                <li>• {t('lifeInsurance.feature3')}</li>
                <li>• {t('lifeInsurance.feature4')}</li>
              </ul>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2">
                  <Banknote className="h-5 w-5" />
                  {t('lifeInsurance.compareButton')}
                </Button>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <img
                src="https://le-comparateur-optimis.ch/wp-content/uploads/2024/05/happy-man-doing-winning-gesture-1.png"
                alt="Assurance vie"
                className="h-64 w-auto md:h-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 bg-background border-b">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-4">
            {quickLinks.map((link) => (
              <LocalizedLink
                key={link.href}
                to={link.href}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-muted hover:bg-primary/10 transition-colors font-medium"
              >
                <link.icon className="h-5 w-5 text-primary" />
                {t(link.labelKey)}
              </LocalizedLink>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary/5">
        <div className="container">
          <h3 className="text-center text-lg font-semibold text-foreground mb-8">
            {t('lifeInsurance.protectYourFuture')}
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.labelKey} className="text-center">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground">{t(stat.labelKey)}</p>
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{t(stat.descriptionKey)}</p>
                </CardContent>
              </Card>
            ))}
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

      {/* Content Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Sidebar - Table of Contents */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">{t('common.readingTime')}</span>
                  </div>
                  <p className="text-2xl font-bold text-primary mb-6">5 {t('common.min')}</p>
                  <nav className="space-y-2">
                    {tableOfContents.map((item, index) => (
                      <a
                        key={index}
                        href={`#section-${index}`}
                        className="block text-sm text-foreground/80 hover:text-primary transition-colors py-1 border-l-2 border-transparent hover:border-primary pl-3"
                      >
                        {t(item)}
                      </a>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 prose prose-lg max-w-none">
              <section id="section-0" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('lifeInsurance.whatIsLifeInsurance')}</h3>
                <p className="text-muted-foreground">{t('lifeInsurance.whatIsLifeInsuranceContent')}</p>
              </section>

              <section id="section-1" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('lifeInsurance.typesOfLifeInsurance')}</h3>
                <p className="text-muted-foreground">{t('lifeInsurance.typesContent')}</p>
                <div className="bg-muted/50 p-6 rounded-lg my-6">
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• {t('lifeInsurance.type1')}</li>
                    <li>• {t('lifeInsurance.type2')}</li>
                    <li>• {t('lifeInsurance.type3')}</li>
                  </ul>
                </div>
              </section>

              <section id="section-2" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('lifeInsurance.thirdPillarExplained')}</h3>
                <p className="text-muted-foreground">{t('lifeInsurance.thirdPillarContent')}</p>
                <div className="bg-primary/5 p-6 rounded-lg my-6">
                  <h4 className="font-semibold text-foreground mb-4">{t('lifeInsurance.pillar3aVs3b')}</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• {t('lifeInsurance.pillar3aDesc')}</li>
                    <li>• {t('lifeInsurance.pillar3bDesc')}</li>
                  </ul>
                </div>
              </section>

              <section id="section-3" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('lifeInsurance.whoNeedsIt')}</h3>
                <p className="text-muted-foreground">{t('lifeInsurance.whoNeedsItContent')}</p>
                <ul className="space-y-2 text-muted-foreground my-4">
                  <li>• {t('lifeInsurance.needCase1')}</li>
                  <li>• {t('lifeInsurance.needCase2')}</li>
                  <li>• {t('lifeInsurance.needCase3')}</li>
                  <li>• {t('lifeInsurance.needCase4')}</li>
                </ul>
              </section>

              <section id="section-4" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('lifeInsurance.howToChoose')}</h3>
                <p className="text-muted-foreground">{t('lifeInsurance.howToChooseContent')}</p>
              </section>

              <section id="section-5" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('lifeInsurance.taxBenefits')}</h3>
                <p className="text-muted-foreground">{t('lifeInsurance.taxBenefitsContent')}</p>
                <Card className="my-6">
                  <CardContent className="p-6">
                    <p className="text-lg font-semibold text-primary">{t('lifeInsurance.maxDeduction')}</p>
                    <p className="text-muted-foreground mt-2">{t('lifeInsurance.maxDeductionDesc')}</p>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-10">
            <h3 className="text-sm font-semibold text-primary mb-2">{t('common.partners')}</h3>
            <p className="text-lg text-foreground">{t('common.partnersDescription')}</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partners.map((partner) => (
              <img
                key={partner.name}
                src={partner.logo}
                alt={partner.name}
                className="h-10 md:h-12 object-contain opacity-70 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <img src={llamaMascot} alt="Mascotte Optimis" className="h-24 mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('lifeInsurance.readyToCompare')}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                {t('lifeInsurance.getEstimate')}
              </p>
              <Button size="lg" className="gap-2">
                <Banknote className="h-5 w-5" />
                {t('lifeInsurance.compareNow')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default AssuranceVie;
