import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Store, Search, Plus, Phone, MapPin, Calendar,
  Eye, Package, ShoppingCart, TrendingUp, Check,
  ExternalLink, MessageSquare
} from "lucide-react";

interface ShopsManagementProps {
  filterCategory?: string;
}

interface Shop {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  category: string | null;
  region: string | null;
  city: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  status: string;
  is_vip: boolean;
  subscription_type: string | null;
  created_at: string;
}

interface ShopStats {
  visits: number;
  productsPublished: number;
  productsSold: number;
  topProducts: { name: string; views: number }[];
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export function ShopsManagement({ filterCategory }: ShopsManagementProps) {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopStats, setShopStats] = useState<Record<string, ShopStats>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setShops(data);
        
        // Generate mock stats for each shop
        const stats: Record<string, ShopStats> = {};
        data.forEach(shop => {
          stats[shop.id] = {
            visits: Math.floor(Math.random() * 1000) + 50,
            productsPublished: Math.floor(Math.random() * 12) + 1,
            productsSold: Math.floor(Math.random() * 50),
            topProducts: [
              { name: "Produit phare", views: Math.floor(Math.random() * 200) + 50 },
              { name: "Article populaire", views: Math.floor(Math.random() * 150) + 30 },
              { name: "Best seller", views: Math.floor(Math.random() * 100) + 20 },
            ],
          };
        });
        setShopStats(stats);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateShopStatus = async (shopId: string, newStatus: "active" | "suspended") => {
    const shop = shops.find(s => s.id === shopId);
    
    const { error } = await supabase
      .from("shops")
      .update({ status: newStatus })
      .eq("id", shopId);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      // Log audit action
      if (user) {
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: newStatus === "active" ? "shop_activated" : "shop_suspended",
          entity_type: "shop",
          entity_id: shopId,
          details: { name: shop?.name, region: shop?.region },
        });
      }
      
      toast({ 
        title: "Succès", 
        description: `Boutique ${newStatus === "active" ? "activée" : "suspendue"}` 
      });
      fetchShops();
    }
  };

  const validateShop = async (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    
    const { error } = await supabase
      .from("shops")
      .update({ status: "active" })
      .eq("id", shopId);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      // Create notification for shop owner
      if (shop) {
        await supabase.from("notifications").insert({
          user_id: shop.user_id,
          title: "Boutique validée !",
          message: `Votre boutique "${shop.name}" a été validée et est maintenant en ligne.`,
          type: "shop_validated",
          related_id: shopId,
        });
      }

      // Log audit
      if (user) {
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "shop_validated",
          entity_type: "shop",
          entity_id: shopId,
          details: { name: shop?.name },
        });
      }

      toast({ 
        title: "Boutique validée", 
        description: "Un email de confirmation a été envoyé au vendeur." 
      });
      fetchShops();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
      active: { label: "Active", className: "bg-green-100 text-green-800" },
      suspended: { label: "Suspendue", className: "bg-red-100 text-red-800" },
    };
    const v = variants[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={v.className}>{v.label}</Badge>;
  };

  const filteredShops = shops.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.city?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (s.region?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || s.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#966442]">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-[#966442]">Gestion des Boutiques</h1>
            <p className="text-muted-foreground">{shops.length} boutiques enregistrées</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une boutique..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button className="bg-[#966442] hover:bg-[#966442]/90">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle boutique
          </Button>
        </div>
      </div>

      {/* Shops Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredShops.map((shop) => {
          const stats = shopStats[shop.id] || { visits: 0, productsPublished: 0, productsSold: 0, topProducts: [] };
          const isActive = shop.status === "active";

          return (
            <Card key={shop.id} className="border-[#966442]/20 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg text-[#966442]">{shop.name}</CardTitle>
                      {shop.is_vip && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                          VIP
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(shop.status)}
                      <Badge variant="outline" className="text-xs">
                        {shop.subscription_type || "Base"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Info Section */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Créée le {formatDate(shop.created_at)}</span>
                  </div>
                  {shop.city && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{shop.city}{shop.region && `, ${shop.region}`}</span>
                    </div>
                  )}
                  {shop.contact_whatsapp && (
                    <a 
                      href={`https://wa.me/${shop.contact_whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-green-600 hover:underline"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{shop.contact_whatsapp}</span>
                    </a>
                  )}
                </div>

                {/* Analytics */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-[#966442]/5 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="w-3 h-3 text-[#966442]" />
                      <span className="font-bold text-[#966442]">{stats.visits}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Visites</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Package className="w-3 h-3 text-blue-500" />
                      <span className="font-bold text-blue-600">{stats.productsPublished}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Produits</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <ShoppingCart className="w-3 h-3 text-green-500" />
                      <span className="font-bold text-green-600">{stats.productsSold}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Vendus</p>
                  </div>
                </div>

                {/* Top Products */}
                {stats.topProducts.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Top 3 produits
                    </p>
                    <div className="space-y-1">
                      {stats.topProducts.map((product, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground truncate">{idx + 1}. {product.name}</span>
                          <span className="text-[#966442] font-medium">{product.views} vues</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {isActive ? "Active" : "Inactive"}
                    </span>
                    <Switch
                      checked={isActive}
                      onCheckedChange={(checked) => 
                        updateShopStatus(shop.id, checked ? "active" : "suspended")
                      }
                      className="data-[state=checked]:bg-[#966442]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {shop.status === "pending" && (
                      <Button 
                        size="sm" 
                        onClick={() => validateShop(shop.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Valider
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`/boutique/${shop.slug}`, '_blank')}
                      className="border-[#966442]/30 text-[#966442] hover:bg-[#966442]/10"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Voir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredShops.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Store className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Aucune boutique trouvée</p>
        </div>
      )}
    </div>
  );
}
