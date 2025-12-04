import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  Store, Package, Briefcase, Settings, LogOut, Plus,
  Trash2, Eye, Crown, Clock, Edit
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

const BoutiqueDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [shop, setShop] = useState<ShopData | null>(null);
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

    // Fetch shop info
    const { data: shopData, error: shopError } = await supabase
      .from("shops")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (shopError) {
      if (shopError.code === "PGRST116") {
        toast({
          title: "Boutique non trouvée",
          description: "Vous devez d'abord créer une boutique.",
        });
        navigate("/inscription-vendeur");
      }
      setLoading(false);
      return;
    }

    setShop(shopData);

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

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Package className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{products.length}/12</p>
                <p className="text-xs text-muted-foreground">Produits</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Briefcase className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{services.length}/5</p>
                <p className="text-xs text-muted-foreground">Services</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Badge className="mx-auto mb-2">{shop.subscription_type.toUpperCase()}</Badge>
                <p className="text-xs text-muted-foreground mt-2">Abonnement</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm font-semibold">
                  {shop.subscription_expires_at 
                    ? new Date(shop.subscription_expires_at).toLocaleDateString("fr-FR")
                    : "Non défini"}
                </p>
                <p className="text-xs text-muted-foreground">Expiration</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="products">
            <TabsList>
              <TabsTrigger value="products">Produits ({products.length}/12)</TabsTrigger>
              <TabsTrigger value="services">Services ({services.length}/5)</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Add Product Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ajouter un produit</CardTitle>
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
                    <Button 
                      onClick={addProduct} 
                      className="w-full"
                      disabled={products.length >= 12}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </CardContent>
                </Card>

                {/* Products List */}
                <div className="lg:col-span-2 space-y-3">
                  {products.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        Aucun produit ajouté
                      </CardContent>
                    </Card>
                  ) : (
                    products.map((product) => (
                      <Card key={product.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.category}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="font-bold text-primary">
                                {formatCurrency(product.price)}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => deleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
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
                    <Button 
                      onClick={addService} 
                      className="w-full"
                      disabled={services.length >= 5}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </CardContent>
                </Card>

                {/* Services List */}
                <div className="lg:col-span-2 space-y-3">
                  {services.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        Aucun service ajouté
                      </CardContent>
                    </Card>
                  ) : (
                    services.map((service) => (
                      <Card key={service.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{service.name}</p>
                              <p className="text-sm text-muted-foreground">{service.duration}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="font-bold text-primary">
                                {formatCurrency(service.price)}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => deleteService(service.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de la boutique</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Téléphone</Label>
                      <p className="text-muted-foreground">{shop.contact_phone || "Non renseigné"}</p>
                    </div>
                    <div>
                      <Label>WhatsApp</Label>
                      <p className="text-muted-foreground">{shop.contact_whatsapp || "Non renseigné"}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-muted-foreground">{shop.contact_email || "Non renseigné"}</p>
                    </div>
                    <div>
                      <Label>Adresse</Label>
                      <p className="text-muted-foreground">{shop.contact_address || "Non renseigné"}</p>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <p className="text-muted-foreground">{shop.description || "Non renseigné"}</p>
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
