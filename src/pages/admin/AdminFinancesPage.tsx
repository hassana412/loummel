import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, Loader2, TrendingUp, Clock, CheckCircle, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminFinancesPage() {
  const { user, loading, roles } = useAuth();
  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(true);
  const [kpis, setKpis] = useState({ revenue: 0, commissions: 0, pending: 0, paid: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (!user || !roles.includes("super_admin"))) navigate("/", { replace: true });
  }, [user, loading, roles, navigate]);

  useEffect(() => {
    const load = async () => {
      const [{ data: shopOrders }, { data: payouts }] = await Promise.all([
        supabase.from("shop_orders").select("*").order("created_at", { ascending: false }),
        supabase.from("shop_payouts").select("*").order("created_at", { ascending: false }),
      ]);

      const revenue = (shopOrders || []).reduce((s: number, o: any) => s + Number(o.subtotal || 0), 0);
      const pending = (payouts || [])
        .filter((p: any) => p.statut === "en_attente")
        .reduce((s: number, p: any) => s + Number(p.montant || 0), 0);
      const paid = (payouts || [])
        .filter((p: any) => p.statut !== "en_attente")
        .reduce((s: number, p: any) => s + Number(p.montant || 0), 0);
      const commissions = revenue - paid - pending;

      setKpis({ revenue, commissions: Math.max(0, commissions), pending, paid });
      setTransactions((payouts || []).slice(0, 20));
      setLoadingData(false);
    };
    load();
  }, []);

  if (loading) return null;

  const cards = [
    { label: "Revenus totaux", value: kpis.revenue, icon: TrendingUp, color: "#E8500A" },
    { label: "Commissions perçues", value: kpis.commissions, icon: Coins, color: "#10B981" },
    { label: "Paiements en attente", value: kpis.pending, icon: Clock, color: "#F59E0B" },
    { label: "Paiements versés", value: kpis.paid, icon: CheckCircle, color: "#0EA5E9" },
  ];

  return (
    <AdminLayoutShell title="Finances" subtitle="Revenus, commissions et paiements">
      {loadingData ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#E8500A]" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {cards.map((c) => (
              <Card key={c.label} className="p-5 bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-slate-600 font-medium">{c.label}</p>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.color}15` }}>
                    <c.icon className="w-5 h-5" style={{ color: c.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {c.value.toLocaleString("fr-FR")} <span className="text-sm text-slate-500 font-normal">FCFA</span>
                </p>
              </Card>
            ))}
          </div>

          <h3 className="font-semibold text-slate-900 mb-3">Transactions récentes</h3>
          {transactions.length === 0 ? (
            <AdminEmptyState icon={Wallet} title="Aucune transaction" description="Les paiements apparaîtront ici." />
          ) : (
            <Card className="bg-white border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{new Date(t.created_at).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell className="font-mono text-xs">{t.reference_transaction || t.id.slice(0, 8)}</TableCell>
                      <TableCell>{t.mode_paiement || "—"}</TableCell>
                      <TableCell className="font-semibold">{Number(t.montant).toLocaleString("fr-FR")} FCFA</TableCell>
                      <TableCell>
                        <Badge variant={t.statut === "en_attente" ? "secondary" : "default"}>{t.statut}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}
    </AdminLayoutShell>
  );
}
