import { useTranslation } from "react-i18next";
import {
  Home,
  FileCheck,
  TrendingDown,
  ShieldCheck,
  Wallet,
  Users,
  UserPlus,
  PhoneCall,
  ClipboardList,
  BadgeCheck,
  Gift,
  Award,
  RotateCcw,
  ArrowRight,
  KeyRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import llamaMascot from "@/assets/llama-mascot.png";

const PlanPremierAchat = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();

  // La LP est purement marketing : chaque CTA ouvre le tunnel plein écran dédié.
  const goToForm = () => navigate(localizedPath("/plan-premier-achat-offres"));

  const benefits = [
    { icon: FileCheck, titleKey: "premierAchat.benefit1Title", descKey: "premierAchat.benefit1Desc" },
    { icon: TrendingDown, titleKey: "premierAchat.benefit2Title", descKey: "premierAchat.benefit2Desc" },
    { icon: ShieldCheck, titleKey: "premierAchat.benefit3Title", descKey: "premierAchat.benefit3Desc" },
    { icon: Wallet, titleKey: "premierAchat.benefit4Title", descKey: "premierAchat.benefit4Desc" },
    { icon: Users, titleKey: "premierAchat.benefit5Title", descKey: "premierAchat.benefit5Desc" },
  ];

  const steps = [
    { icon: UserPlus, titleKey: "premierAchat.howStep1Title", descKey: "premierAchat.howStep1Desc" },
    { icon: PhoneCall, titleKey: "premierAchat.howStep2Title", descKey: "premierAchat.howStep2Desc" },
    { icon: ClipboardList, titleKey: "premierAchat.howStep3Title", descKey: "premierAchat.howStep3Desc" },
  ];

  const reassurance = [
    { icon: BadgeCheck, labelKey: "premierAchat.reassurance1" },
    { icon: Gift, labelKey: "premierAchat.reassurance2" },
    { icon: Award, labelKey: "premierAchat.reassurance3" },
    { icon: RotateCcw, labelKey: "premierAchat.reassurance4" },
  ];

  const faqs = [
    { q: "premierAchat.faq1Q", a: "premierAchat.faq1A" },
    { q: "premierAchat.faq2Q", a: "premierAchat.faq2A" },
    { q: "premierAchat.faq3Q", a: "premierAchat.faq3A" },
    { q: "premierAchat.faq4Q", a: "premierAchat.faq4A" },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="gradient-optimis relative overflow-hidden">
        <div className="container py-12 md:py-20">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-5 text-center lg:text-left animate-fade-in">
              <div className="flex gap-1 justify-center lg:justify-start">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-accent text-xl md:text-2xl drop-shadow-sm">★</span>
                ))}
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight text-foreground">
                {t("premierAchat.heroTitle")}
              </h1>
              <p className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t("premierAchat.heroSubtitle")}
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-1">
                <Button size="lg" className="gap-2 h-12 text-base px-7" onClick={goToForm}>
                  <KeyRound className="h-5 w-5" />
                  {t("premierAchat.heroCta")}
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start pt-2 text-sm font-medium text-foreground/80">
                <span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-primary" />{t("premierAchat.heroTrust1")}</span>
                <span className="flex items-center gap-1.5"><Gift className="h-4 w-4 text-primary" />{t("premierAchat.heroTrust2")}</span>
                <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-primary" />{t("premierAchat.heroTrust3")}</span>
              </div>
            </div>

            {/* Value / CTA card (hero-side on desktop) — ouvre le tunnel dédié */}
            <div className="animate-fade-in">
              <Card className="border-primary/20 shadow-premium overflow-hidden">
                <CardContent className="p-6 md:p-8 text-center">
                  <img src={llamaMascot} alt="Mascotte Optimis" className="h-20 md:h-28 mx-auto mb-4" />
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">{t("premierAchat.formTitle")}</h2>
                  <p className="text-sm text-muted-foreground mt-1 mb-5">{t("premierAchat.formSubtitle")}</p>
                  <ul className="space-y-2.5 text-left mb-6 max-w-xs mx-auto">
                    {reassurance.map((r) => (
                      <li key={r.labelKey} className="flex items-center gap-2.5">
                        <r.icon className="h-5 w-5 text-primary shrink-0" />
                        <span className="text-sm font-medium text-foreground">{t(r.labelKey)}</span>
                      </li>
                    ))}
                  </ul>
                  <Button size="lg" className="gap-2 w-full h-12 text-base" onClick={goToForm}>
                    <KeyRound className="h-5 w-5" />
                    {t("premierAchat.heroCta")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Reassurance strip */}
      <section className="border-y bg-muted/30">
        <div className="container py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {reassurance.map((r) => (
              <div key={r.labelKey} className="flex items-center gap-2 justify-center md:justify-start">
                <r.icon className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{t(r.labelKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14 md:py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t("premierAchat.benefitsTitle")}</h2>
            <p className="text-muted-foreground">{t("premierAchat.benefitsSubtitle")}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {benefits.map((b) => (
              <Card key={b.titleKey} className="border-primary/10 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <b.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{t(b.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(b.descKey)}</p>
                </CardContent>
              </Card>
            ))}
            {/* CTA tile */}
            <Card className="bg-primary/5 border-primary/20 flex items-center justify-center">
              <CardContent className="p-6 text-center">
                <Home className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="font-semibold text-foreground mb-4">{t("premierAchat.benefitsCtaText")}</p>
                <Button className="gap-2 w-full" onClick={goToForm}>
                  <KeyRound className="h-4 w-4" />
                  {t("premierAchat.heroCta")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 md:py-20 bg-muted/30">
        <div className="container">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-foreground mb-12">{t("premierAchat.howTitle")}</h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <div key={s.titleKey} className="text-center relative">
                <div className="relative inline-flex">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <s.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{t(s.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(s.descKey)}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button size="lg" className="gap-2" onClick={goToForm}>
              <KeyRound className="h-5 w-5" />
              {t("premierAchat.heroCta")}
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 md:py-20">
        <div className="container">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-foreground mb-8">{t("premierAchat.faqTitle")}</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((f) => (
              <Card key={f.q} className="bg-muted/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2 flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    {t(f.q)}
                  </h3>
                  <p className="text-muted-foreground pl-7">{t(f.a)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-8 md:py-16">
        <div className="container px-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 md:p-12 text-center">
              <img src={llamaMascot} alt="Mascotte Optimis" className="h-16 md:h-24 mx-auto mb-4 md:mb-6" />
              <h2 className="text-xl md:text-3xl font-bold text-foreground mb-2 md:mb-4">{t("premierAchat.ctaTitle")}</h2>
              <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-xl mx-auto">{t("premierAchat.ctaDesc")}</p>
              <Button size="lg" className="gap-2" onClick={goToForm}>
                <KeyRound className="h-5 w-5" />
                {t("premierAchat.heroCta")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default PlanPremierAchat;
