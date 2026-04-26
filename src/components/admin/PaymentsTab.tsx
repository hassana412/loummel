import { useEffect, useState } from "react";
import { Loader2, Send, History, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const formatFCFA = (n: number) =>
  `${new Intl.NumberFormat("fr-FR").format(Math.round(Number(n) || 0))} FCFA`;

const shortRef = (id: string) => id.slice(0, 8).toUpperCase();

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

interface Order {
  id: string;
  user_id: string;
  total: number;
  mode_paiement: string;
  statut: string;
  created_at: string;
}

interface ShopOrder {
  id: string;
  order_id: string;
  shop_id: string | null;
  shop_name: string;
  subtotal: number;
  statut: string;
}

interface Payout {
  id: string;
  shop_id: string | null;
  montant: number;
  mode_paiement: string | null;
  statut: string;
  reference_transaction: string | null;
  dispatched_at: string | null;
  created_at: string;
  shop_orders?: { shop_name: string } | null;
}

interface DispatchRow {
  shop_order_id: string;
  shop_id: string | null;
  shop_name: string;
  subtotal: number;
  mode_paiement: string;
  reference_transaction: string;
}

const paymentBadge = (mode: string | null) => {
  if (mode === "orange_money")
    return (
      <Badge className="bg-orange-500 hover:bg-orange-500/90 text-white">OM</Badge>
    );
  if (mode === "mtn_momo")
    return (
      <Badge className="bg-yellow-400 hover:bg-yellow-400/90 text-foreground">
        MTN
      </Badge>
    );
  if (mode === "virement_manuel")
    return <Badge variant="outline">Virement</Badge>;
  return <Badge variant="secondary">{mode || "—"}</Badge>;
};

const statusBadge = (statut: string) => {
  const map: Record<string, { label: string; className: string }> = {
    en_attente: { label: "En attente", className: "bg-muted text-muted-foreground" },
    paiement_en_cours: {
      label: "Paiement en cours",
      className: "bg-blue-500 hover:bg-blue-500/90 text-white",
    },
    dispatche: {
      label: "Dispatché",
      className: "bg-green-600 hover:bg-green-600/90 text-white",
    },
    annule: {
      label: "Annulé",
      className: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
    },
    erreur: {
      label: "Erreur",
      className: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
    },
  };
  const cfg = map[statut] || { label: statut, className: "bg-muted" };
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
};

export function PaymentsTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  // Dispatch dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOrder, setDialogOrder] = useState<Order | null>(null);
  const [dialogShopOrders, setDialogShopOrders] = useState<DispatchRow[]>([]);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [{ data: o }, { data: p }] = await Promise.all([
      supabase
        .from("orders")
        .select("id, user_id, total, mode_paiement, statut, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("shop_payouts")
        .select(
          "id, shop_id, montant, mode_paiement, statut, reference_transaction, dispatched_at, created_at, shop_orders(shop_name)"
        )
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    setOrders((o as Order[]) || []);
    setPayouts((p as unknown as Payout[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDispatch = async (order: Order) => {
    setDialogOrder(order);
    setDialogOpen(true);
    setDialogLoading(true);
    const { data, error } = await supabase
      .from("shop_orders")
      .select("id, shop_id, shop_name, subtotal")
      .eq("order_id", order.id);
    if (error) {
      toast.error("Impossible de charger les sous-commandes");
      setDialogLoading(false);
      return;
    }
    setDialogShopOrders(
      ((data as ShopOrder[]) || []).map((s) => ({
        shop_order_id: s.id,
        shop_id: s.shop_id,
        shop_name: s.shop_name,
        subtotal: Number(s.subtotal) || 0,
        mode_paiement: "orange_money",
        reference_transaction: "",
      }))
    );
    setDialogLoading(false);
  };

  const updateRow = (idx: number, patch: Partial<DispatchRow>) => {
    setDialogShopOrders((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    );
  };

  const confirmDispatch = async () => {
    if (!dialogOrder) return;
    setDispatching(true);
    try {
      const now = new Date().toISOString();

      // 1. Insert payouts
      const payoutsPayload = dialogShopOrders.map((r) => ({
        shop_order_id: r.shop_order_id,
        shop_id: r.shop_id,
        montant: r.subtotal,
        mode_paiement: r.mode_paiement,
        reference_transaction: r.reference_transaction || null,
        statut: "dispatche",
        dispatched_at: now,
      }));
      const { error: payErr } = await supabase
        .from("shop_payouts")
        .insert(payoutsPayload);
      if (payErr) throw payErr;

      // 2. Update shop_orders statut
      const shopOrderIds = dialogShopOrders.map((r) => r.shop_order_id);
      const { error: soErr } = await supabase
        .from("shop_orders")
        .update({ statut: "dispatche" })
        .in("id", shopOrderIds);
      if (soErr) throw soErr;

      // 3. Update order statut
      const { error: oErr } = await supabase
        .from("orders")
        .update({ statut: "dispatche" })
        .eq("id", dialogOrder.id);
      if (oErr) throw oErr;

      toast.success("Dispatch effectué ✓");
      setDialogOpen(false);
      setDialogOrder(null);
      setDialogShopOrders([]);
      await loadData();
    } catch (err: any) {
      console.error("[PaymentsTab] dispatch failed:", err);
      toast.error(err.message || "Erreur lors du dispatch");
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#966442]/10 flex items-center justify-center">
          <Wallet className="w-6 h-6 text-[#966442]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Paiements</h1>
          <p className="text-sm text-muted-foreground">
            Gestion centralisée des commandes et dispatches vers les boutiques
          </p>
        </div>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList>
          <TabsTrigger value="orders" className="gap-2">
            <Send className="w-4 h-4" /> Commandes reçues
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" /> Historique des dispatches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4">
          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#966442]" />
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                Aucune commande pour le moment.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Réf</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs font-semibold">
                        #{shortRef(o.id)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {o.user_id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatFCFA(o.total)}
                      </TableCell>
                      <TableCell>{paymentBadge(o.mode_paiement)}</TableCell>
                      <TableCell>{statusBadge(o.statut)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(o.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        {o.statut === "paiement_en_cours" && (
                          <Button
                            size="sm"
                            onClick={() => openDispatch(o)}
                            className="bg-[#966442] hover:bg-[#966442]/90"
                          >
                            <Send className="w-3.5 h-3.5 mr-1.5" />
                            Dispatcher
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#966442]" />
              </div>
            ) : payouts.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                Aucun dispatch enregistré.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Boutique</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Date dispatch</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {p.shop_orders?.shop_name || "—"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatFCFA(p.montant)}
                      </TableCell>
                      <TableCell>{paymentBadge(p.mode_paiement)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {p.reference_transaction || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {p.dispatched_at ? formatDate(p.dispatched_at) : "—"}
                      </TableCell>
                      <TableCell>{statusBadge(p.statut)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Dispatcher la commande #
              {dialogOrder ? shortRef(dialogOrder.id) : ""}
            </DialogTitle>
          </DialogHeader>

          {dialogLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#966442]" />
            </div>
          ) : dialogShopOrders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Aucune sous-commande trouvée pour cette commande.
            </div>
          ) : (
            <div className="space-y-4">
              {dialogShopOrders.map((row, idx) => (
                <Card key={row.shop_order_id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">{row.shop_name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Montant à virer
                      </p>
                    </div>
                    <p className="font-bold text-[#966442] text-lg">
                      {formatFCFA(row.subtotal)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`mode-${idx}`} className="text-xs">
                        Mode de dispatch
                      </Label>
                      <Select
                        value={row.mode_paiement}
                        onValueChange={(v) =>
                          updateRow(idx, { mode_paiement: v })
                        }
                      >
                        <SelectTrigger id={`mode-${idx}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="orange_money">
                            Orange Money
                          </SelectItem>
                          <SelectItem value="mtn_momo">MTN MoMo</SelectItem>
                          <SelectItem value="virement_manuel">
                            Virement manuel
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`ref-${idx}`} className="text-xs">
                        Référence transaction (optionnel)
                      </Label>
                      <Input
                        id={`ref-${idx}`}
                        placeholder="ex: TXN-..."
                        value={row.reference_transaction}
                        onChange={(e) =>
                          updateRow(idx, {
                            reference_transaction: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </Card>
              ))}

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  Total à dispatcher
                </span>
                <span className="font-bold text-lg text-[#966442]">
                  {formatFCFA(
                    dialogShopOrders.reduce((s, r) => s + r.subtotal, 0)
                  )}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={dispatching}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDispatch}
              disabled={dispatching || dialogLoading || dialogShopOrders.length === 0}
              className="bg-[#966442] hover:bg-[#966442]/90"
            >
              {dispatching && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmer le dispatch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
