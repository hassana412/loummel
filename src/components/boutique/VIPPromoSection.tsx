import { Crown, Sparkles, ShoppingBag, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PromoItem {
  id: string;
  name: string;
  description: string;
  image: string;
  originalPrice: number;
  promoPrice?: number;
  type: 'product' | 'service';
}

interface VIPPromoSectionProps {
  shopName: string;
  whatsapp: string;
  promoTitle?: string;
  promoItems: PromoItem[];
}

const VIPPromoSection = ({ shopName, whatsapp, promoTitle, promoItems }: VIPPromoSectionProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const getDiscount = (original: number, promo?: number) => {
    if (!promo) return 0;
    return Math.round(((original - promo) / original) * 100);
  };

  const handleWhatsAppOrder = (itemName: string) => {
    const message = encodeURIComponent(
      `Bonjour ${shopName}! Je suis intéressé(e) par "${itemName}" vu sur Loummel. Pouvez-vous me donner plus d'informations?`
    );
    window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank');
  };

  if (promoItems.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-200/50 rounded-2xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg shadow-lg animate-pulse">
          <Crown className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-xl font-bold text-foreground">
              {promoTitle || "Offres Spéciales VIP"}
            </h3>
            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Exclusif
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Promotions exclusives de {shopName}
          </p>
        </div>
      </div>

      {/* Promo Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promoItems.slice(0, 3).map((item) => {
          const discount = getDiscount(item.originalPrice, item.promoPrice);
          
          return (
            <div
              key={item.id}
              className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-red-500 text-white border-0 font-bold">
                    -{discount}%
                  </Badge>
                </div>
              )}

              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    <ShoppingBag className="w-3 h-3 mr-1" />
                    {item.type === 'product' ? 'Produit' : 'Service'}
                  </Badge>
                </div>

                <h4 className="font-semibold text-foreground mb-1 line-clamp-1">
                  {item.name}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {item.description}
                </p>

                {/* Pricing */}
                <div className="flex items-center gap-2 mb-3">
                  {item.promoPrice ? (
                    <>
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(item.promoPrice)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>

                {/* WhatsApp Button */}
                <Button
                  onClick={() => handleWhatsAppOrder(item.name)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Commander via WhatsApp
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default VIPPromoSection;
