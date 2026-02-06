import { useState, useEffect } from "react";
import { Crown, Star, ArrowRight, ShoppingBag, Store, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface VIPItem {
  id: string;
  type: 'shop' | 'product' | 'service';
  name: string;
  description: string;
  image: string;
  price?: number;
  shopName?: string;
  shopSlug?: string;
  rating?: number;
}

// Demo VIP items
const vipItems: VIPItem[] = [
  {
    id: "1",
    type: "shop",
    name: "Artisanat Rhumsiki",
    description: "Poteries traditionnelles et sculptures du Nord Cameroun",
    image: "/placeholder.svg",
    shopSlug: "artisanat-rhumsiki",
    rating: 4.9
  },
  {
    id: "2",
    type: "product",
    name: "Collier en Perles Fulani",
    description: "Bijou artisanal authentique fait main",
    image: "/placeholder.svg",
    price: 25000,
    shopName: "Bijoux du Sahel",
    shopSlug: "bijoux-sahel"
  },
  {
    id: "3",
    type: "service",
    name: "Restauration Meubles Anciens",
    description: "Service professionnel de restauration",
    image: "/placeholder.svg",
    price: 50000,
    shopName: "Ébénisterie Maroua",
    shopSlug: "ebenisterie-maroua"
  },
  {
    id: "4",
    type: "product",
    name: "Tapis Tissé Traditionnel",
    description: "Grand tapis en laine naturelle tissé à la main",
    image: "/placeholder.svg",
    price: 75000,
    shopName: "Textiles du Nord",
    shopSlug: "textiles-nord"
  }
];

const VIPShowcase = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % vipItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'shop': return <Store className="w-4 h-4" />;
      case 'product': return <ShoppingBag className="w-4 h-4" />;
      case 'service': return <Calendar className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'shop': return 'Boutique VIP';
      case 'product': return 'Produit VIP';
      case 'service': return 'Service VIP';
      default: return 'VIP';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  return (
    <section className="py-12 bg-gradient-to-r from-vip-gold/10 via-accent/5 to-vip-gold/10 border-y border-vip-gold/20">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-vip-gold to-accent rounded-lg shadow-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Vitrine VIP
              </h2>
              <p className="text-sm text-muted-foreground">
                Découvrez nos boutiques et produits premium
              </p>
            </div>
          </div>
          <Link to="/boutiques?filter=vip">
            <Button variant="outline" size="sm" className="border-vip-gold text-vip-gold hover:bg-vip-gold/10">
              Voir tout
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vipItems.map((item, index) => (
            <div
              key={item.id}
              className={`group relative bg-card rounded-xl overflow-hidden shadow-ecom-card border border-vip-gold/20 hover:shadow-ecom-hover transition-all duration-300 hover:-translate-y-1 ${
                index === currentIndex ? 'ring-2 ring-vip-gold' : ''
              }`}
            >
              {/* VIP Badge */}
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-gradient-to-r from-vip-gold to-accent text-white border-0 shadow-md">
                  <Crown className="w-3 h-3 mr-1" />
                  VIP
                </Badge>
              </div>

              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center gap-1 text-xs text-vip-gold font-medium">
                    {getTypeIcon(item.type)}
                    {getTypeLabel(item.type)}
                  </span>
                  {item.rating && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                      <Star className="w-3 h-3 fill-vip-gold text-vip-gold" />
                      {item.rating}
                    </span>
                  )}
                </div>

                <h3 className="font-display font-semibold text-foreground mb-1 line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {item.description}
                </p>

                {item.shopName && (
                  <p className="text-xs text-muted-foreground mb-2">
                    par <span className="font-medium text-primary">{item.shopName}</span>
                  </p>
                )}

                <div className="flex items-center justify-between">
                  {item.price && (
                    <span className="font-bold text-primary">
                      {formatPrice(item.price)}
                    </span>
                  )}
                  <Link to={`/boutique/${item.shopSlug}`}>
                    <Button size="sm" variant="vip" className="ml-auto">
                      {item.type === 'shop' ? 'Visiter' : 'Commander'}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          ))}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {vipItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-6 bg-vip-gold'
                  : 'bg-vip-gold/30 hover:bg-vip-gold/50'
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Vous êtes vendeur ? Passez au Pack VIP pour apparaître ici !
          </p>
          <Link to="/inscription-vendeur">
            <Button variant="outline" className="border-vip-gold text-vip-gold hover:bg-vip-gold/10">
              <Crown className="w-4 h-4 mr-2" />
              Devenir VIP - 15 000 FCFA/an
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default VIPShowcase;
