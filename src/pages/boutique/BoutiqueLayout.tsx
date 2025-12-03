import { Outlet, useParams, NavLink } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Store, ShoppingBag, Briefcase, Phone, Star, MapPin, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VIPPromoSection from "@/components/boutique/VIPPromoSection";

// Demo shop data
const demoShop = {
  name: "Artisanat du Sahel",
  description: "Découvrez l'authenticité de l'artisanat du Nord Cameroun. Bijoux, poteries et textiles faits main par des artisans locaux.",
  category: "Artisanat",
  location: "Maroua, Extrême-Nord",
  rating: 4.8,
  reviews: 124,
  logo: "/placeholder.svg",
  isVIP: true,
  whatsapp: "237677123456",
  vipPromo: {
    title: "🔥 Offres de la Semaine",
    items: [
      { id: "p1", name: "Collier Fulani Premium", description: "Pièce unique en perles et or", image: "/placeholder.svg", originalPrice: 45000, promoPrice: 35000, type: "product" as const },
      { id: "p2", name: "Vase Rhumsiki", description: "Poterie traditionnelle décorée", image: "/placeholder.svg", originalPrice: 28000, promoPrice: 22000, type: "product" as const },
      { id: "s1", name: "Atelier Découverte", description: "3h d'initiation à l'artisanat", image: "/placeholder.svg", originalPrice: 25000, type: "service" as const },
    ]
  }
};

const BoutiqueLayout = () => {
  const { slug } = useParams();

  const navItems = [
    { to: `/boutique/${slug}`, label: "Produits", icon: ShoppingBag, end: true },
    { to: `/boutique/${slug}/services`, label: "Services", icon: Briefcase },
    { to: `/boutique/${slug}/contact`, label: "Contact", icon: Phone },
  ];

  return (
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
                    src={demoShop.logo}
                    alt={demoShop.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {demoShop.isVIP && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-400 to-yellow-500 p-1.5 rounded-full shadow-lg">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    {demoShop.name}
                  </h1>
                  {demoShop.isVIP && (
                    <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      VIP
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-3 max-w-2xl">
                  {demoShop.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <Badge variant="outline">
                    <Store className="w-3 h-3 mr-1" />
                    {demoShop.category}
                  </Badge>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {demoShop.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{demoShop.rating}</span>
                    <span className="text-muted-foreground">({demoShop.reviews} avis)</span>
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
          {demoShop.isVIP && demoShop.vipPromo && (
            <VIPPromoSection
              shopName={demoShop.name}
              whatsapp={demoShop.whatsapp}
              promoTitle={demoShop.vipPromo.title}
              promoItems={demoShop.vipPromo.items}
            />
          )}
          
          <Outlet />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BoutiqueLayout;
