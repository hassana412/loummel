import { 
  Globe, 
  Megaphone, 
  MessageCircle, 
  TrendingUp, 
  Headphones, 
  CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Globe,
    title: "Référencement SEO",
    description: "Optimisez la visibilité de votre boutique sur les moteurs de recherche",
    price: "+3 000 FCFA/an",
  },
  {
    icon: Megaphone,
    title: "Publicité Page d'Accueil",
    description: "Mettez votre boutique en avant sur la page principale de Loummel",
    price: "+2 000 FCFA/mois",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Business",
    description: "Intégration directe avec WhatsApp pour vos clients",
    price: "+2 000 FCFA/an",
  },
  {
    icon: TrendingUp,
    title: "Pub Réseaux Sociaux",
    description: "Promotion sur TikTok, Facebook et Instagram",
    price: "+3 000 FCFA/an",
  },
  {
    icon: Headphones,
    title: "Accompagnement VIP",
    description: "Support personnalisé et conseils pour développer vos ventes",
    price: "+5 000 FCFA/an",
  },
];

const ServicesSection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-sahel-earth to-sahel-earth/90">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Services Premium
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mt-2 mb-4">
            Boostez votre Boutique
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Ajoutez des services supplémentaires pour augmenter votre visibilité et vos ventes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center shrink-0 group-hover:bg-accent/30 transition-colors">
                  <service.icon className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-primary-foreground text-lg mb-2">
                    {service.title}
                  </h3>
                  <p className="text-primary-foreground/70 text-sm mb-3">
                    {service.description}
                  </p>
                  <p className="text-accent font-semibold text-sm">
                    {service.price}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Basic Subscription */}
          <div className="bg-card rounded-xl p-6 border border-border flex flex-col justify-center animate-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            <h3 className="font-display font-bold text-foreground text-xl mb-4">
              Abonnement Base
            </h3>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Boutique 3 pages complète
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                12 produits + 5 services
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Page contact personnalisée
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Support technique inclus
              </li>
            </ul>
            <div className="mb-4">
              <span className="text-3xl font-bold text-foreground">5 000</span>
              <span className="text-muted-foreground"> FCFA/an</span>
            </div>
            <Button variant="outline" className="w-full">
              Commencer
            </Button>
          </div>

          {/* VIP Pack */}
          <div className="bg-gradient-to-br from-accent to-sahel-ochre rounded-xl p-6 flex flex-col justify-center animate-fade-up"
            style={{ animationDelay: "0.6s" }}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-accent-foreground/80 mb-2">Pack Complet</span>
            <h3 className="font-display font-bold text-accent-foreground text-xl mb-4">
              Pack VIP
            </h3>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-accent-foreground/90 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Boutique 3 pages complète
              </li>
              <li className="flex items-center gap-2 text-accent-foreground/90 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Référencement SEO inclus
              </li>
              <li className="flex items-center gap-2 text-accent-foreground/90 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Pub Réseaux Sociaux inclus
              </li>
              <li className="flex items-center gap-2 text-accent-foreground/90 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Accompagnement personnalisé
              </li>
            </ul>
            <div className="mb-4">
              <span className="text-3xl font-bold text-accent-foreground">15 000</span>
              <span className="text-accent-foreground/80"> FCFA/an</span>
            </div>
            <Button variant="sahel" className="w-full">
              Souscrire VIP
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
