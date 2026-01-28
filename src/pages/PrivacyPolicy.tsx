import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">{t('legal.privacyPolicy.title')}</h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('legal.privacyPolicy.introTitle')}</h2>
            <p className="text-muted-foreground">{t('legal.privacyPolicy.introContent')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('legal.privacyPolicy.dataCollectionTitle')}</h2>
            <p className="text-muted-foreground">{t('legal.privacyPolicy.dataCollectionContent')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('legal.privacyPolicy.dataUsageTitle')}</h2>
            <p className="text-muted-foreground">{t('legal.privacyPolicy.dataUsageContent')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('legal.privacyPolicy.cookiesTitle')}</h2>
            <p className="text-muted-foreground">{t('legal.privacyPolicy.cookiesContent')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('legal.privacyPolicy.rightsTitle')}</h2>
            <p className="text-muted-foreground">{t('legal.privacyPolicy.rightsContent')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('legal.privacyPolicy.contactTitle')}</h2>
            <p className="text-muted-foreground">{t('legal.privacyPolicy.contactContent')}</p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
