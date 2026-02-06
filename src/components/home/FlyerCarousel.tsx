import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Flame, Sparkles, Gift, Percent, Store, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Flyer {
  id: string;
  type: 'promo' | 'new_shop' | 'deal' | 'event';
  title: string;
  subtitle: string;
  description: string | null;
  image_url: string | null;
  cta_text: string;
  cta_link: string;
  badge: string | null;
  discount: string | null;
  end_date: string | null;
  gradient: string;
}

const defaultFlyers: Flyer[] = [
  {
    id: "1",
    type: "deal",
    title: "🔥 Ventes Flash",
    subtitle: "Jusqu'à -50% sur l'artisanat",
    description: "Profitez de réductions exceptionnelles sur nos produits artisanaux du Nord Cameroun",
    image_url: null,
    cta_text: "Voir les offres",
    cta_link: "/recherche?promo=true",
    badge: "FLASH DEAL",
    discount: "-50%",
    end_date: null,
    gradient: "from-red-600 via-orange-500 to-yellow-500"
  },
  {
    id: "2",
    type: "new_shop",
    title: "✨ Nouvelle Boutique",
    subtitle: "Artisanat Mandara",
    description: "Découvrez les créations uniques de notre nouvel artisan partenaire",
    image_url: null,
    cta_text: "Découvrir",
    cta_link: "/recherche",
    badge: "NOUVEAU",
    discount: null,
    end_date: null,
    gradient: "from-emerald-600 via-teal-500 to-cyan-500"
  }
];

const FlyerCarousel = () => {
  const [flyers, setFlyers] = useState<Flyer[]>(defaultFlyers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchFlyers = async () => {
      const { data, error } = await supabase
        .from('flyers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (data && data.length > 0) {
        setFlyers(data as Flyer[]);
      }
    };

    fetchFlyers();
  }, []);

  const goToSlide = useCallback((index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? flyers.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, flyers.length, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % flyers.length;
    goToSlide(newIndex);
  }, [currentIndex, flyers.length, goToSlide]);

  useEffect(() => {
    if (!isAutoPlaying || flyers.length <= 1) return;
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, flyers.length]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deal': return <Flame className="w-5 h-5" />;
      case 'new_shop': return <Store className="w-5 h-5" />;
      case 'promo': return <Gift className="w-5 h-5" />;
      case 'event': return <Sparkles className="w-5 h-5" />;
      default: return null;
    }
  };

  const calculateTimeRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}j restants`;
    }
    return `${hours}h restantes`;
  };

  if (flyers.length === 0) return null;

  return (
    <section 
      className="relative overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Main Carousel */}
      <div className="relative h-[280px] md:h-[350px] lg:h-[400px]">
        {flyers.map((flyer, index) => (
          <div
            key={flyer.id}
            className={`absolute inset-0 transition-all duration-500 ease-out ${
              index === currentIndex 
                ? 'opacity-100 translate-x-0 z-10' 
                : index < currentIndex 
                  ? 'opacity-0 -translate-x-full z-0'
                  : 'opacity-0 translate-x-full z-0'
            }`}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${flyer.gradient}`} />
            
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            {/* Content */}
            <div className="relative container h-full flex items-center">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full py-8">
                {/* Text Content */}
                <div className="text-white space-y-4 animate-fade-up">
                  {/* Badge */}
                  <div className="flex items-center gap-3">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1 text-sm font-bold animate-pulse-deal">
                      {getTypeIcon(flyer.type)}
                      <span className="ml-1">{flyer.badge}</span>
                    </Badge>
                    {flyer.end_date && calculateTimeRemaining(flyer.end_date) && (
                      <span className="flex items-center gap-1 text-sm text-white/90">
                        <Clock className="w-4 h-4" />
                        {calculateTimeRemaining(flyer.end_date)}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    {flyer.title}
                  </h2>
                  
                  {/* Subtitle with discount */}
                  <div className="flex items-center gap-4">
                    <p className="text-xl md:text-2xl font-semibold text-white/95">
                      {flyer.subtitle}
                    </p>
                    {flyer.discount && (
                      <span className="bg-white text-red-600 font-bold text-2xl md:text-3xl px-4 py-1 rounded-lg animate-bounce-subtle shadow-lg">
                        {flyer.discount}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {flyer.description && (
                    <p className="text-base md:text-lg text-white/80 max-w-md">
                      {flyer.description}
                    </p>
                  )}

                  {/* CTA */}
                  <Link to={flyer.cta_link}>
                    <Button 
                      size="lg" 
                      className="bg-white text-foreground hover:bg-white/90 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 mt-2"
                    >
                      {flyer.cta_text}
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  </Link>
                </div>

                {/* Visual Element */}
                <div className="hidden lg:flex justify-end items-center">
                  <div className="relative">
                    {/* Decorative circles */}
                    <div className="absolute -inset-8 bg-white/10 rounded-full blur-2xl animate-pulse" />
                    <div className="relative bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-2xl">
                      <div className="w-48 h-48 flex items-center justify-center">
                        {flyer.type === 'deal' && (
                          <div className="text-center">
                            <Percent className="w-24 h-24 text-white mb-2 animate-bounce-subtle" />
                            <span className="text-4xl font-bold text-white">{flyer.discount}</span>
                          </div>
                        )}
                        {flyer.type === 'new_shop' && (
                          <Store className="w-32 h-32 text-white animate-bounce-subtle" />
                        )}
                        {flyer.type === 'promo' && (
                          <Gift className="w-32 h-32 text-white animate-bounce-subtle" />
                        )}
                        {flyer.type === 'event' && (
                          <Sparkles className="w-32 h-32 text-white animate-bounce-subtle" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        {flyers.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all hover:scale-110"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all hover:scale-110"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {flyers.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {flyers.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Mini Flyer Previews - Desktop only */}
      {flyers.length > 1 && (
        <div className="hidden xl:block absolute bottom-6 right-8 z-20">
          <div className="flex gap-2">
            {flyers.map((flyer, index) => (
              <button
                key={flyer.id}
                onClick={() => goToSlide(index)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden transition-all ${
                  index === currentIndex
                    ? 'ring-2 ring-white scale-110'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${flyer.gradient}`} />
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  {getTypeIcon(flyer.type)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default FlyerCarousel;
