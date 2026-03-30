import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import LppForm from "@/components/forms/LppForm";
import { motion } from "framer-motion";
import { CheckCircle, Search, ArrowRight, Shield, Banknote, Clock, AlertTriangle, HelpCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const ComparateurLpp = () => {
  const { t } = useTranslation();

  const scrollToForm = () => {
    document.querySelector('[data-form-container]')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-background to-background">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-8 md:pt-16 pb-8 md:pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <Search className="h-4 w-4" />
                  {t("lpp.heroBadge")}
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
                  {t("lpp.heroTitle")}
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
                  {t("lpp.heroSubtitle")}
                </p>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl px-6 py-4 mb-6"
                >
                  <Banknote className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  <div className="text-left">
                    <p className="text-xs md:text-sm text-muted-foreground">{t("lpp.averageLabel")}</p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                      className="text-2xl md:text-3xl font-bold text-primary"
                    >
                      CHF 12'838
                    </motion.p>
                  </div>
                </motion.div>

                <p className="text-sm md:text-base text-muted-foreground mb-6">{t("lpp.heroCheckCta")}</p>

                <Button
                  onClick={scrollToForm}
                  size="lg"
                  className="h-12 md:h-14 px-8 text-base md:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {t("lpp.heroCta")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-6 text-xs md:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t("comparators.trust.free")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t("comparators.trust.noCommitment")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t("comparators.trust.dataProtected")}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FORM SECTION */}
        <section className="py-6 md:py-10">
          <div className="container mx-auto px-4">
            <LppForm />
          </div>
        </section>

        {/* EXPLANATION SECTION */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12">{t("lpp.explainTitle")}</h2>
              <p className="text-base md:text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-10">
                {t("lpp.explainSubtitle")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: Banknote, title: t("lpp.step1Title"), desc: t("lpp.step1Desc"), color: "bg-blue-100 text-blue-600" },
                  { icon: ArrowRight, title: t("lpp.step2Title"), desc: t("lpp.step2Desc"), color: "bg-amber-100 text-amber-600" },
                  { icon: Clock, title: t("lpp.step3Title"), desc: t("lpp.step3Desc"), color: "bg-red-100 text-red-600" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    viewport={{ once: true }}
                    className="text-center p-6 rounded-2xl border bg-card shadow-sm"
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${item.color} mb-4`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM SECTION */}
        <section className="py-12 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <AlertTriangle className="h-10 w-10 md:h-12 md:w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-bold mb-4">{t("lpp.problemTitle")}</h2>
              <p className="text-base md:text-lg text-muted-foreground mb-8">{t("lpp.problemSubtitle")}</p>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 md:p-8">
                <p className="text-lg md:text-2xl font-bold text-amber-800">{t("lpp.problemHighlight")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12">{t("lpp.comparisonTitle")}</h2>
              <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-4 text-left text-sm font-semibold"></th>
                      <th className="p-4 text-center text-sm font-semibold">{t("lpp.pensionFund")}</th>
                      <th className="p-4 text-center text-sm font-semibold bg-primary/5">{t("lpp.freePassage")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: t("lpp.compRow1"), pension: t("lpp.compRow1Pension"), free: t("lpp.compRow1Free") },
                      { label: t("lpp.compRow2"), pension: t("lpp.compRow2Pension"), free: t("lpp.compRow2Free") },
                      { label: t("lpp.compRow3"), pension: t("lpp.compRow3Pension"), free: t("lpp.compRow3Free") },
                    ].map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-4 text-sm font-medium">{row.label}</td>
                        <td className="p-4 text-center text-sm text-muted-foreground">{row.pension}</td>
                        <td className="p-4 text-center text-sm bg-primary/5 font-medium">{row.free}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* SOLUTIONS */}
        <section className="py-12 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12">{t("lpp.solutionsTitle")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {[
                  { icon: Search, title: t("lpp.solution1") },
                  { icon: ArrowRight, title: t("lpp.solution2") },
                  { icon: Banknote, title: t("lpp.solution3") },
                  { icon: Shield, title: t("lpp.solution4") },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 p-4 md:p-6 rounded-xl border bg-card"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm md:text-base font-medium">{item.title}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FISCAL WARNING */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">{t("lpp.fiscalTitle")}</h2>
              <p className="text-base md:text-lg text-muted-foreground mb-6">{t("lpp.fiscalSubtitle")}</p>
              <p className="text-sm text-muted-foreground">{t("lpp.fiscalNote")}</p>
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="py-12 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12">{t("lpp.processTitle")}</h2>
              <div className="space-y-6">
                {[
                  { step: "1", title: t("lpp.process1") },
                  { step: "2", title: t("lpp.process2") },
                  { step: "3", title: t("lpp.process3") },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 md:gap-6"
                  >
                    <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg md:text-xl font-bold">
                      {item.step}
                    </div>
                    <p className="text-base md:text-lg font-medium">{item.title}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-3xl p-8 md:p-12"
              >
                <h2 className="text-2xl md:text-4xl font-bold mb-4">{t("lpp.ctaTitle")}</h2>
                <p className="text-base md:text-lg text-muted-foreground mb-4">
                  {t("lpp.ctaSubtitle")}
                </p>
                <Button
                  onClick={scrollToForm}
                  size="lg"
                  className="h-12 md:h-14 px-8 text-base md:text-lg font-semibold rounded-xl shadow-lg"
                >
                  {t("lpp.heroCta")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-8">
                <HelpCircle className="h-6 w-6 text-primary" />
                <h2 className="text-2xl md:text-4xl font-bold">{t("lpp.faqTitle")}</h2>
              </div>
              <Accordion type="single" collapsible className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border rounded-xl px-4 md:px-6 bg-card">
                    <AccordionTrigger className="text-sm md:text-base font-medium text-left py-4">
                      {t(`lpp.faq${i}Question`)}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-4">
                      {t(`lpp.faq${i}Answer`)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* STICKY MOBILE CTA */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-background/95 backdrop-blur-sm border-t p-3 z-50">
          <Button
            onClick={scrollToForm}
            className="w-full h-12 text-base font-semibold rounded-xl"
          >
            {t("lpp.heroCta")}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ComparateurLpp;
