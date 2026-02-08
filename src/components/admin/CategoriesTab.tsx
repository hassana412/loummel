import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Grid3X3, Store, Package, Wrench, Truck, 
  MessageSquareWarning, TrendingUp, ArrowLeft,
  Loader2
} from "lucide-react";
import { ShopsManagement } from "./ShopsManagement";

interface CategoryStats {
  category: string;
  totalShops: number;
  totalProducts: number;
  totalServices: number;
  totalShipments: number;
  totalComplaints: number;
  activeShops: number;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Artisanat": <Package className="w-6 h-6" />,
  "Électronique": <TrendingUp className="w-6 h-6" />,
  "Mode & Textile": <Package className="w-6 h-6" />,
  "Restauration": <Store className="w-6 h-6" />,
  "Services": <Wrench className="w-6 h-6" />,
  "Autre": <Grid3X3 className="w-6 h-6" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Artisanat": "bg-amber-500",
  "Électronique": "bg-blue-500",
  "Mode & Textile": "bg-pink-500",
  "Restauration": "bg-green-500",
  "Services": "bg-purple-500",
  "Autre": "bg-gray-500",
};

export function CategoriesTab() {
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoryStats();
  }, []);

  const fetchCategoryStats = async () => {
    setLoading(true);
    try {
      // Fetch shops with their categories
      const { data: shops } = await supabase
        .from("shops")
        .select("id, category, status");

      // Fetch products count per shop
      const { data: products } = await supabase
        .from("products")
        .select("shop_id");

      // Fetch services count per shop
      const { data: services } = await supabase
        .from("services")
        .select("shop_id");

      // Fetch shipments per shop
      const { data: shipments } = await supabase
        .from("shipments")
        .select("shop_id");

      // Fetch complaints
      const { data: complaints } = await supabase
        .from("complaints")
        .select("target_id, target_type");

      // Build category map
      const categoryMap = new Map<string, CategoryStats>();
      const defaultCategories = ["Artisanat", "Électronique", "Mode & Textile", "Restauration", "Services", "Autre"];
      
      defaultCategories.forEach(cat => {
        categoryMap.set(cat, {
          category: cat,
          totalShops: 0,
          totalProducts: 0,
          totalServices: 0,
          totalShipments: 0,
          totalComplaints: 0,
          activeShops: 0,
        });
      });

      // Count shops per category
      shops?.forEach(shop => {
        const cat = shop.category || "Autre";
        const existing = categoryMap.get(cat) || {
          category: cat,
          totalShops: 0,
          totalProducts: 0,
          totalServices: 0,
          totalShipments: 0,
          totalComplaints: 0,
          activeShops: 0,
        };
        existing.totalShops++;
        if (shop.status === "active") existing.activeShops++;
        categoryMap.set(cat, existing);

        // Count products for this shop
        const shopProducts = products?.filter(p => p.shop_id === shop.id).length || 0;
        existing.totalProducts += shopProducts;

        // Count services for this shop
        const shopServices = services?.filter(s => s.shop_id === shop.id).length || 0;
        existing.totalServices += shopServices;

        // Count shipments for this shop
        const shopShipments = shipments?.filter(s => s.shop_id === shop.id).length || 0;
        existing.totalShipments += shopShipments;

        // Count complaints for this shop
        const shopComplaints = complaints?.filter(c => c.target_id === shop.id && c.target_type === "shop").length || 0;
        existing.totalComplaints += shopComplaints;
      });

      setStats(Array.from(categoryMap.values()));
    } catch (error) {
      console.error("Error fetching category stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedCategory(null)}
            className="text-primary hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux catégories
          </Button>
          <Badge className={`${CATEGORY_COLORS[selectedCategory] || "bg-gray-500"} text-white`}>
            {selectedCategory}
          </Badge>
        </div>
        <ShopsManagement filterCategory={selectedCategory} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary">
          <Grid3X3 className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-primary">Catégories</h1>
          <p className="text-muted-foreground">Vue agrégée par catégorie de boutique</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((cat) => (
            <Card 
              key={cat.category} 
              className="border-primary/20 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => setSelectedCategory(cat.category)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${CATEGORY_COLORS[cat.category] || "bg-gray-500"} text-white`}>
                    {CATEGORY_ICONS[cat.category] || <Grid3X3 className="w-6 h-6" />}
                  </div>
                  <Badge variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {cat.activeShops}/{cat.totalShops} actives
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3">{cat.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-muted-foreground" />
                    <span><strong>{cat.totalShops}</strong> boutiques</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span><strong>{cat.totalProducts}</strong> produits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-muted-foreground" />
                    <span><strong>{cat.totalServices}</strong> services</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span><strong>{cat.totalShipments}</strong> livraisons</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <MessageSquareWarning className="w-4 h-4 text-muted-foreground" />
                    <span><strong>{cat.totalComplaints}</strong> réclamations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
