import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Store, MapPin, Crown, Filter, X } from "lucide-react";
import { getAllRegionNames } from "@/data/cameroon-regions";

interface Shop {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  region: string | null;
  city: string | null;
  is_vip: boolean;
  logo_url: string | null;
}

const categories = [
  "Artisanat", "Électronique", "Téléphones", "Meubles", 
  "Restaurant", "Textiles", "Bijoux", "Cuir", "Poterie", "Autre"
];

const Recherche = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get("region") || "all");
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const regions = getAllRegionNames();

  useEffect(() => {
    fetchShops();
  }, [searchParams]);

  const fetchShops = async () => {
    setLoading(true);
    
    let queryBuilder = supabase
      .from("shops")
      .select("id, name, slug, category, description, region, city, is_vip, logo_url")
      .eq("status", "active");

    const searchQuery = searchParams.get("q");
    const categoryFilter = searchParams.get("category");
    const regionFilter = searchParams.get("region");

    if (searchQuery) {
      queryBuilder = queryBuilder.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    if (categoryFilter) {
      queryBuilder = queryBuilder.eq("category", categoryFilter);
    }

    if (regionFilter) {
      queryBuilder = queryBuilder.eq("region", regionFilter);
    }

    // Order by VIP first, then by name
    queryBuilder = queryBuilder.order("is_vip", { ascending: false }).order("name");

    const { data, error } = await queryBuilder;

    if (!error && data) {
      setShops(data);
    }
    
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedRegion && selectedRegion !== "all") params.set("region", selectedRegion);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setSelectedRegion("all");
    setSearchParams(new URLSearchParams());
  };

  const hasFilters = query || (selectedCategory && selectedCategory !== "all") || (selectedRegion && selectedRegion !== "all");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Recherche
            </h1>
            <p className="text-muted-foreground">
              Trouvez les meilleures boutiques et services du Nord Cameroun
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Input
                  type="search"
                  placeholder="Rechercher une boutique, un produit..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-12 pl-4 pr-12"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                className="md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
            </div>

            {/* Filters */}
            <div className={`mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 ${showFilters ? "block" : "hidden md:grid"}`}>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les régions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les régions</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
                {hasFilters && (
                  <Button type="button" variant="outline" onClick={clearFilters}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>

          {/* Results */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          ) : shops.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Aucun résultat</h2>
                <p className="text-muted-foreground mb-4">
                  Aucune boutique ne correspond à votre recherche.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {shops.length} boutique{shops.length > 1 ? "s" : ""} trouvée{shops.length > 1 ? "s" : ""}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shops.map((shop) => (
                  <Link key={shop.id} to={`/boutique/${shop.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                      <div className="aspect-video bg-gradient-to-br from-sahel-terracotta/20 to-sahel-ochre/20 relative flex items-center justify-center">
                        {shop.logo_url ? (
                          <img
                            src={shop.logo_url}
                            alt={shop.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Store className="w-12 h-12 text-sahel-terracotta" />
                        )}
                        {shop.is_vip && (
                          <Badge className="absolute top-2 right-2 bg-amber-500">
                            <Crown className="w-3 h-3 mr-1" />
                            VIP
                          </Badge>
                        )}
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-lg mb-1">{shop.name}</h3>
                        {shop.category && (
                          <Badge variant="outline" className="mb-2">
                            {shop.category}
                          </Badge>
                        )}
                        {shop.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {shop.description}
                          </p>
                        )}
                        {(shop.city || shop.region) && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3 mr-1" />
                            {[shop.city, shop.region].filter(Boolean).join(", ")}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Recherche;
