import { useState, useEffect, createContext, useContext } from "react";
import { Outlet, useParams, NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Store, ShoppingBag, Briefcase, Phone, Star, MapPin, Crown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VIPPromoSection from "@/components/boutique/VIPPromoSection";

// Demo shop data for "artisanat-rhumsiki"
const demoShopData = {
  id: "demo-artisanat-rhumsiki",
  name: "Artisanat Rhumsiki",
  slug: "artisanat-rhumsiki",
  description: "Découvrez l'authenticité de l'artisanat du Nord Cameroun. Bijoux Fulani, poteries traditionnelles, cuir tanné et textiles faits main par des artisans locaux au pied des montagnes de Rhumsiki.",
  category: "Artisanat",
  region: "Extrême-Nord",
  city: "Rhumsiki",
  contact_address: "Marché Central de Rhumsiki, près de la Montagne, Extrême-Nord, Cameroun",
  contact_phone: "+237 677 888 999",
  contact_whatsapp: "237677888999",
  contact_email: "artisanat.rhumsiki@gmail.com",
  social_facebook: "https://facebook.com/artisanatrhumsiki",
  social_instagram: "https://instagram.com/artisanatrhumsiki",
  social_tiktok: "https://tiktok.com/@artisanatrhumsiki",
  social_youtube: "https://youtube.com/@artisanatrhumsiki",
  logo_url: "/placeholder.svg",
  is_vip: true,
  status: "active",
  rating: 4.9,
  reviews: 156,
};

interface ShopData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  region: string | null;
  city: string | null;
  contact_address: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  contact_email: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  social_tiktok: string | null;
  social_youtube: string | null;
  logo_url: string | null;
  is_vip: boolean | null;
  status: string | null;
}

interface ShopContextType {
  shop: ShopData | null;
  loading: boolean;
}

const ShopContext = createContext<ShopContextType>({ shop: null, loading: true });

export const useShop = () => useContext(ShopContext);

const BoutiqueLayout = () => {
  const { slug } = useParams();
  const [shop, setShop] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      if (!slug) return;

      // Check if it's the demo shop
      if (slug === "artisanat-rhumsiki") {
        // Try to load from DB first, fallback to demo
        const { data } = await supabase
          .from("shops")
          .select("*")
          .eq("slug", slug)
          .eq("status", "active")
          .maybeSingle();

        if (data) {
          setShop(data);
        } else {
          setShop(demoShopData as ShopData);
        }
        setLoading(false);
        return;
      }

      // Load from Supabase
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("slug", slug)
        .eq("status", "active")
        .maybeSingle();

      if (data) {
        setShop(data);
      }
      setLoading(false);
    };

    fetchShop();
  }, [slug]);

  const navItems = [
    { to: `/boutique/${slug}`, label: "Produits", icon: ShoppingBag, end: true },
    { to: `/boutique/${slug}/services`, label: "Services", icon: Briefcase },
    { to: `/boutique/${slug}/contact`, label: "Contact", icon: Phone },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Boutique non trouvée</h1>
            <p className="text-muted-foreground">Cette boutique n'existe pas ou n'est pas encore active.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const location = [shop.city, shop.region].filter(Boolean).join(", ");
  const rating = (shop as any).rating || 4.5;
  const reviews = (shop as any).reviews || 0;

  // VIP promo items for demo
  const vipPromoItems = shop.slug === "artisanat-rhumsiki" ? [
    { id: "p1", name: "Collier Fulani Premium", description: "Pièce unique en perles et métal forgé", image: "/placeholder.svg", originalPrice: 35000, promoPrice: 28000, type: "product" as const },
    { id: "p2", name: "Bracelet Cuivre Gravé", description: "Motifs traditionnels Fulani", image: "/placeholder.svg", originalPrice: 18000, promoPrice: 15000, type: "product" as const },
    { id: "s1", name: "Visite Atelier", description: "Découverte des techniques traditionnelles", image: "/placeholder.svg", originalPrice: 15000, type: "service" as const },
  ] : [];

  return (
    <ShopContext.Provider value={{ shop, loading }}>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          {/* Shop Header */}
          <div className="bg-gradient-to-r from-sahel-sand to-sahel-ochre/20 border-b">
            <div className="container py-8">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                {/* Logo */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-background shadow-sahel-card">
                    <img
                      src={shop.logo_url || "/placeholder.svg"}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {shop.is_vip && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-400 to-yellow-500 p-1.5 rounded-full shadow-lg">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      {shop.name}
                    </h1>
                    {shop.is_vip && (
                      <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0">
                        <Crown className="w-3 h-3 mr-1" />
                        VIP
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-3 max-w-2xl">
                    {shop.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {shop.category && (
                      <Badge variant="outline">
                        <Store className="w-3 h-3 mr-1" />
                        {shop.category}
                      </Badge>
                    )}
                    {location && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{rating}</span>
                      <span className="text-muted-foreground">({reviews} avis)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="mt-6 flex gap-2 overflow-x-auto pb-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-background hover:bg-muted text-foreground'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="container py-8">
            {/* VIP Promo Section - Only for VIP shops */}
            {shop.is_vip && vipPromoItems.length > 0 && (
              <VIPPromoSection
                shopName={shop.name}
                whatsapp={shop.contact_whatsapp || ""}
                promoTitle="🔥 Offres de la Semaine"
                promoItems={vipPromoItems}
              />
            )}
            
            <Outlet />
          </div>
        </main>
        
        <Footer />
      </div>
    </ShopContext.Provider>
  );
};

export default BoutiqueLayout;