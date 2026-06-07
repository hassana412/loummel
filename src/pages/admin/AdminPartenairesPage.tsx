import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Handshake, Plus, Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminPartenairesPage() {
  const { user, loading, roles } = useAuth();
  const navigate = useNavigate();
  const [partners, setPartners] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !roles.includes("super_admin"))) navigate("/", { replace: true });
  }, [user, loading, roles, navigate]);

  useEffect(() => {
    const load = async () => {
      const { data: partnersData } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (!partnersData) {
        setLoadingData(false);
        return;
      }

      const userIds = partnersData.map((p) => p.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .in("id", userIds);

      const profileMap = new Map((profilesData || []).map((p) => [p.id, p]));

      const enriched = partnersData.map((p) => ({
        ...p,
        profile: profileMap.get(p.user_id),
      }));

      setPartners(enriched);
      setLoadingData(false);
    };
    load();
  }, []);

  if (loading) return null;

  return (
    <AdminLayoutShell title="Partenaires" subtitle="Gestion des partenaires de la plateforme">
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-slate-600">{partners.length} partenaire(s)</p>
        <Button className="bg-[#E8500A] hover:bg-[#E8500A]/90 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un partenaire
        </Button>
      </div>

      {loadingData ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#E8500A]" />
        </div>
      ) : partners.length === 0 ? (
        <AdminEmptyState
          icon={Handshake}
          title="Aucun partenaire"
          description="Ajoutez votre premier partenaire pour commencer à étendre votre réseau."
        />
      ) : (
        <Card className="bg-white border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Ville/Région</TableHead>
                <TableHead>Boutiques liées</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.profile?.full_name || "—"}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{p.profile?.email || "—"}</div>
                      <div className="text-slate-500">{p.profile?.phone || ""}</div>
                    </div>
                  </TableCell>
                  <TableCell>{p.region || "—"}</TableCell>
                  <TableCell>{p.shops_recruited ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "approved" ? "default" : "secondary"}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
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
