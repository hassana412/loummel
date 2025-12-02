import { FileText, Store, CreditCard, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: FileText,
    step: "01",
    title: "Inscrivez-vous",
    description: "Remplissez le formulaire d'inscription avec vos informations commerciales",
  },
  {
    icon: Store,
    step: "02",
    title: "Créez votre boutique",
    description: "Personnalisez vos 3 pages : Produits (12), Services (5) et Contact",
  },
  {
    icon: CreditCard,
    step: "03",
    title: "Souscrivez",
    description: "Choisissez votre abonnement annuel et activez des services additionnels",
  },
  {
    icon: Globe,
    step: "04",
    title: "Vendez en ligne",
    description: "Votre mini-site est disponible sur internet pour vos clients",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Pour les Commerçants
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Créez votre boutique en ligne en quelques étapes simples et commencez à vendre vos produits
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative group animate-fade-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="bg-card rounded-xl p-6 shadow-sahel hover:shadow-sahel-card transition-all duration-300 h-full border border-border/50 hover:border-primary/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-sahel-ochre flex items-center justify-center shadow-sahel group-hover:scale-110 transition-transform">
                    <step.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="font-display text-4xl font-bold text-muted/30">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {/* Arrow connector */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-primary/40" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="hero" size="xl">
            <Store className="w-5 h-5 mr-2" />
            Créer ma boutique gratuitement
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
