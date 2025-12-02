import { Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary via-sahel-ochre to-accent relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Prêt à lancer votre boutique en ligne ?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Rejoignez des centaines de commerçants et artisans du Nord Cameroun. 
            Créez votre boutique dès aujourd'hui et atteignez de nouveaux clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="sahel" 
              size="xl"
              className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90"
            >
              <Store className="w-5 h-5 mr-2" />
              Créer ma Boutique
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            >
              En savoir plus
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
