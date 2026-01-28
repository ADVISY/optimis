import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";

const LegalNotice = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">{t('legal.legalNotice.title')}</h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('legal.legalNotice.companyTitle')}</h2>
            <p className="text-muted-foreground">{t('legal.legalNotice.companyContent')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('legal.legalNotice.publisherTitle')}</h2>
            <p className="text-muted-foreground">{t('legal.legalNotice.publisherContent')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('legal.legalNotice.hostingTitle')}</h2>
            <p className="text-muted-foreground">{t('legal.legalNotice.hostingContent')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('legal.legalNotice.intellectualPropertyTitle')}</h2>
            <p className="text-muted-foreground">{t('legal.legalNotice.intellectualPropertyContent')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('legal.legalNotice.liabilityTitle')}</h2>
            <p className="text-muted-foreground">{t('legal.legalNotice.liabilityContent')}</p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default LegalNotice;
