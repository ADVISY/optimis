import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";

const LegalNotice = () => {
  const { t } = useTranslation();

  const sections = [
    { title: "definitionsTitle", content: "definitionsContent" },
    { title: "serviceTitle", content: "serviceContent" },
    { title: "ownersTitle", content: "ownersContent" },
    { title: "responsibleTitle", content: "responsibleContent" },
    { title: "webmasterTitle", content: "webmasterContent" },
    { title: "hostingPagesTitle", content: "hostingPagesContent" },
    { title: "hostingComparatorsTitle", content: "hostingComparatorsContent" },
    { title: "dpoTitle", content: "dpoContent" },
    { title: "termsTitle", content: "termsContent" },
    { title: "servicesDescTitle", content: "servicesDescContent" },
    { title: "technicalTitle", content: "technicalContent" },
    { title: "intellectualPropertyTitle", content: "intellectualPropertyContent" },
  ];

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">{t('legal.legalNotice.title')}</h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          {sections.map(({ title, content }) => (
            <section key={title}>
              <h2 className="text-2xl font-semibold mb-4">{t(`legal.legalNotice.${title}`)}</h2>
              <div className="text-muted-foreground whitespace-pre-line">
                {t(`legal.legalNotice.${content}`)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default LegalNotice;
