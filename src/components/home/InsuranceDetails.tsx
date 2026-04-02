import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import LocalizedLink from "@/components/LocalizedLink";
import { resolveLegacyImageUrl } from "@/data/legacyImageResolver";

const InsuranceDetails = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground uppercase">
            {t('home.findInsuranceTitle')}
          </h2>
        </div>
        
        <div className="grid gap-12 lg:gap-16">
          {/* Car Insurance */}
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                {t('home.carInsuranceLabel')}
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('home.carInsuranceDetailTitle')}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {t('home.carInsuranceDetailDesc')}
              </p>
              <Button asChild size="lg">
                <LocalizedLink to="/assurance-voiture">
                  {t('home.compareCarInsurance')}
                </LocalizedLink>
              </Button>
            </div>
            <div className="order-1 lg:order-2">
              <img 
                src={resolveLegacyImageUrl("car-sales.jpg")}
                alt="Assurance voiture"
                className="rounded-2xl shadow-lg w-full h-auto object-cover aspect-[4/3]"
                loading="lazy"
              />
            </div>
          </div>
          
          {/* Health Insurance */}
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <img 
                src={resolveLegacyImageUrl("health-consultation.jpg")}
                alt="Assurance santé"
                className="rounded-2xl shadow-lg w-full h-auto object-cover aspect-[4/3]"
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                {t('home.healthInsuranceLabel')}
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('home.healthInsuranceDetailTitle')}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {t('home.healthInsuranceDetailDesc')}
              </p>
              <Button asChild size="lg">
                <LocalizedLink to="/assurance-sante">
                  {t('home.compareHealthInsurance')}
                </LocalizedLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InsuranceDetails;
