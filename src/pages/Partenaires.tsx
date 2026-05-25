import { useTranslation } from "react-i18next";
import Footer from "@/components/layout/Footer";
import PartnerForm from "@/components/forms/PartnerForm";
import logo from "@/assets/logo-white.svg";
import mascotHd from "@/assets/mascotte-optimis-hd.png";
import { motion } from "framer-motion";
import {
  Zap, Clock, Target, TrendingUp, Users, Shield,
  CheckCircle, ArrowRight, BarChart3, RefreshCw,
  Handshake, Brain, CalendarDays, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const Partenaires = () => {
  const { t } = useTranslation();

  const scrollToForm = () => {
    document.getElementById("partner-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── HERO WITH FORM ── */}
      <section id="partner-form" className="relative overflow-hidden !py-0 !mb-0">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-primary to-foreground opacity-95" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, hsl(var(--accent)) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--primary)) 0%, transparent 40%)",
        }} />

        <div className="absolute left-0 md:-left-5 bottom-0 z-[1] opacity-15 md:opacity-20 pointer-events-none">
          <img src={mascotHd} alt="" className="h-[280px] md:h-[400px] lg:h-[500px] xl:h-[600px] w-auto" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-5 md:py-8 lg:py-14">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-5 md:mb-10"
          >
            <img src={logo} alt="Optimis" className="h-12 md:h-16 lg:h-20 w-auto drop-shadow-lg" />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="text-left lg:text-left text-center"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-xs md:text-sm font-semibold mb-3 md:mb-6">
                <Zap className="h-4 w-4" />
                {t("partner.badge")}
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-black text-white leading-[1.1] mb-3 md:mb-5 tracking-tight">
                {t("partner.heroTitle1")}{" "}
                <span className="text-accent">{t("partner.heroTitle2")}</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-sm md:text-lg text-white/70 mb-4 md:mb-8 max-w-lg mx-auto lg:mx-0">
                {t("partner.heroDescription")}
              </motion.p>

              <motion.div variants={fadeUp} className="hidden md:grid grid-cols-2 gap-3 mb-8 max-w-lg">
                {[
                  { icon: CalendarDays, text: t("partner.stats.freshLeads") },
                  { icon: Clock, text: t("partner.stats.dateTime") },
                  { icon: Target, text: t("partner.stats.verifiedIntent") },
                  { icon: TrendingUp, text: t("partner.stats.revenue") },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3">
                    <item.icon className="h-4 w-4 text-accent flex-shrink-0" />
                    <span className="text-xs text-white/80 font-medium">{item.text}</span>
                  </div>
                ))}
              </motion.div>

              <motion.p variants={fadeUp} className="hidden md:flex text-sm text-white/50 items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                {t("partner.limitedPartners")}
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <PartnerForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── POUR QUI ? ── */}
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-4xl mx-auto text-center">
            <motion.h2 variants={fadeUp} className="text-headline mb-4">
              {t("partner.forWho.title")} <span className="text-primary">{t("partner.forWho.titleHighlight")}</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-body-lg text-muted-foreground mb-10">
              {t("partner.forWho.description")}
            </motion.p>
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { icon: Shield, label: t("partner.forWho.broker") },
                { icon: Target, label: t("partner.forWho.realEstate") },
                { icon: BarChart3, label: t("partner.forWho.financialAdvisor") },
                { icon: Zap, label: t("partner.forWho.telecom") },
                { icon: Users, label: t("partner.forWho.business") },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3 bg-secondary/50 rounded-2xl p-6 hover-lift">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm md:text-base font-semibold text-center">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── PROBLÈME MARCHÉ ── */}
      <section className="bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-3xl mx-auto text-center">
            <motion.h2 variants={fadeUp} className="text-headline mb-6">
              {t("partner.marketProblem.title")}
            </motion.h2>
            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                t("partner.marketProblem.resold"),
                t("partner.marketProblem.obsolete"),
                t("partner.marketProblem.lowQuality"),
                t("partner.marketProblem.wastedTime"),
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 bg-destructive/5 border border-destructive/10 rounded-xl p-4 text-left">
                  <span className="text-destructive font-bold text-lg mt-0.5">✕</span>
                  <span className="text-sm md:text-base">{text}</span>
                </div>
              ))}
            </motion.div>
            <motion.p variants={fadeUp} className="text-xl md:text-2xl font-bold text-foreground">
              {t("partner.marketProblem.punchline")} <span className="text-primary">{t("partner.marketProblem.punchlineHighlight")}</span>
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── LA SOLUTION OPTIMIS ── */}
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-4xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-headline mb-4">
                {t("partner.solution.title")} <span className="text-primary">{t("partner.solution.titleHighlight")}</span>
              </h2>
            </motion.div>
            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: CheckCircle, title: t("partner.solution.detailed"), desc: t("partner.solution.detailedDesc") },
                { icon: Target, title: t("partner.solution.qualified"), desc: t("partner.solution.qualifiedDesc") },
                { icon: Zap, title: t("partner.solution.intent"), desc: t("partner.solution.intentDesc") },
                { icon: BarChart3, title: t("partner.solution.optimized"), desc: t("partner.solution.optimizedDesc") },
                { icon: Shield, title: t("partner.solution.reliable"), desc: t("partner.solution.reliableDesc") },
                { icon: TrendingUp, title: t("partner.solution.proven"), desc: t("partner.solution.provenDesc") },
              ].map((item, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 hover-lift">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </motion.div>
            <motion.p variants={fadeUp} className="text-center text-xl font-bold mt-10 text-primary">
              {t("partner.solution.footer")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── FRAÎCHEUR DES LEADS ── */}
      <section className="bg-primary text-primary-foreground relative overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 30% 70%, hsl(var(--accent)) 0%, transparent 50%)",
        }} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-3xl mx-auto text-center">
            <motion.h2 variants={fadeUp} className="text-headline text-white mb-6">
              {t("partner.freshness.title")}
            </motion.h2>
            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: Zap, text: t("partner.freshness.realtime") },
                { icon: Clock, text: t("partner.freshness.under24h") },
                { icon: CalendarDays, text: t("partner.freshness.timestamp") },
                { icon: RefreshCw, text: t("partner.freshness.noRecycling") },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <item.icon className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm md:text-base text-white font-medium">{item.text}</span>
                </div>
              ))}
            </motion.div>
            <motion.div variants={fadeUp} className="bg-accent/20 border border-accent/30 rounded-2xl p-6">
              <p className="text-lg md:text-xl font-bold text-accent">
                {t("partner.freshness.conversionTip")}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-3xl mx-auto">
            <motion.h2 variants={fadeUp} className="text-headline text-center mb-12">
              {t("partner.howItWorks.title")}
            </motion.h2>
            <motion.div variants={fadeUp} className="space-y-0">
              {[
                { step: "01", title: t("partner.howItWorks.step1Title"), desc: t("partner.howItWorks.step1Desc") },
                { step: "02", title: t("partner.howItWorks.step2Title"), desc: t("partner.howItWorks.step2Desc") },
                { step: "03", title: t("partner.howItWorks.step3Title"), desc: t("partner.howItWorks.step3Desc") },
                { step: "04", title: t("partner.howItWorks.step4Title"), desc: t("partner.howItWorks.step4Desc") },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start relative">
                  {i < 3 && (
                    <div className="absolute left-6 top-14 w-0.5 h-full bg-border" />
                  )}
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-sm flex-shrink-0 relative z-10">
                    {item.step}
                  </div>
                  <div className="pb-10">
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── GARANTIES + PARTENARIAT ── */}
      <section className="bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl p-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-title mb-4">{t("partner.guarantee.title")}</h3>
                <ul className="space-y-3">
                  {[
                    t("partner.guarantee.replaced"),
                    t("partner.guarantee.quality"),
                    t("partner.guarantee.optimization"),
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base">{text}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl p-8">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Handshake className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-title mb-4">{t("partner.selective.title")}</h3>
                <ul className="space-y-3">
                  {[
                    t("partner.selective.weSelect"),
                    t("partner.selective.longTerm"),
                    t("partner.selective.controlled"),
                    t("partner.selective.exclusive"),
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base">{text}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm font-bold text-foreground bg-accent/10 rounded-lg p-3">
                  {t("partner.selective.warning")}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── EXPERTISE TERRAIN ── */}
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp}>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Brain className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-headline mb-4">
                {t("partner.expertise.title")}
              </h2>
              <p className="text-body-lg text-muted-foreground mb-8">
                {t("partner.expertise.description")}
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                t("partner.expertise.knowledge"),
                t("partner.expertise.objections"),
                t("partner.expertise.salesCycles"),
                t("partner.expertise.products"),
              ].map((text, i) => (
                <div key={i} className="bg-secondary/50 rounded-xl p-4">
                  <span className="text-sm font-semibold">{text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-3xl mx-auto text-center">
            <motion.h2 variants={fadeUp} className="text-headline mb-4">
              {t("partner.cta.title")} <span className="text-primary">{t("partner.cta.titleHighlight")}</span> ?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-body-lg text-muted-foreground mb-6">
              {t("partner.cta.description")}
            </motion.p>
            <motion.div variants={fadeUp}>
              <Button
                size="lg"
                onClick={scrollToForm}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-xl shadow-xl"
              >
                {t("partner.cta.button")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Partenaires;
