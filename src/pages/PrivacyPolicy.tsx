import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  const sections = [
    { title: "introTitle", content: "introContent" },
    { title: "dataCollectionTitle", content: "dataCollectionContent" },
    { title: "dataUsageTitle", content: "dataUsageContent" },
    { title: "rightsTitle", content: "rightsContent" },
    { title: "contactTitle", content: "contactContent" },
  ];

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">{t('legal.privacyPolicy.title')}</h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          {sections.map(({ title, content }) => (
            <section key={title}>
              <h2 className="text-2xl font-semibold mb-4">{t(`legal.privacyPolicy.${title}`)}</h2>
              <p className="text-muted-foreground">{t(`legal.privacyPolicy.${content}`)}</p>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
