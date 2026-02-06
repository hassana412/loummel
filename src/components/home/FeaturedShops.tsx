import { Star, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import potteryImg from "@/assets/artisan-pottery.jpg";
import leatherImg from "@/assets/artisan-leather.jpg";
import textilesImg from "@/assets/artisan-textiles.jpg";
import furnitureImg from "@/assets/furniture.jpg";

const shops = [
  {
    id: 1,
    name: "Artisanat Kapsiki",
    category: "Poterie & Céramique",
    location: "Rhumsiki",
    rating: 4.8,
    reviews: 124,
    image: potteryImg,
    featured: true,
  },
  {
    id: 2,
    name: "Cuir du Sahel",
    category: "Maroquinerie",
    location: "Maroua",
    rating: 4.9,
    reviews: 89,
    image: leatherImg,
    featured: true,
  },
  {
    id: 3,
    name: "Tissages Mandara",
    category: "Textiles",
    location: "Mokolo",
    rating: 4.7,
    reviews: 156,
    image: textilesImg,
    featured: false,
  },
  {
    id: 4,
    name: "Meubles Tradition",
    category: "Mobilier",
    location: "Garoua",
    rating: 4.6,
    reviews: 67,
    image: furnitureImg,
    featured: false,
  },
];

const FeaturedShops = () => {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Boutiques Vedettes
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Nos Meilleurs Artisans
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez les boutiques les mieux notées et les artisans les plus talentueux du Nord Cameroun
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shops.map((shop, index) => (
            <div
              key={shop.id}
              className="group bg-card rounded-xl overflow-hidden shadow-ecom hover:shadow-ecom-hover transition-all duration-300 hover:-translate-y-1 animate-fade-up border border-border"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={shop.image}
                  alt={shop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {shop.featured && (
                  <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground border-0">
                    ⭐ Vedette
                  </Badge>
                )}
              </div>
              
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-display font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                      {shop.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{shop.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{shop.location}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-vip-gold fill-vip-gold" />
                    <span className="font-semibold text-foreground">{shop.rating}</span>
                    <span className="text-muted-foreground text-sm">({shop.reviews})</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                    Visiter
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg">
            Voir toutes les boutiques
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedShops;
