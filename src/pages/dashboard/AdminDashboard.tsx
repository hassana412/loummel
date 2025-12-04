import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  Users, Store, Handshake, TrendingUp,
  Check, X, Clock, LogOut, Shield
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [partners, setPartners] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPartners: 0,
    pendingPartners: 0,
    totalShops: 0,
    pendingShops: 0,
    vipShops: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: partnersData } = await supabase
      .from("partners")
      .select("*")
      .order("created_at", { ascending: false });

    if (partnersData) {
      setPartners(partnersData);
      setStats(prev => ({
        ...prev,
        totalPartners: partnersData.length,
        pendingPartners: partnersData.filter(p => p.status === "pending").length,
      }));
    }

    const { data: shopsData } = await supabase
      .from("shops")
      .select("*")
      .order("created_at", { ascending: false });

    if (shopsData) {
      setShops(shopsData);
      setStats(prev => ({
        ...prev,
        totalShops: shopsData.length,
        pendingShops: shopsData.filter(s => s.status === "pending").length,
        vipShops: shopsData.filter(s => s.is_vip).length,
      }));
    }
  };

  const updatePartnerStatus = async (partnerId: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("partners")
      .update({ status })
      .eq("id", partnerId);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: `Partenaire ${status === "approved" ? "approuvé" : "rejeté"}` });
      fetchData();
    }
  };

  const updateShopStatus = async (shopId: string, status: "active" | "suspended") => {
    const { error } = await supabase
      .from("shops")
      .update({ status })
      .eq("id", shopId);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: `Boutique ${status === "active" ? "activée" : "suspendue"}` });
      fetchData();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Approuvé", className: "bg-green-100 text-green-800" },
      active: { label: "Actif", className: "bg-green-100 text-green-800" },
      suspended: { label: "Suspendu", className: "bg-red-100 text-red-800" },
      rejected: { label: "Rejeté", className: "bg-red-100 text-red-800" },
    };
    const v = variants[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={v.className}>{v.label}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Dashboard Super Admin</h1>
                <p className="text-muted-foreground">Gestion de la plateforme Loummel</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Handshake className="w-8 h-8 text-blue-500" /><div><p className="text-2xl font-bold">{stats.totalPartners}</p><p className="text-xs text-muted-foreground">Partenaires</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-yellow-500" /><div><p className="text-2xl font-bold">{stats.pendingPartners}</p><p className="text-xs text-muted-foreground">En attente</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Store className="w-8 h-8 text-green-500" /><div><p className="text-2xl font-bold">{stats.totalShops}</p><p className="text-xs text-muted-foreground">Boutiques</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{stats.pendingShops}</p><p className="text-xs text-muted-foreground">À valider</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><TrendingUp className="w-8 h-8 text-amber-500" /><div><p className="text-2xl font-bold">{stats.vipShops}</p><p className="text-xs text-muted-foreground">VIP</p></div></div></CardContent></Card>
          </div>

          <Tabs defaultValue="partners">
            <TabsList>
              <TabsTrigger value="partners">Partenaires</TabsTrigger>
              <TabsTrigger value="shops">Boutiques</TabsTrigger>
            </TabsList>

            <TabsContent value="partners" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des Partenaires</CardTitle>
                </CardHeader>
                <CardContent>
                  {partners.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucun partenaire</p>
                  ) : (
                    <div className="space-y-4">
                      {partners.map((partner) => (
                        <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-semibold">{partner.region}</p>
                            <Badge variant="outline">{partner.partnership_type === "commission" ? "Commission" : "Forfait"}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(partner.status)}
                            {partner.status === "pending" && (
                              <>
                                <Button size="sm" variant="outline" className="text-green-600" onClick={() => updatePartnerStatus(partner.id, "approved")}><Check className="w-4 h-4" /></Button>
                                <Button size="sm" variant="outline" className="text-red-600" onClick={() => updatePartnerStatus(partner.id, "rejected")}><X className="w-4 h-4" /></Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shops" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des Boutiques</CardTitle>
                </CardHeader>
                <CardContent>
                  {shops.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucune boutique</p>
                  ) : (
                    <div className="space-y-4">
                      {shops.map((shop) => (
                        <div key={shop.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{shop.name}</p>
                              {shop.is_vip && <Badge className="bg-amber-500">VIP</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{shop.category} • {shop.region}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(shop.status)}
                            {shop.status === "pending" && (
                              <Button size="sm" variant="outline" className="text-green-600" onClick={() => updateShopStatus(shop.id, "active")}><Check className="w-4 h-4 mr-1" />Activer</Button>
                            )}
                            {shop.status === "active" && (
                              <Button size="sm" variant="outline" className="text-red-600" onClick={() => updateShopStatus(shop.id, "suspended")}>Suspendre</Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

export default AdminDashboard;
