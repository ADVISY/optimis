import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";

const About = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">{t('about.title')}</h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('about.missionTitle')}</h2>
            <p className="text-muted-foreground">{t('about.missionContent')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('about.valuesTitle')}</h2>
            <p className="text-muted-foreground">{t('about.valuesContent')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('about.historyTitle')}</h2>
            <p className="text-muted-foreground">{t('about.historyContent')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('about.teamTitle')}</h2>
            <p className="text-muted-foreground">{t('about.teamContent')}</p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default About;
