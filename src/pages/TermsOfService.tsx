import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">{t('legal.termsOfService.title')}</h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('legal.termsOfService.acceptanceTitle')}</h2>
            <p className="text-muted-foreground">{t('legal.termsOfService.acceptanceContent')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('legal.termsOfService.servicesTitle')}</h2>
            <p className="text-muted-foreground">{t('legal.termsOfService.servicesContent')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('legal.termsOfService.obligationsTitle')}</h2>
            <p className="text-muted-foreground">{t('legal.termsOfService.obligationsContent')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('legal.termsOfService.liabilityTitle')}</h2>
            <p className="text-muted-foreground">{t('legal.termsOfService.liabilityContent')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('legal.termsOfService.modificationsTitle')}</h2>
            <p className="text-muted-foreground">{t('legal.termsOfService.modificationsContent')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('legal.termsOfService.jurisdictionTitle')}</h2>
            <p className="text-muted-foreground">{t('legal.termsOfService.jurisdictionContent')}</p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
