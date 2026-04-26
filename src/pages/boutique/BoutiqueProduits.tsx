import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShoppingBag, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShop } from "./BoutiqueLayout";
import { useCart } from "@/contexts/CartContext";

// Import des images locales
import artisanJewelry from "@/assets/artisan-jewelry.jpg";
import artisanPottery from "@/assets/artisan-pottery.jpg";
import artisanLeather from "@/assets/artisan-leather.jpg";
import artisanTextiles from "@/assets/artisan-textiles.jpg";

// Map des images locales
const imageMap: Record<string, string> = {
  '/src/assets/artisan-jewelry.jpg': artisanJewelry,
  '/src/assets/artisan-pottery.jpg': artisanPottery,
  '/src/assets/artisan-leather.jpg': artisanLeather,
  '/src/assets/artisan-textiles.jpg': artisanTextiles,
};

// Helper pour résoudre les URLs d'images
const resolveImageUrl = (url: string | null): string => {
  if (!url) return "/placeholder.svg";
  if (imageMap[url]) return imageMap[url];
  return url;
};

// Demo products for "artisanat-rhumsiki"
const demoProducts = [
  { id: "1", name: "Collier Fulani traditionnel", description: "Magnifique collier artisanal en perles multicolores et métal forgé. Pièce unique fabriquée par les artisans Fulani.", price: 35000, category: "Bijoux", image_url: artisanJewelry, is_promo: true, promo_price: 28000 },
  { id: "2", name: "Poterie Rhumsiki décorative", description: "Vase décoratif peint à la main avec des motifs traditionnels du Sahel.", price: 28000, category: "Poterie", image_url: artisanPottery, is_promo: false, promo_price: null },
  { id: "3", name: "Sac en cuir tressé artisanal", description: "Sac en cuir de chèvre tanné naturellement. Design authentique avec finitions en cuivre.", price: 45000, category: "Cuir", image_url: artisanLeather, is_promo: false, promo_price: null },
  { id: "4", name: "Bracelet en cuivre gravé", description: "Bracelet en cuivre pur avec gravures de motifs traditionnels Fulani.", price: 18000, category: "Bijoux", image_url: artisanJewelry, is_promo: true, promo_price: 15000 },
  { id: "5", name: "Tapis tissé Sahel authentique", description: "Grand tapis tissé à la main en laine naturelle. Dimensions 2m x 1.5m.", price: 85000, category: "Textiles", image_url: artisanTextiles, is_promo: false, promo_price: null },
  { id: "6", name: "Sculpture montagne Rhumsiki", description: "Sculpture en bois d'ébène représentant les pics montagneux de Rhumsiki.", price: 55000, category: "Artisanat", image_url: artisanPottery, is_promo: false, promo_price: null },
  { id: "7", name: "Boubou brodé premium", description: "Boubou en bazin riche avec broderies artisanales traditionnelles.", price: 75000, category: "Textiles", image_url: artisanTextiles, is_promo: true, promo_price: 65000 },
];

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  is_promo: boolean | null;
  promo_price: number | null;
}

const categories = ["Tous", "Bijoux", "Poterie", "Cuir", "Textiles", "Artisanat"];

const BoutiqueProduits = () => {
  const { slug } = useParams();
  const { shop } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tous");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const fetchProducts = async () => {
      if (!shop) return;

      // Demo shop fallback
      if (shop.id === "demo-artisanat-rhumsiki" || slug === "artisanat-rhumsiki") {
        // Try DB first
        const { data } = await supabase
          .from("products")
          .select("*")
          .eq("shop_id", shop.id)
          .order("sort_order");

        if (data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(demoProducts);
        }
        setLoading(false);
        return;
      }

      // Load from Supabase
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shop.id)
        .order("sort_order");

      if (data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [shop, slug]);

  const filteredProducts = products
    .filter(p => filter === "Tous" || p.category === filter)
    .sort((a, b) => {
      const priceA = a.is_promo && a.promo_price ? a.promo_price : a.price;
      const priceB = b.is_promo && b.promo_price ? b.promo_price : b.price;
      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      return 0;
    });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const handleWhatsAppOrder = (productName: string) => {
    const whatsapp = shop?.contact_whatsapp || "237677888999";
    const shopName = shop?.name || "la boutique";
    const message = encodeURIComponent(
      `Bonjour ${shopName}! Je suis intéressé(e) par "${productName}" vu sur Loummel. Pouvez-vous me donner plus d'informations?`
    );
    window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Nos Produits
          </h2>
          <p className="text-muted-foreground">{filteredProducts.length} produits disponibles</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Par défaut</SelectItem>
              <SelectItem value="price-asc">Prix croissant</SelectItem>
              <SelectItem value="price-desc">Prix décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const hasPromo = product.is_promo && product.promo_price;
          const displayPrice = hasPromo ? product.promo_price! : product.price;

          return (
            <div
              key={product.id}
              className="group bg-card rounded-xl overflow-hidden shadow-sahel hover:shadow-sahel-card transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <Link to={`/boutique/${slug}/produit/${product.id}`} className="block relative h-48 overflow-hidden">
                <img
                  src={resolveImageUrl(product.image_url)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {product.category && (
                    <Badge className="bg-background/90">
                      {product.category}
                    </Badge>
                  )}
                  {hasPromo && (
                    <Badge className="bg-red-500 text-white">
                      Promo
                    </Badge>
                  )}
                </div>
              </Link>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(displayPrice)}
                    </span>
                    {hasPromo && (
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleWhatsAppOrder(product.name)}
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Commander
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun produit trouvé dans cette catégorie</p>
        </div>
      )}
    </div>
  );
};

export default BoutiqueProduits;