import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";

const ThankYou = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="container py-20">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">{t('thankYou.title')}</h1>
          <p className="text-xl text-muted-foreground mb-8">{t('thankYou.message')}</p>
          <p className="text-muted-foreground mb-8">{t('thankYou.nextSteps')}</p>
          <LocalizedLink to="/">
            <Button size="lg">{t('thankYou.backHome')}</Button>
          </LocalizedLink>
        </div>
      </div>
    </Layout>
  );
};

export default ThankYou;
