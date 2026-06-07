import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminClientsPage() {
  const { user, loading, roles } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !roles.includes("super_admin"))) navigate("/", { replace: true });
  }, [user, loading, roles, navigate]);

  useEffect(() => {
    const load = async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: orders } = await supabase.from("orders").select("user_id, total");

      const ordersByUser = new Map<string, { count: number; total: number }>();
      (orders || []).forEach((o: any) => {
        const cur = ordersByUser.get(o.user_id) || { count: 0, total: 0 };
        cur.count += 1;
        cur.total += Number(o.total || 0);
        ordersByUser.set(o.user_id, cur);
      });

      const enriched = (profiles || []).map((p) => ({
        ...p,
        orderCount: ordersByUser.get(p.id)?.count || 0,
        orderTotal: ordersByUser.get(p.id)?.total || 0,
      }));

      setClients(enriched);
      setLoadingData(false);
    };
    load();
  }, []);

  if (loading) return null;

  return (
    <AdminLayoutShell title="Clients" subtitle="Tous les clients inscrits sur Loummel">
      <div className="mb-5">
        <p className="text-sm text-slate-600">{clients.length} client(s)</p>
      </div>

      {loadingData ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#E8500A]" />
        </div>
      ) : clients.length === 0 ? (
        <AdminEmptyState icon={Users} title="Aucun client" description="Les nouveaux clients apparaîtront ici dès leur inscription." />
      ) : (
        <Card className="bg-white border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead>Total (FCFA)</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.full_name || "—"}</TableCell>
                  <TableCell>{c.email || "—"}</TableCell>
                  <TableCell>{c.phone || "—"}</TableCell>
                  <TableCell>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : "—"}
                  </TableCell>
                  <TableCell>{c.orderCount}</TableCell>
                  <TableCell>{c.orderTotal.toLocaleString("fr-FR")}</TableCell>
                  <TableCell>
                    <Badge variant={c.orderCount > 0 ? "default" : "secondary"}>
                      {c.orderCount > 0 ? "Actif" : "Inscrit"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </AdminLayoutShell>
  );
}
