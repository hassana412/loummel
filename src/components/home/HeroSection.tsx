import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Store, Users, ShoppingBag, Search, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-rhumsiki.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/recherche");
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-accent to-primary">
      {/* Background Image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Montagnes de Rhumsiki, Nord Cameroun"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-accent/70" />
      </div>

      {/* Content */}
      <div className="relative container py-12 md:py-16 lg:py-20">
        <div className="max-w-3xl">
          <div className="animate-fade-up">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold border border-white/30">
                <Zap className="w-4 h-4 text-yellow-300" />
                La marketplace #1 du Nord Cameroun
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold animate-pulse">
                <TrendingUp className="w-3 h-3" />
                +500 boutiques
              </span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Trouvez tout ce qu'il vous faut
              <span className="block text-yellow-300">au meilleur prix</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl">
              Artisanat authentique, électronique, mode et plus encore. 
              Des milliers de produits livrés directement chez vous.
            </p>

            {/* Search Bar - Amazon style */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="relative max-w-2xl">
                <div className="flex shadow-lg rounded-lg overflow-hidden">
                  <Input
                    type="search"
                    placeholder="Rechercher produits, boutiques, services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 h-14 pl-5 pr-4 rounded-none rounded-l-lg border-0 bg-white text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="rounded-none rounded-r-lg h-14 px-6 bg-accent hover:bg-accent/90 text-white font-semibold"
                  >
                    <Search className="w-5 h-5 md:mr-2" />
                    <span className="hidden md:inline">Rechercher</span>
                  </Button>
                </div>
              </div>
              
              {/* Quick links */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-white/70 text-sm">Populaires :</span>
                {['Bijoux', 'Poterie', 'Sacs cuir', 'Tissus', 'Meubles'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => navigate(`/recherche?q=${term}`)}
                    className="text-sm text-white/90 hover:text-white underline underline-offset-2 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link to="/creer-ma-boutique">
                <Button 
                  size="xl" 
                  className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <Store className="w-5 h-5 mr-2" />
                  Ouvrir ma boutique gratuite
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/recherche">
                <Button 
                  variant="outline" 
                  size="xl"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold"
                >
                  Explorer les produits
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats - Amazon/Alibaba style */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
              <Store className="w-6 h-6 mx-auto mb-2 text-yellow-300" />
              <p className="text-2xl md:text-3xl font-bold text-white">500+</p>
              <p className="text-sm text-white/80">Boutiques</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
              <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-yellow-300" />
              <p className="text-2xl md:text-3xl font-bold text-white">10K+</p>
              <p className="text-sm text-white/80">Produits</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
              <Users className="w-6 h-6 mx-auto mb-2 text-yellow-300" />
              <p className="text-2xl md:text-3xl font-bold text-white">25K+</p>
              <p className="text-sm text-white/80">Clients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8 md:h-12">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
                fill="hsl(var(--background))" 
                opacity=".25" />
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
                fill="hsl(var(--background))" 
                opacity=".5" />
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
                fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
