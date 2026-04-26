import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { MesVentes } from "@/components/boutique/MesVentes";
import {
  Store, Package, Briefcase, Settings, LogOut, Plus,
  Trash2, Eye, Crown, Clock, Copy, Handshake, Phone, Mail, Shield,
  TrendingUp, AlertTriangle, Users, FileText, BarChart3, ShoppingCart, ShoppingBag
} from "lucide-react";

interface ShopData {
  id: string;
  name: string;
  description: string;
  category: string;
  slug: string;
  is_vip: boolean;
  subscription_type: string;
  subscription_expires_at: string | null;
  status: string;
  contact_phone: string;
  contact_whatsapp: string;
  contact_email: string;
  contact_address: string;
  affiliate_code: string | null;
  partner_id: string | null;
}

interface PartnerInfo {
  id: string;
  region: string;
  user_id: string;
  profile?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_promo: boolean;
  promo_price: number | null;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
}

// Demo data for stats, clients, invoices
const demoStats = {
  totalSold: 47,
  inStock: 7,
  outOfStock: 0,
  totalVisits: 1234,
  monthlyRevenue: 856000,
};

const demoClients = [
  { id: "1", name: "Amadou Bello", email: "amadou@gmail.com", phone: "+237 677 111 222", orders: 5, totalSpent: 125000 },
  { id: "2", name: "Fatima Yaya", email: "fatima@gmail.com", phone: "+237 699 333 444", orders: 3, totalSpent: 85000 },
  { id: "3", name: "Ibrahim Moussa", email: "ibrahim@gmail.com", phone: "+237 655 555 666", orders: 8, totalSpent: 245000 },
  { id: "4", name: "Aissatou Diallo", email: "aissatou@gmail.com", phone: "+237 677 777 888", orders: 2, totalSpent: 55000 },
  { id: "5", name: "Oumarou Saidou", email: "oumarou@gmail.com", phone: "+237 699 999 000", orders: 4, totalSpent: 156000 },
];

const demoInvoices = [
  { id: "INV-001", client: "Amadou Bello", date: "2024-12-10", amount: 35000, status: "paid" },
  { id: "INV-002", client: "Fatima Yaya", date: "2024-12-09", amount: 28000, status: "paid" },
  { id: "INV-003", client: "Ibrahim Moussa", date: "2024-12-08", amount: 75000, status: "pending" },
  { id: "INV-004", client: "Aissatou Diallo", date: "2024-12-07", amount: 18000, status: "paid" },
  { id: "INV-005", client: "Oumarou Saidou", date: "2024-12-05", amount: 45000, status: "paid" },
];

const demoTopProducts = [
  { name: "Collier Fulani traditionnel", views: 456, sold: 12 },
  { name: "Bracelet en cuivre gravé", views: 389, sold: 15 },
  { name: "Boubou brodé premium", views: 312, sold: 8 },
  { name: "Poterie Rhumsiki", views: 278, sold: 6 },
  { name: "Sac en cuir tressé", views: 234, sold: 6 },
];

// Support contact
const supportContact = {
  email: "support@loummel.com",
  phone: "+237 6XX XXX XXX",
  whatsapp: "2376XXXXXXXX"
};

const BoutiqueDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [shop, setShop] = useState<ShopData | null>(null);
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New product form
  const [newProduct, setNewProduct] = useState({
    name: "", description: "", price: "", category: ""
  });
  
  // New service form
  const [newService, setNewService] = useState({
    name: "", description: "", price: "", duration: ""
  });

  useEffect(() => {
    if (user) {
      fetchShopData();
    }
  }, [user]);

  const fetchShopData = async () => {
    if (!user) return;

    const { data: shopData, error: shopError } = await supabase
      .from("shops")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (shopError || !shopData) {
      toast({
        title: "Boutique non trouvée",
        description: "Vous devez d'abord créer une boutique.",
      });
      navigate("/inscription-vendeur");
      setLoading(false);
      return;
    }

    setShop(shopData);

    // Fetch partner info if shop has a partner
    if (shopData.partner_id) {
      const { data: partnerData } = await supabase
        .from("partners")
        .select("id, region, user_id")
        .eq("id", shopData.partner_id)
        .maybeSingle();

      if (partnerData) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, email, phone")
          .eq("id", partnerData.user_id)
          .maybeSingle();

        setPartner({
          ...partnerData,
          profile: profileData || undefined
        });
      }
    }

    // Fetch products
    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shopData.id)
      .order("sort_order");

    if (productsData) {
      setProducts(productsData);
    }

    // Fetch services
    const { data: servicesData } = await supabase
      .from("services")
      .select("*")
      .eq("shop_id", shopData.id)
      .order("sort_order");

    if (servicesData) {
      setServices(servicesData);
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  const copyAffiliateCode = () => {
    if (shop?.affiliate_code) {
      navigator.clipboard.writeText(shop.affiliate_code);
      toast({ title: "Code copié !" });
    }
  };

  const addProduct = async () => {
    if (!shop || products.length >= 12) {
      toast({ title: "Limite atteinte", description: "Maximum 12 produits", variant: "destructive" });
      return;
    }

    if (!newProduct.name || !newProduct.price) {
      toast({ title: "Erreur", description: "Nom et prix requis", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("products").insert({
      shop_id: shop.id,
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      sort_order: products.length,
    });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Produit ajouté" });
      setNewProduct({ name: "", description: "", price: "", category: "" });
      fetchShopData();
    }
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.from("products").delete().eq("id", productId);
    
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Produit supprimé" });
      fetchShopData();
    }
  };

  const addService = async () => {
    if (!shop || services.length >= 5) {
      toast({ title: "Limite atteinte", description: "Maximum 5 services", variant: "destructive" });
      return;
    }

    if (!newService.name || !newService.price) {
      toast({ title: "Erreur", description: "Nom et prix requis", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("services").insert({
      shop_id: shop.id,
      name: newService.name,
      description: newService.description,
      price: parseFloat(newService.price),
      duration: newService.duration,
      sort_order: services.length,
    });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Service ajouté" });
      setNewService({ name: "", description: "", price: "", duration: "" });
      fetchShopData();
    }
  };

  const deleteService = async (serviceId: string) => {
    const { error } = await supabase.from("services").delete().eq("id", serviceId);
    
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Service supprimé" });
      fetchShopData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!shop) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Store className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    {shop.name}
                  </h1>
                  {shop.is_vip && (
                    <Badge className="bg-amber-500">
                      <Crown className="w-3 h-3 mr-1" />
                      VIP
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={shop.status === "active" ? "default" : "secondary"}>
                    {shop.status === "active" ? "Actif" : "En attente"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{shop.category}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/boutique/${shop.slug}`}>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir ma boutique
                </Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>

          {shop.status === "pending" && (
            <Card className="mb-8 border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-800">Boutique en cours de validation</p>
                    <p className="text-sm text-yellow-700">
                      Votre boutique sera visible après validation par l'équipe Loummel.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Affiliate Code Card */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Votre code partenaire</p>
                  <div className="flex items-center gap-3">
                    <code className="text-2xl font-bold text-primary bg-background px-4 py-2 rounded-lg">
                      {shop.affiliate_code || "Non généré"}
                    </code>
                    {shop.affiliate_code && (
                      <Button variant="outline" size="icon" onClick={copyAffiliateCode}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Partagez ce code avec un partenaire pour être affilié
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partner & Support Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Partner Info */}
            <Card className={partner ? "border-blue-200 bg-blue-50" : "border-dashed"}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-blue-600" />
                  Mon Partenaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                {partner ? (
                  <div className="space-y-2">
                    <p className="font-semibold">{partner.profile?.full_name || "Partenaire"}</p>
                    <p className="text-sm text-muted-foreground">Région: {partner.region}</p>
                    {partner.profile?.email && (
                      <p className="text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {partner.profile.email}
                      </p>
                    )}
                    {partner.profile?.phone && (
                      <p className="text-sm flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {partner.profile.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aucun partenaire affilié. Partagez votre code pour être accompagné.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Support Contact */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Support Technique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {supportContact.email}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {supportContact.phone}
                </p>
                <a 
                  href={`https://wa.me/${supportContact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2"
                >
                  <Button size="sm" variant="outline" className="text-green-600 border-green-600">
                    Contacter via WhatsApp
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <ShoppingCart className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{demoStats.totalSold}</p>
                <p className="text-xs text-muted-foreground">Vendus</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{products.length || demoStats.inStock}</p>
                <p className="text-xs text-muted-foreground">En stock</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{demoStats.outOfStock}</p>
                <p className="text-xs text-muted-foreground">Rupture</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{demoStats.totalVisits}</p>
                <p className="text-xs text-muted-foreground">Visites</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-lg font-bold">{formatCurrency(demoStats.monthlyRevenue)}</p>
                <p className="text-xs text-muted-foreground">Ce mois</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-5 w-full max-w-2xl">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="products">Produits</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="invoices">Factures</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Products */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Produits les plus visités
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {demoTopProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="font-medium text-sm">{product.name}</span>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-semibold">{product.views} vues</p>
                            <p className="text-muted-foreground">{product.sold} vendus</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      Informations boutique
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Abonnement</p>
                        <Badge>{shop.subscription_type?.toUpperCase() || "BASE"}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Expiration</p>
                        <p className="font-semibold text-sm">
                          {shop.subscription_expires_at 
                            ? new Date(shop.subscription_expires_at).toLocaleDateString("fr-FR")
                            : "Non défini"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Produits</p>
                        <p className="font-semibold">{products.length}/12</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Services</p>
                        <p className="font-semibold">{services.length}/5</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Contact</p>
                      <p className="text-sm">{shop.contact_phone}</p>
                      <p className="text-sm">{shop.contact_email}</p>
                      <p className="text-sm text-muted-foreground">{shop.contact_address}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Add Product Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ajouter un produit</CardTitle>
                    <CardDescription>{products.length}/12 produits</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      placeholder="Nom du produit"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Prix (FCFA)"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct(p => ({ ...p, price: e.target.value }))}
                    />
                    <Input
                      placeholder="Catégorie"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct(p => ({ ...p, category: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct(p => ({ ...p, description: e.target.value }))}
                    />
                    <Button onClick={addProduct} className="w-full" disabled={products.length >= 12}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </CardContent>
                </Card>

                {/* Products List */}
                <div className="lg:col-span-2 space-y-3">
                  {products.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                            <p className="text-primary font-bold">{formatCurrency(product.price)}</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {products.length === 0 && (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        Aucun produit. Ajoutez votre premier produit !
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Add Service Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ajouter un service</CardTitle>
                    <CardDescription>{services.length}/5 services</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      placeholder="Nom du service"
                      value={newService.name}
                      onChange={(e) => setNewService(s => ({ ...s, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Prix (FCFA)"
                      type="number"
                      value={newService.price}
                      onChange={(e) => setNewService(s => ({ ...s, price: e.target.value }))}
                    />
                    <Input
                      placeholder="Durée (ex: 2 heures)"
                      value={newService.duration}
                      onChange={(e) => setNewService(s => ({ ...s, duration: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Description"
                      value={newService.description}
                      onChange={(e) => setNewService(s => ({ ...s, description: e.target.value }))}
                    />
                    <Button onClick={addService} className="w-full" disabled={services.length >= 5}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </CardContent>
                </Card>

                {/* Services List */}
                <div className="lg:col-span-2 space-y-3">
                  {services.map((service) => (
                    <Card key={service.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{service.name}</h4>
                            <p className="text-sm text-muted-foreground">{service.duration}</p>
                            <p className="text-primary font-bold">{formatCurrency(service.price)}</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteService(service.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {services.length === 0 && (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        Aucun service. Ajoutez votre premier service !
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Clients Tab */}
            <TabsContent value="clients" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Liste des clients ({demoClients.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Client</th>
                          <th className="text-left py-3 px-4 font-medium">Contact</th>
                          <th className="text-center py-3 px-4 font-medium">Commandes</th>
                          <th className="text-right py-3 px-4 font-medium">Total dépensé</th>
                        </tr>
                      </thead>
                      <tbody>
                        {demoClients.map((client) => (
                          <tr key={client.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <p className="font-medium">{client.name}</p>
                              <p className="text-sm text-muted-foreground">{client.email}</p>
                            </td>
                            <td className="py-3 px-4 text-sm">{client.phone}</td>
                            <td className="py-3 px-4 text-center">{client.orders}</td>
                            <td className="py-3 px-4 text-right font-semibold text-primary">
                              {formatCurrency(client.totalSpent)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Historique des factures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">N° Facture</th>
                          <th className="text-left py-3 px-4 font-medium">Client</th>
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                          <th className="text-right py-3 px-4 font-medium">Montant</th>
                          <th className="text-center py-3 px-4 font-medium">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {demoInvoices.map((invoice) => (
                          <tr key={invoice.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-mono text-sm">{invoice.id}</td>
                            <td className="py-3 px-4">{invoice.client}</td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {new Date(invoice.date).toLocaleDateString("fr-FR")}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold">
                              {formatCurrency(invoice.amount)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                                {invoice.status === "paid" ? "Payé" : "En attente"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BoutiqueDashboard;