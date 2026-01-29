import { FileX, Check, Clock, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LocalizedLink from "@/components/LocalizedLink";
import llamaMascot from "@/assets/llama-mascot.png";

const insurers = [
  { name: "Assura", slug: "assura" },
  { name: "CSS", slug: "css" },
  { name: "Groupe Mutuel", slug: "groupe-mutuel" },
  { name: "Helsana", slug: "helsana" },
  { name: "Swica", slug: "swica" },
  { name: "Visana", slug: "visana" },
  { name: "Sanitas", slug: "sanitas" },
  { name: "Concordia", slug: "concordia" },
];

const Resiliation = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Clock, titleKey: "termination.deadlines", descKey: "termination.deadlinesDesc" },
    { icon: FileX, titleKey: "termination.freeTemplates", descKey: "termination.freeTemplatesDesc" },
    { icon: Check, titleKey: "termination.assistance", descKey: "termination.assistanceDesc" },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-optimis py-16 md:py-24">
        <div className="container">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <p className="text-sm font-medium text-muted-foreground">
                <LocalizedLink to="/" className="hover:text-primary">{t('common.home')}</LocalizedLink> / {t('termination.title')}
              </p>
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
                {t('termination.title')}
              </h1>
              <h2 className="text-xl text-muted-foreground">
                {t('termination.heroSubtitle')}
              </h2>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2">
                  <FileX className="h-5 w-5" />
                  {t('termination.startButton')}
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

      {/* Alert */}
      <section className="py-8">
        <div className="container">
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="p-6 flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t('termination.importantDeadline')}</h4>
                <p className="text-muted-foreground">{t('termination.deadlineInfo')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-6">{t('termination.howToTerminate')}</h3>
            <p className="text-muted-foreground mb-6">{t('termination.howToTerminateContent')}</p>
            
            <h4 className="text-xl font-semibold text-foreground mb-4">{t('termination.steps')}</h4>
            <ol className="space-y-4 text-muted-foreground mb-8">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</span>
                {t('termination.step1')}
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</span>
                {t('termination.step2')}
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</span>
                {t('termination.step3')}
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">4</span>
                {t('termination.step4')}
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Insurers */}
      <section className="py-16">
        <div className="container">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">{t('termination.byInsurer')}</h3>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {insurers.map((insurer) => (
              <LocalizedLink key={insurer.slug} to={`/blog/tout-savoir-sur-la-resiliation-de-votre-assurance-${insurer.slug}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 text-center flex items-center justify-center h-full">
                    <p className="font-medium text-foreground">{insurer.name}</p>
                  </CardContent>
                </Card>
              </LocalizedLink>
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
                {t('termination.needHelp')}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                {t('termination.helpDescription')}
              </p>
              <Button size="lg" asChild>
                <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
                  {t('common.takeAppointment')}
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Resiliation;
