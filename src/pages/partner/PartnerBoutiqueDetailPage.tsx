import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Wallet, AlertTriangle } from "lucide-react";

type Shop = any;
type PartnerBoutique = {
  id: string;
  statut: string | null;
  partner_id: string;
  boutique_id: string;
  commentaire_suspension: string | null;
};

const statutMap: Record<string, { label: string; className: string }> = {
  creation: { label: "En création", className: "bg-muted text-muted-foreground" },
  actif: { label: "Actif", className: "bg-[hsl(var(--ecom-green))] text-white" },
  suspendu: { label: "Suspendu", className: "bg-destructive text-destructive-foreground" },
  reactif: { label: "Réactivé", className: "bg-blue-500 text-white" },
};

const PartnerBoutiqueDetailPage = () => {
  const { id: boutiqueId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<Shop | null>(null);
  const [ownerName, setOwnerName] = useState<string>("");
  const [pb, setPb] = useState<PartnerBoutique | null>(null);
  const [partner, setPartner] = useState<any>(null);
  const [productStock, setProductStock] = useState(0);
  const [productsSold, setProductsSold] = useState(0);
  const [productsReturned, setProductsReturned] = useState(0);
  const [abonnements, setAbonnements] = useState<any[]>([]);
  const [caToday, setCaToday] = useState(0);
  const [caWeek, setCaWeek] = useState(0);
  const [caMonth, setCaMonth] = useState(0);
  const [caYear, setCaYear] = useState(0);
  const [paymentModes, setPaymentModes] = useState<string[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletTx, setWalletTx] = useState<any[]>([]);

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendComment, setSuspendComment] = useState("");
  const [activateOpen, setActivateOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth/partenaire");
      return;
    }
    if (boutiqueId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, boutiqueId]);

  const load = async () => {
    if (!user || !boutiqueId) return;
    setLoading(true);
    try {
      const { data: partnerData, error: partnerError } = await supabase
        .from("partners")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["active", "approved"])
        .maybeSingle();
      if (partnerError) throw partnerError;
      if (!partnerData) {
        toast({ title: "Accès refusé", variant: "destructive" });
        navigate("/partner");
        return;
      }
      setPartner(partnerData);

      const { data: pbData, error: pbError } = await supabase
        .from("partner_boutiques")
        .select("*")
        .eq("partner_id", partnerData.id)
        .eq("boutique_id", boutiqueId)
        .maybeSingle();
      if (pbError) throw pbError;
      if (!pbData) {
        toast({ title: "Boutique non affiliée", variant: "destructive" });
        navigate("/partner");
        return;
      }
      setPb(pbData as PartnerBoutique);

      const { data: shopData } = await supabase
        .from("shops")
        .select("*")
        .eq("id", boutiqueId)
        .maybeSingle();
      setShop(shopData);

      if (shopData?.user_id) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", shopData.user_id)
          .maybeSingle();
        setOwnerName((prof as any)?.full_name || "");
      }

      // Product stock
      const { count: stockCount } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("shop_id", boutiqueId)
        .eq("statut", "actif");
      setProductStock(stockCount || 0);

      // Sold / returned
      const { count: soldCount } = await supabase
        .from("commandes")
        .select("id", { count: "exact", head: true })
        .eq("boutique_id", boutiqueId)
        .eq("statut_commande", "livree");
      setProductsSold(soldCount || 0);

      const { count: retCount } = await supabase
        .from("commandes")
        .select("id", { count: "exact", head: true })
        .eq("boutique_id", boutiqueId)
        .eq("statut_commande", "retournee");
      setProductsReturned(retCount || 0);

      // Subscriptions
      const { data: abs } = await supabase
        .from("abonnements")
        .select("*")
        .eq("boutique_id", boutiqueId)
        .order("created_at", { ascending: false });
      setAbonnements(abs || []);

      // CA aggregations
      const now = new Date();
      const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
      const startWeek = new Date(now); startWeek.setDate(now.getDate() - now.getDay()); startWeek.setHours(0, 0, 0, 0);
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startYear = new Date(now.getFullYear(), 0, 1);

      const { data: paidOrders } = await supabase
        .from("commandes")
        .select("montant_total, mode_paiement, created_at")
        .eq("boutique_id", boutiqueId)
        .eq("statut_paiement", "paye");

      let today = 0, week = 0, month = 0, year = 0;
      const modes = new Set<string>();
      (paidOrders || []).forEach((o: any) => {
        const m = Number(o.montant_total || 0);
        const d = new Date(o.created_at);
        if (d >= startToday) today += m;
        if (d >= startWeek) week += m;
        if (d >= startMonth) month += m;
        if (d >= startYear) year += m;
        if (o.mode_paiement) modes.add(o.mode_paiement);
      });
      setCaToday(today); setCaWeek(week); setCaMonth(month); setCaYear(year);
      setPaymentModes(Array.from(modes));

      // Wallet
      const { data: wallets } = await supabase
        .from("mobile_wallets")
        .select("id, balance")
        .eq("partner_id", partnerData.id);
      const totalBal = (wallets || []).reduce((s: number, w: any) => s + Number(w.balance || 0), 0);
      setWalletBalance(totalBal);

      const walletIds = (wallets || []).map((w: any) => w.id);
      if (walletIds.length > 0) {
        const { data: txs } = await supabase
          .from("wallet_transactions")
          .select("*")
          .in("wallet_id", walletIds)
          .order("created_at", { ascending: false })
          .limit(50);
        setWalletTx(txs || []);
      } else {
        setWalletTx([]);
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erreur de chargement", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (
    newStatut: "actif" | "suspendu" | "reactif",
    commentaire?: string,
  ) => {
    if (!pb) return;
    setActionLoading(true);
    try {
      const patch: any = { statut: newStatut };
      if (newStatut === "actif") patch.date_activation = new Date().toISOString();
      if (newStatut === "suspendu") {
        patch.date_suspension = new Date().toISOString();
        patch.commentaire_suspension = commentaire || null;
      }

      if (newStatut === "actif" && pb.boutique_id) {
        const { error: shopErr } = await supabase
          .from("shops")
          .update({ status: "active" })
          .eq("id", pb.boutique_id);
        if (shopErr) throw shopErr;
      }

      const { error } = await supabase
        .from("partner_boutiques")
        .update(patch)
        .eq("id", pb.id);
      if (error) throw error;

      toast({
        title: newStatut === "actif"
          ? "Boutique activée avec succès"
          : "Statut mis à jour",
      });
      setSuspendOpen(false);
      setSuspendComment("");
      setActivateOpen(false);
      setReactivateOpen(false);
      load();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const status = statutMap[pb?.statut || "creation"] || statutMap.creation;
  const commissionRate = Number(partner?.current_commission_rate || partner?.base_commission_rate || 0);
  const commissionsGenerated = (caMonth * commissionRate) / 100;
  const fmt = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" onClick={() => navigate("/partner")}>
        <ArrowLeft className="w-4 h-4" /> Retour
      </Button>

      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{shop?.name || "Boutique"}</h1>
          <p className="text-muted-foreground">{shop?.category || "—"}</p>
        </div>
        <Badge className={status.className + " text-base px-4 py-2"}>{status.label}</Badge>
      </header>

      <Tabs defaultValue="infos">
        <TabsList>
          <TabsTrigger value="infos">Informations</TabsTrigger>
          <TabsTrigger value="abo">Abonnement</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
        </TabsList>

        {/* TAB 1 */}
        <TabsContent value="infos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Détails de la boutique</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <InfoRow label="Nom" value={shop?.name} />
              <InfoRow label="Propriétaire" value={ownerName} />
              <InfoRow label="Téléphone" value={shop?.contact_phone} />
              <InfoRow label="WhatsApp" value={shop?.contact_whatsapp} />
              <InfoRow label="Adresse" value={shop?.contact_address} />
              <InfoRow label="Catégorie" value={shop?.category} />
              <InfoRow
                label="Date de création"
                value={shop?.created_at ? new Date(shop.created_at).toLocaleDateString("fr-FR") : "—"}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Produits en stock" value={productStock} />
            <StatCard label="Produits vendus" value={productsSold} />
            <StatCard label="Produits retournés" value={productsReturned} />
          </div>
        </TabsContent>

        {/* TAB 2 */}
        <TabsContent value="abo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statut de l'abonnement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={status.className}>{status.label}</Badge>
                {pb?.commentaire_suspension && pb.statut === "suspendu" && (
                  <span className="text-sm text-muted-foreground">
                    Motif: {pb.commentaire_suspension}
                  </span>
                )}
              </div>
              {pb?.statut === "creation" && (
                <div className="flex items-start gap-3 p-4 rounded-lg border border-yellow-300 bg-yellow-50">
                  <AlertTriangle className="w-5 h-5 text-yellow-700 mt-0.5" />
                  <div className="text-sm text-yellow-900">
                    Cette boutique est en attente de validation.
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {pb?.statut === "creation" && (
                  <Button
                    onClick={() => setActivateOpen(true)}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Activer la boutique
                  </Button>
                )}
                {pb?.statut === "actif" && (
                  <Button
                    variant="destructive"
                    onClick={() => setSuspendOpen(true)}
                    disabled={actionLoading}
                  >
                    Suspendre
                  </Button>
                )}
                {pb?.statut === "suspendu" && (
                  <Button
                    onClick={() => setReactivateOpen(true)}
                    disabled={actionLoading}
                  >
                    Réactiver
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historique des abonnements</CardTitle>
            </CardHeader>
            <CardContent>
              {abonnements.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun abonnement enregistré.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Paiement</TableHead>
                      <TableHead>Mode</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {abonnements.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{new Date(a.created_at).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell>{a.type_service || "—"}</TableCell>
                        <TableCell>{fmt(Number(a.montant || 0))}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{a.statut_paiement || "—"}</Badge>
                        </TableCell>
                        <TableCell>{a.mode_paiement || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3 */}
        <TabsContent value="finance" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="CA aujourd'hui" value={fmt(caToday)} />
            <StatCard label="CA cette semaine" value={fmt(caWeek)} />
            <StatCard label="CA ce mois" value={fmt(caMonth)} />
            <StatCard label="CA cette année" value={fmt(caYear)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-1">
                  Commissions générées (mois)
                </p>
                <p className="text-2xl font-bold">{fmt(commissionsGenerated)}</p>
                <p className="text-xs text-muted-foreground mt-1">Taux: {commissionRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-1">Modes de paiement actifs</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {paymentModes.length === 0 ? (
                    <span className="text-sm">—</span>
                  ) : (
                    paymentModes.map((m) => (
                      <Badge key={m} variant="outline">{m}</Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Wallet className="w-4 h-4" /> Solde wallet
                </div>
                <p className="text-2xl font-bold">{fmt(walletBalance)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Historique des transactions wallet</CardTitle>
            </CardHeader>
            <CardContent>
              {walletTx.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune transaction.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Référence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {walletTx.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{new Date(t.created_at).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell>{t.type || "—"}</TableCell>
                        <TableCell>{fmt(Number(t.amount || 0))}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{t.status || "—"}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {t.reference || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspendre la boutique</DialogTitle>
            <DialogDescription>
              Veuillez préciser le motif de la suspension.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motif de suspension..."
            value={suspendComment}
            onChange={(e) => setSuspendComment(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={actionLoading || !suspendComment.trim()}
              onClick={() => updateStatut("suspendu", suspendComment.trim())}
            >
              Confirmer la suspension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={activateOpen} onOpenChange={setActivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activer la boutique</AlertDialogTitle>
            <AlertDialogDescription>
              La boutique sera mise en ligne et visible des clients. Confirmer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading}
              onClick={() => updateStatut("actif")}
              className="bg-green-600 hover:bg-green-700"
            >
              Activer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={reactivateOpen} onOpenChange={setReactivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réactiver la boutique</AlertDialogTitle>
            <AlertDialogDescription>
              La boutique repassera à l'état actif. Confirmer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading}
              onClick={() => updateStatut("reactif")}
            >
              Réactiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <div>
    <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="font-medium">{value || "—"}</p>
  </div>
);

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <Card>
    <CardContent className="p-5">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

export default PartnerBoutiqueDetailPage;
