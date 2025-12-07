import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import {
  Handshake, Store, TrendingUp, Plus, LogOut,
  Calendar, DollarSign, Target, Award, Clock, Search
} from "lucide-react";

interface PartnerData {
  id: string;
  partnership_type: string;
  base_commission_rate: number;
  current_commission_rate: number;
  forfait_amount: number | null;
  forfait_end_date: string | null;
  shops_recruited: number;
  total_commission_earned: number;
  status: string;
  region: string;
}

interface Shop {
  id: string;
  name: string;
  category: string;
  status: string;
  is_vip: boolean;
  subscription_amount: number;
  created_at: string;
}

const PartenaireDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [affiliateCode, setAffiliateCode] = useState("");
  const [isAddingShop, setIsAddingShop] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPartnerData();
    }
  }, [user]);

  const fetchPartnerData = async () => {
    if (!user) return;

    // Fetch partner info
    const { data: partnerData, error: partnerError } = await supabase
      .from("partners")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (partnerError) {
      if (partnerError.code === "PGRST116") {
        toast({
          title: "Profil non trouvé",
          description: "Vous devez d'abord vous inscrire comme partenaire.",
        });
        navigate("/devenir-partenaire");
      }
      setLoading(false);
      return;
    }

    setPartner(partnerData);

    // Fetch shops recruited by this partner
    const { data: shopsData } = await supabase
      .from("shops")
      .select("*")
      .eq("partner_id", partnerData.id)
      .order("created_at", { ascending: false });

    if (shopsData) {
      setShops(shopsData);
    }

    setLoading(false);
  };

  const handleAddShopByCode = async () => {
    if (!partner || !affiliateCode.trim()) {
      toast({ title: "Erreur", description: "Veuillez entrer un code valide", variant: "destructive" });
      return;
    }

    if (partner.status !== "approved") {
      toast({ title: "Non autorisé", description: "Votre compte doit être approuvé", variant: "destructive" });
      return;
    }

    setIsAddingShop(true);

    try {
      // Find shop by affiliate code
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select("*")
        .eq("affiliate_code", affiliateCode.trim().toUpperCase())
        .single();

      if (shopError || !shopData) {
        toast({ title: "Code invalide", description: "Aucune boutique trouvée avec ce code", variant: "destructive" });
        return;
      }

      if (shopData.partner_id) {
        toast({ title: "Déjà affiliée", description: "Cette boutique est déjà affiliée à un partenaire", variant: "destructive" });
        return;
      }

      // Update shop with partner_id
      const { error: updateError } = await supabase
        .from("shops")
        .update({ partner_id: partner.id })
        .eq("id", shopData.id);

      if (updateError) throw updateError;

      // Update partner's shops_recruited count
      await supabase
        .from("partners")
        .update({ shops_recruited: (partner.shops_recruited || 0) + 1 })
        .eq("id", partner.id);

      // Send notification to shop owner
      await supabase.from("notifications").insert({
        user_id: shopData.user_id,
        title: "Partenaire affilié",
        message: `Votre boutique "${shopData.name}" a été affiliée à un partenaire Loummel.`,
        type: "shop_affiliated",
        related_id: partner.id,
      });

      toast({ title: "Succès", description: `Boutique "${shopData.name}" ajoutée à votre réseau` });
      setAffiliateCode("");
      fetchPartnerData();

    } catch (error: any) {
      console.error("Error adding shop:", error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsAddingShop(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  const getCommissionBonus = (shopsCount: number) => {
    if (shopsCount >= 50) return { rate: 15, label: "VIP Gold", color: "text-amber-500" };
    if (shopsCount >= 30) return { rate: 10, label: "Silver", color: "text-gray-400" };
    if (shopsCount >= 10) return { rate: 5, label: "Bronze", color: "text-amber-700" };
    return { rate: 0, label: "Standard", color: "text-muted-foreground" };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!partner) {
    return null;
  }

  const bonus = getCommissionBonus(partner.shops_recruited);
  const isCommissionType = partner.partnership_type === "commission";
  const monthlyTarget = 30;
  const progress = Math.min((partner.shops_recruited / monthlyTarget) * 100, 100);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Handshake className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Dashboard Partenaire
                </h1>
                <div className="flex items-center gap-2">
                  <Badge variant={partner.status === "approved" ? "default" : "secondary"}>
                    {partner.status === "approved" ? "Approuvé" : "En attente"}
                  </Badge>
                  <Badge variant="outline">
                    {isCommissionType ? "Commission" : "Forfait"}
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>

          {partner.status === "pending" && (
            <Card className="mb-8 border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-800">Candidature en cours de validation</p>
                    <p className="text-sm text-yellow-700">
                      Votre profil partenaire est en attente d'approbation par l'équipe Loummel.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards - Commission Type */}
          {isCommissionType ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Store className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{partner.shops_recruited}</p>
                      <p className="text-xs text-muted-foreground">Boutiques recrutées</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">
                        {(partner.base_commission_rate * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Commission de base</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Award className={`w-8 h-8 ${bonus.color}`} />
                    <div>
                      <p className="text-2xl font-bold">+{bonus.rate}%</p>
                      <p className="text-xs text-muted-foreground">Bonus {bonus.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-emerald-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {formatCurrency(partner.total_commission_earned)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total gagné</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Stats Cards - Forfait Type */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Store className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{partner.shops_recruited}</p>
                      <p className="text-xs text-muted-foreground">Boutiques créées</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {partner.forfait_amount ? formatCurrency(partner.forfait_amount) : "À négocier"}
                      </p>
                      <p className="text-xs text-muted-foreground">Forfait annuel</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {partner.forfait_end_date 
                          ? new Date(partner.forfait_end_date).toLocaleDateString("fr-FR")
                          : "Illimité"}
                      </p>
                      <p className="text-xs text-muted-foreground">Fin du forfait</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Progress to next bonus (Commission type only) */}
          {isCommissionType && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Progression vers le prochain bonus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-sm">
                    <span>{partner.shops_recruited} boutiques ce mois</span>
                    <span>Objectif: {monthlyTarget} boutiques</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className={`text-center p-3 rounded-lg ${partner.shops_recruited >= 10 ? "bg-amber-100" : "bg-muted"}`}>
                      <p className="font-semibold">10+ boutiques</p>
                      <p className="text-sm text-muted-foreground">+5% Bronze</p>
                    </div>
                    <div className={`text-center p-3 rounded-lg ${partner.shops_recruited >= 30 ? "bg-gray-200" : "bg-muted"}`}>
                      <p className="font-semibold">30+ boutiques</p>
                      <p className="text-sm text-muted-foreground">+10% Silver</p>
                    </div>
                    <div className={`text-center p-3 rounded-lg ${partner.shops_recruited >= 50 ? "bg-amber-200" : "bg-muted"}`}>
                      <p className="font-semibold">50+ boutiques</p>
                      <p className="text-sm text-muted-foreground">+15% VIP Gold</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions & Shops List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="space-y-6">
              {/* Add Shop by Code */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    Ajouter une boutique
                  </CardTitle>
                  <CardDescription>
                    Entrez le code partenaire fourni par le propriétaire
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Ex: LM-A3K9X2"
                    value={affiliateCode}
                    onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
                    className="text-center font-mono text-lg"
                    disabled={partner.status !== "approved"}
                  />
                  <Button 
                    onClick={handleAddShopByCode}
                    className="w-full"
                    disabled={partner.status !== "approved" || isAddingShop || !affiliateCode.trim()}
                  >
                    {isAddingShop ? "Ajout en cours..." : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter à mon réseau
                      </>
                    )}
                  </Button>
                  {partner.status !== "approved" && (
                    <p className="text-xs text-muted-foreground text-center">
                      Disponible après approbation
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Create Shop for Client */}
              <Card>
                <CardHeader>
                  <CardTitle>Créer pour un client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/inscription-vendeur" className="block">
                    <Button className="w-full" variant="outline" disabled={partner.status !== "approved"}>
                      <Store className="w-4 h-4 mr-2" />
                      Créer une boutique client
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground text-center">
                    Créez une boutique au nom d'un client
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Shops List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Mes Boutiques Recrutées</CardTitle>
                <CardDescription>
                  {shops.length} boutique{shops.length > 1 ? "s" : ""} dans votre réseau
                </CardDescription>
              </CardHeader>
              <CardContent>
                {shops.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune boutique recrutée pour le moment
                  </p>
                ) : (
                  <div className="space-y-3">
                    {shops.map((shop) => (
                      <div
                        key={shop.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{shop.name}</p>
                            {shop.is_vip && (
                              <Badge className="bg-amber-500 text-xs">VIP</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{shop.category}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={shop.status === "active" ? "default" : "secondary"}>
                            {shop.status === "active" ? "Actif" : "En attente"}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatCurrency(shop.subscription_amount || 5000)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PartenaireDashboard;
