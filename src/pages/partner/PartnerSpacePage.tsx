import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Store, Package, ShoppingBag, Wallet, Plus, Eye } from "lucide-react";

type Partner = {
  id: string;
  code_partenaire: string | null;
  region: string | null;
  user_id: string;
};

type BoutiqueRow = {
  id: string; // partner_boutiques id
  statut: string | null;
  created_at: string;
  boutique_id: string;
  shop: {
    id: string;
    name: string | null;
    category: string | null;
    created_at: string;
  } | null;
  productsCount: number;
};

const statutMap: Record<string, { label: string; className: string }> = {
  creation: { label: "En création", className: "bg-muted text-muted-foreground" },
  actif: { label: "Actif", className: "bg-[hsl(var(--ecom-green))] text-white" },
  suspendu: { label: "Suspendu", className: "bg-destructive text-destructive-foreground" },
  reactif: { label: "Réactivé", className: "bg-blue-500 text-white" },
};

const PartnerSpacePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [profileName, setProfileName] = useState<string>("");
  const [boutiques, setBoutiques] = useState<BoutiqueRow[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [monthlyOrders, setMonthlyOrders] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [affiliateOpen, setAffiliateOpen] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState("");
  const [affiliateLoading, setAffiliateLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth/partenaire");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const [retrying, setRetrying] = useState(false);

  const load = async (isRetry = false) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: partnerData, error: partnerError } = await supabase
        .from("partners")
        .select("id, code_partenaire, region, user_id")
        .eq("user_id", user.id)
        .in("status", ["active", "approved"])
        .maybeSingle();

      if (partnerError) throw partnerError;
      if (!partnerData) {
        if (!isRetry) {
          // Record may not yet be committed — wait then retry once
          setRetrying(true);
          setLoading(false);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          setRetrying(false);
          return load(true);
        }
        setAccessDenied(true);
        return;
      }
      setPartner(partnerData as Partner);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      setProfileName((profileData as any)?.full_name || user.email || "");

      // Boutiques + shops
      const { data: pbData, error: pbError } = await supabase
        .from("partner_boutiques")
        .select("id, statut, created_at, boutique_id, shops:boutique_id(id, name, category, created_at)")
        .eq("partner_id", partnerData.id);

      if (pbError) throw pbError;

      const rows: BoutiqueRow[] = (pbData || []).map((r: any) => ({
        id: r.id,
        statut: r.statut,
        created_at: r.created_at,
        boutique_id: r.boutique_id,
        shop: r.shops,
        productsCount: 0,
      }));

      // Products counts per shop
      const shopIds = rows.map((r) => r.boutique_id).filter(Boolean);
      if (shopIds.length > 0) {
        const { data: products } = await supabase
          .from("products")
          .select("shop_id")
          .in("shop_id", shopIds);
        const counts: Record<string, number> = {};
        (products || []).forEach((p: any) => {
          counts[p.shop_id] = (counts[p.shop_id] || 0) + 1;
        });
        rows.forEach((r) => {
          r.productsCount = counts[r.boutique_id] || 0;
        });
      }

      setBoutiques(rows);
      setActiveCount(rows.filter((r) => r.statut === "actif").length);

      // Monthly orders
      if (shopIds.length > 0) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const { count } = await supabase
          .from("commandes")
          .select("id", { count: "exact", head: true })
          .in("boutique_id", shopIds)
          .gte("created_at", startOfMonth.toISOString());
        setMonthlyOrders(count || 0);
      } else {
        setMonthlyOrders(0);
      }

      // Wallet balance
      const { data: wallets } = await supabase
        .from("mobile_wallets")
        .select("balance")
        .eq("partner_id", partnerData.id);
      const total = (wallets || []).reduce((sum: number, w: any) => sum + Number(w.balance || 0), 0);
      setWalletBalance(total);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erreur de chargement", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAffiliate = async () => {
    if (!partner || !affiliateCode.trim()) return;
    setAffiliateLoading(true);
    try {
      const { data: shop, error } = await supabase
        .from("shops")
        .select("id, name")
        .eq("affiliate_code", affiliateCode.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;
      if (!shop) {
        toast({ title: "Code introuvable", description: "Aucune boutique trouvée pour ce code.", variant: "destructive" });
        return;
      }

      const { error: insertError } = await supabase
        .from("partner_boutiques")
        .insert({ partner_id: partner.id, boutique_id: shop.id, statut: "actif" });

      if (insertError) throw insertError;
      toast({ title: "Boutique affiliée", description: `${shop.name} a été ajoutée à votre espace.` });
      setAffiliateOpen(false);
      setAffiliateCode("");
      load();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setAffiliateLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
        <p className="text-muted-foreground mb-6">
          Vous n'êtes pas enregistré comme partenaire.
        </p>
        <Button onClick={() => navigate("/devenir-partenaire")}>Devenir partenaire</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mon Espace Partenaire</h1>
          <p className="text-muted-foreground mt-1">{profileName}</p>
        </div>
        {partner?.code_partenaire && (
          <Badge variant="outline" className="text-base px-4 py-2 self-start md:self-auto">
            Code: <span className="font-mono ml-2">{partner.code_partenaire}</span>
          </Badge>
        )}
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Store className="w-5 h-5" />}
          label="Boutiques affiliées"
          value={boutiques.length.toString()}
        />
        <KpiCard
          icon={<Package className="w-5 h-5" />}
          label="Boutiques actives"
          value={activeCount.toString()}
        />
        <KpiCard
          icon={<ShoppingBag className="w-5 h-5" />}
          label="Commandes ce mois"
          value={monthlyOrders.toString()}
        />
        <KpiCard
          icon={<Wallet className="w-5 h-5" />}
          label="Solde wallet"
          value={`${walletBalance.toLocaleString("fr-FR")} FCFA`}
        />
      </div>

      {/* Boutiques list */}
      <Card>
        <CardHeader>
          <CardTitle>Mes boutiques affiliées</CardTitle>
        </CardHeader>
        <CardContent>
          {boutiques.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Aucune boutique affiliée pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {boutiques.map((b) => {
                const status = statutMap[b.statut || "creation"] || statutMap.creation;
                return (
                  <div
                    key={b.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{b.shop?.name || "Boutique"}</h3>
                        <Badge className={status.className}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {b.shop?.category || "—"} · {b.productsCount} produit{b.productsCount > 1 ? "s" : ""} ·
                        {" "}créée le {new Date(b.shop?.created_at || b.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/partner/boutique/${b.boutique_id}`)}
                    >
                      <Eye className="w-4 h-4" /> Voir détail
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-3">
        <Button onClick={() => setAffiliateOpen(true)} size="lg">
          <Plus className="w-4 h-4" /> Affilier une boutique existante
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate("/partner/nouvelle-boutique")}
        >
          🏪 Créer une nouvelle boutique
        </Button>
      </div>

      {/* Affiliate dialog */}
      <Dialog open={affiliateOpen} onOpenChange={setAffiliateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Affilier une boutique</DialogTitle>
            <DialogDescription>
              Entrez le code d'affiliation (LM-XXXXXXXX) de la boutique à rattacher.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="LM-XXXXXXXX"
            value={affiliateCode}
            onChange={(e) => setAffiliateCode(e.target.value)}
            className="font-mono uppercase"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAffiliateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAffiliate} disabled={affiliateLoading || !affiliateCode.trim()}>
              {affiliateLoading ? "Affiliation..." : "Affilier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const KpiCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default PartnerSpacePage;
