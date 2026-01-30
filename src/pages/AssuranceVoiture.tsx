import { useState } from "react";
import { Car, Heart, Scale, Home, Clock } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import llamaMascot from "@/assets/llama-mascot.png";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/LocalizedLink";
import { CarInsuranceForm } from "@/components/forms";

const partners = [
  { name: "AXA", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/0001_0003782804_2-640.jpg" },
  { name: "La Mobilière", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/images.png" },
  { name: "Allianz", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/allianz-logo.svg" },
  { name: "Zurich", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/thumb_3715_page_big.png" },
  { name: "Generali", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/general-1.svg" },
];

const AssuranceVoiture = () => {
  const { t } = useTranslation();

  const quickLinks = [
    { labelKey: "nav.carInsurance", href: "/assurance-voiture", icon: Car },
    { labelKey: "nav.healthInsurance", href: "/assurance-sante", icon: Heart },
    { labelKey: "nav.legalProtection", href: "/protection-juridique", icon: Scale },
    { labelKey: "nav.homeInsurance", href: "/assurance-menage", icon: Home },
  ];

  const stats = [
    { labelKey: "stats.recommended", value: "95%", descriptionKey: "stats.byUsers" },
    { labelKey: "stats.join", value: "+10,000", descriptionKey: "stats.users" },
    { labelKey: "stats.noCommitment", value: "100%", descriptionKey: "stats.free" },
  ];

  const tableOfContents = [
    "carInsurance.introduction",
    "carInsurance.basicCoverage",
    "carInsurance.complementaryCoverage",
    "carInsurance.franchise",
    "carInsurance.bonusMalus",
  ];

  const [showForm, setShowForm] = useState(false);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-optimis py-16 md:py-24">
        <div className="container">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <p className="text-sm font-medium text-muted-foreground">
                <LocalizedLink to="/" className="hover:text-primary">{t('common.home')}</LocalizedLink> / {t('carInsurance.title')}
              </p>
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
                {t('carInsurance.title')}
              </h1>
              <h2 className="text-xl text-muted-foreground">
                {t('carInsurance.heroSubtitle')}
              </h2>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2" onClick={() => setShowForm(true)}>
                  <Car className="h-5 w-5" />
                  {t('healthInsurance.compareButton')}
                </Button>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <img
                src="https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/automobile-3734396.jpg"
                alt="Assurance automobile"
                className="h-64 w-auto md:h-80 rounded-xl shadow-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      {showForm && (
        <section className="py-16 bg-muted/30" id="form">
          <div className="container">
            <CarInsuranceForm />
          </div>
        </section>
      )}

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
            {t('carInsurance.coverageBenefit')}
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

      {/* Video Section */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/4pYQxql9Ghw"
                title="PRÉSENTATION DE OPTIMIS"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents & Content */}
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
                  <p className="text-2xl font-bold text-primary mb-6">8 {t('common.min')}</p>
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
                <h3 className="text-2xl font-bold text-foreground">{t('carInsurance.introduction')}</h3>
                <p className="text-muted-foreground">
                  {t('carInsurance.introContent1')}
                </p>
                <p className="text-muted-foreground">
                  {t('carInsurance.introContent2')}
                </p>
                <p className="text-muted-foreground">
                  {t('carInsurance.introContent3')}
                </p>
              </section>

              <section id="section-1" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('carInsurance.basicCoverage')}</h3>
                <p className="text-muted-foreground">
                  {t('carInsurance.basicCoverageIntro')}
                </p>
                <div className="bg-muted/50 p-6 rounded-lg my-6">
                  <ul className="space-y-4 text-muted-foreground">
                    <li><strong>{t('carInsurance.civilLiability')}</strong> {t('carInsurance.civilLiabilityDesc')}</li>
                    <li><strong>{t('carInsurance.partialCasco')}</strong> {t('carInsurance.partialCascoDesc')}</li>
                    <li><strong>{t('carInsurance.fullCasco')}</strong> {t('carInsurance.fullCascoDesc')}</li>
                  </ul>
                </div>
                <p className="text-muted-foreground">
                  {t('carInsurance.basicCoverageConclusion')}
                </p>
              </section>

              <section id="section-2" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('carInsurance.complementaryCoverage')}</h3>
                <p className="text-muted-foreground">
                  {t('carInsurance.complementaryIntro')}
                </p>
                <ul className="space-y-3 text-muted-foreground my-4">
                  <li><strong>{t('carInsurance.passengerInsurance')}</strong> {t('carInsurance.passengerInsuranceDesc')}</li>
                  <li><strong>{t('carInsurance.parkingDamage')}</strong> {t('carInsurance.parkingDamageDesc')}</li>
                  <li><strong>{t('carInsurance.extendedGlass')}</strong> {t('carInsurance.extendedGlassDesc')}</li>
                  <li><strong>{t('carInsurance.mobilityAssistance')}</strong> {t('carInsurance.mobilityAssistanceDesc')}</li>
                  <li><strong>{t('carInsurance.lossOfUse')}</strong> {t('carInsurance.lossOfUseDesc')}</li>
                  <li><strong>{t('carInsurance.grossNegligence')}</strong> {t('carInsurance.grossNegligenceDesc')}</li>
                  <li><strong>{t('carInsurance.increasedValue')}</strong> {t('carInsurance.increasedValueDesc')}</li>
                  <li><strong>{t('carInsurance.bonusProtection')}</strong> {t('carInsurance.bonusProtectionDesc')}</li>
                </ul>
              </section>

              <section id="section-3" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('carInsurance.franchise')}</h3>
                <p className="text-muted-foreground">
                  {t('carInsurance.franchiseContent1')}
                </p>
                <p className="text-muted-foreground">
                  {t('carInsurance.franchiseContent2')}
                </p>
                <p className="text-muted-foreground">
                  {t('carInsurance.franchiseContent3')}
                </p>
              </section>

              <section id="section-4" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('carInsurance.bonusMalus')}</h3>
                <p className="text-muted-foreground">
                  {t('carInsurance.bonusMalusContent1')}
                </p>
                <p className="text-muted-foreground">
                  {t('carInsurance.bonusMalusContent2')}
                </p>
                <p className="text-muted-foreground">
                  {t('carInsurance.bonusMalusContent3')}
                </p>
                <p className="text-muted-foreground">
                  {t('carInsurance.bonusMalusContent4')}
                </p>
              </section>

              <img 
                src="https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/Vous-ne-savezpas-si-votre-assurance-copie-2-1024x576.jpg" 
                alt="Assurance automobile Suisse"
                className="rounded-lg my-6 w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-10">
            <h3 className="text-sm font-semibold text-primary mb-2">{t('common.partners')}</h3>
            <p className="text-lg text-foreground">
              {t('common.partnersDescription')}
            </p>
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
                {t('carInsurance.readyToSave')}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                {t('carInsurance.getEstimate')}
              </p>
              <Button size="lg" className="gap-2" onClick={() => {
                setShowForm(true);
                document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <Car className="h-5 w-5" />
                {t('healthInsurance.compareNow')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default AssuranceVoiture;
