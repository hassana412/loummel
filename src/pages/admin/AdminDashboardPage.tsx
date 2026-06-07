import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import { Card } from "@/components/ui/card";
import { Loader2, Store, Handshake, Users, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboardPage() {
  const { user, loading, roles } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ shops: 0, partners: 0, clients: 0, revenue: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !roles.includes("super_admin"))) {
      navigate("/", { replace: true });
    }
  }, [user, loading, roles, navigate]);

  useEffect(() => {
    const load = async () => {
      const [shops, partners, profiles, orders] = await Promise.all([
        supabase.from("shops").select("id", { count: "exact", head: true }),
        supabase.from("partners").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
      ]);
      const revenue = (orders.data || []).reduce((s: number, o: any) => s + Number(o.total || 0), 0);
      setStats({
        shops: shops.count || 0,
        partners: partners.count || 0,
        clients: profiles.count || 0,
        revenue,
      });
      setLoadingStats(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8500A]" />
      </div>
    );
  }

  const cards = [
    { label: "Boutiques", value: stats.shops, icon: Store, color: "#E8500A" },
    { label: "Partenaires", value: stats.partners, icon: Handshake, color: "#0EA5E9" },
    { label: "Clients", value: stats.clients, icon: Users, color: "#10B981" },
    { label: "Revenus (FCFA)", value: stats.revenue.toLocaleString("fr-FR"), icon: Wallet, color: "#F59E0B" },
  ];

  return (
    <AdminLayoutShell title="Vue d'ensemble" subtitle="Tableau de bord administrateur Loummel">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 bg-white border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600 font-medium">{c.label}</p>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.color}15` }}>
                <c.icon className="w-5 h-5" style={{ color: c.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : c.value}
            </p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-6 bg-white border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-2">Bienvenue dans l'espace Admin</h3>
        <p className="text-sm text-slate-600">
          Utilisez la barre latérale pour gérer les partenaires, boutiques, clients,
          finances et produits de la plateforme Loummel.
        </p>
      </Card>
    </AdminLayoutShell>
  );
}
