import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import LocalizedLink from "@/components/LocalizedLink";
import mascotExplaining from "@/assets/mascot-explaining.png";

const InsuranceDetails = () => {
  const { t } = useTranslation();

  const insuranceTypes = [
    {
      titleKey: "home.carInsuranceDetailTitle",
      descriptionKey: "home.carInsuranceDetailDesc",
      href: "/assurance-voiture",
      image: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/05/car-sales.jpg",
    },
    {
      titleKey: "home.healthInsuranceDetailTitle",
      descriptionKey: "home.healthInsuranceDetailDesc",
      href: "/assurance-sante",
      image: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/05/health-consultation.jpg",
    },
  ];

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
                src="https://le-comparateur-optimis.ch/wp-content/uploads/2024/05/car-sales.jpg"
                alt="Assurance voiture"
                className="rounded-2xl shadow-lg w-full h-auto object-cover aspect-[4/3]"
              />
            </div>
          </div>
          
          {/* Health Insurance */}
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <img 
                src="https://le-comparateur-optimis.ch/wp-content/uploads/2024/05/health-consultation.jpg"
                alt="Assurance santé"
                className="rounded-2xl shadow-lg w-full h-auto object-cover aspect-[4/3]"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80";
                }}
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
