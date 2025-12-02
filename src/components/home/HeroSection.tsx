import { ArrowRight, Store, Users, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-rhumsiki.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Montagnes de Rhumsiki, Nord Cameroun"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sahel-earth/90 via-sahel-earth/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-sahel-earth/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container py-16 md:py-24 lg:py-32">
        <div className="max-w-2xl">
          <div className="animate-fade-up">
            <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-accent/30">
              🌍 La marketplace du Nord Cameroun
            </span>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Découvrez les trésors du
              <span className="text-gradient block">Sahel Camerounais</span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed">
              Artisanat authentique, produits locaux et services de qualité. 
              Rejoignez la communauté de commerçants et artisans du Nord Cameroun.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button variant="hero" size="xl">
                <Store className="w-5 h-5 mr-2" />
                Créer ma Boutique
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                Explorer les Boutiques
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="text-center p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <Store className="w-6 h-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl md:text-3xl font-bold text-primary-foreground">500+</p>
              <p className="text-sm text-primary-foreground/70">Boutiques</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl md:text-3xl font-bold text-primary-foreground">10K+</p>
              <p className="text-sm text-primary-foreground/70">Produits</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <Users className="w-6 h-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl md:text-3xl font-bold text-primary-foreground">25K+</p>
              <p className="text-sm text-primary-foreground/70">Clients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
