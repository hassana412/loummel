import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Menu, X, User, Store, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";

const Header = () => {
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "Artisanat",
    "Électronique",
    "Téléphones",
    "Meubles",
    "Restaurant",
    "Textiles",
    "Bijoux",
    "Cuir",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getDashboardLink = () => {
    if (roles.includes("super_admin")) return "/dashboard/admin";
    if (roles.includes("partner")) return "/dashboard/partenaire";
    if (roles.includes("shop_owner")) return "/dashboard/boutique";
    return "/auth";
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className="bg-sahel-earth text-primary-foreground py-2">
        <div className="container flex items-center justify-between text-sm">
          <span className="hidden md:block">
            Bienvenue sur Loummel - Le marché digital du Nord Cameroun
          </span>
          <div className="flex items-center gap-4">
            <Link to="/inscription-vendeur" className="hover:text-accent transition-colors">
              Vendre sur Loummel
            </Link>
            <Link to="/backoffice" className="hover:text-accent transition-colors">
              Backoffice
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-background/95 backdrop-blur-md border-b border-border shadow-sahel">
        <div className="container py-4">
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sahel-terracotta to-sahel-gold flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground hidden sm:block">
                Loum<span className="text-primary">mel</span>
              </span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 hidden md:flex">
              <div className="relative w-full max-w-2xl">
                <Input
                  type="search"
                  placeholder="Rechercher produits, boutiques, artisans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-4 pr-12 rounded-full border-2 border-border focus:border-primary bg-card"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-9 w-9"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {user && <NotificationBell />}
              
              <Link to={user ? getDashboardLink() : "/auth"}>
                <Button variant="ghost" size="icon" className="hidden lg:flex">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
              
              <Link to="/devenir-partenaire" className="hidden lg:block">
                <Button variant="outline" size="sm">
                  <Handshake className="w-4 h-4 mr-1" />
                  Devenir Partenaire
                </Button>
              </Link>
              
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  0
                </span>
              </Button>
              
              <Link to="/inscription-vendeur" className="hidden lg:block">
                <Button variant="hero" size="sm">
                  <Store className="w-4 h-4 mr-1" />
                  Créer ma Boutique
                </Button>
              </Link>
              
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mt-4 md:hidden">
            <div className="relative">
              <Input
                type="search"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-4 pr-10 rounded-full border-2 border-border"
              />
              <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
                <Search className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </form>
        </div>

        {/* Categories Nav */}
        <nav className="bg-sahel-sky border-t border-sahel-sky/60 hidden lg:block">
          <div className="container">
            <ul className="flex items-center gap-1 py-2 overflow-x-auto">
              <li>
                <Link to="/recherche">
                  <Button variant="ghost" size="sm" className="text-sm font-medium">
                    <Menu className="w-4 h-4 mr-1" />
                    Toutes les catégories
                  </Button>
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat}>
                  <Link to={`/recherche?category=${encodeURIComponent(cat)}`}>
                    <Button variant="ghost" size="sm" className="text-sm">
                      {cat}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[120px] bg-background z-40 lg:hidden animate-fade-in">
          <div className="container py-6">
            <div className="space-y-4">
              <Link to="/inscription-vendeur" onClick={() => setIsMenuOpen(false)}>
                <Button variant="hero" className="w-full">
                  <Store className="w-4 h-4 mr-2" />
                  Créer ma Boutique
                </Button>
              </Link>
              <Link to="/devenir-partenaire" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  <Handshake className="w-4 h-4 mr-2" />
                  Devenir Partenaire
                </Button>
              </Link>
              <Link to={user ? getDashboardLink() : "/auth"} onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  <User className="w-4 h-4 mr-2" />
                  {user ? "Mon compte" : "Se connecter"}
                </Button>
              </Link>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <Link key={cat} to={`/recherche?category=${encodeURIComponent(cat)}`} onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      {cat}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
