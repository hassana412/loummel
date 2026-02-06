import { Flame, ArrowRight, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface Deal {
  id: string;
  name: string;
  originalPrice: number;
  dealPrice: number;
  image: string;
  shopName: string;
  shopSlug: string;
  discount: number;
  soldCount: number;
  totalStock: number;
}

const deals: Deal[] = [
  {
    id: "1",
    name: "Collier Fulani Traditionnel",
    originalPrice: 35000,
    dealPrice: 17500,
    image: "/placeholder.svg",
    shopName: "Bijoux du Sahel",
    shopSlug: "bijoux-sahel",
    discount: 50,
    soldCount: 45,
    totalStock: 60
  },
  {
    id: "2",
    name: "Poterie Artisanale Kapsiki",
    originalPrice: 28000,
    dealPrice: 19600,
    image: "/placeholder.svg",
    shopName: "Artisanat Rhumsiki",
    shopSlug: "artisanat-rhumsiki",
    discount: 30,
    soldCount: 28,
    totalStock: 40
  },
  {
    id: "3",
    name: "Sac en Cuir Handmade",
    originalPrice: 45000,
    dealPrice: 31500,
    image: "/placeholder.svg",
    shopName: "Cuir du Sahel",
    shopSlug: "cuir-sahel",
    discount: 30,
    soldCount: 35,
    totalStock: 50
  },
  {
    id: "4",
    name: "Tissu Bogolan Authentique",
    originalPrice: 25000,
    dealPrice: 15000,
    image: "/placeholder.svg",
    shopName: "Textiles Nord",
    shopSlug: "textiles-nord",
    discount: 40,
    soldCount: 60,
    totalStock: 80
  },
  {
    id: "5",
    name: "Bracelet en Perles",
    originalPrice: 12000,
    dealPrice: 7200,
    image: "/placeholder.svg",
    shopName: "Bijoux du Sahel",
    shopSlug: "bijoux-sahel",
    discount: 40,
    soldCount: 82,
    totalStock: 100
  }
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR').format(price);
};

const DealsStrip = () => {
  return (
    <section className="py-8 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255,255,255,0.1) 10px,
              rgba(255,255,255,0.1) 20px
            )`
          }}
        />
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-lg animate-pulse-deal">
              <Flame className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                Ventes Flash
              </h2>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Clock className="w-4 h-4" />
                <span>Se termine dans 23:45:12</span>
              </div>
            </div>
          </div>
          <Link to="/recherche?promo=true">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white text-white hover:bg-white hover:text-red-600 transition-colors"
            >
              Voir tout
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {deals.map((deal, index) => (
            <Link
              key={deal.id}
              to={`/boutique/${deal.shopSlug}`}
              className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-32 overflow-hidden">
                <img
                  src={deal.image}
                  alt={deal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Discount Badge */}
                <Badge className="absolute top-2 left-2 bg-red-600 text-white border-0 font-bold text-xs px-2 py-0.5">
                  -{deal.discount}%
                </Badge>
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {deal.name}
                </h3>

                {/* Prices */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-primary font-bold text-lg">
                    {formatPrice(deal.dealPrice)}
                  </span>
                  <span className="text-muted-foreground text-xs line-through">
                    {formatPrice(deal.originalPrice)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${(deal.soldCount / deal.totalStock) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {deal.soldCount} vendus
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealsStrip;
