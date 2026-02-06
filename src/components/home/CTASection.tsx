import { Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary via-accent to-primary relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Prêt à lancer votre boutique en ligne ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Rejoignez des centaines de commerçants et artisans du Nord Cameroun. 
            Créez votre boutique dès aujourd'hui et atteignez de nouveaux clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/creer-ma-boutique">
              <Button 
                size="xl"
                className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
              >
                <Store className="w-5 h-5 mr-2" />
                Créer ma Boutique Gratuite
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/recherche">
              <Button 
                variant="outline" 
                size="xl"
                className="border-2 border-white text-white hover:bg-white/10"
              >
                Explorer les boutiques
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
