import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Store, Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminBoutiquesPage() {
  const { user, loading, roles } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState<any[]>([]);
  const [partnerMap, setPartnerMap] = useState<Map<string, any>>(new Map());
  const [profileMap, setProfileMap] = useState<Map<string, any>>(new Map());
  const [filter, setFilter] = useState<"all" | "with" | "without">("all");
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !roles.includes("super_admin"))) navigate("/", { replace: true });
  }, [user, loading, roles, navigate]);

  useEffect(() => {
    const load = async () => {
      const { data: shopsData } = await supabase.from("shops").select("*").order("created_at", { ascending: false });
      if (!shopsData) {
        setLoadingData(false);
        return;
      }
      const userIds = [...new Set(shopsData.map((s) => s.user_id))];
      const partnerIds = [...new Set(shopsData.map((s) => s.partner_id).filter(Boolean))] as string[];

      const [{ data: profiles }, { data: partners }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email").in("id", userIds),
        partnerIds.length ? supabase.from("partners").select("id, user_id").in("id", partnerIds) : Promise.resolve({ data: [] as any[] }),
      ]);

      const partnerUserIds = (partners || []).map((p: any) => p.user_id);
      const { data: partnerProfiles } = partnerUserIds.length
        ? await supabase.from("profiles").select("id, full_name").in("id", partnerUserIds)
        : { data: [] as any[] };
      const partnerProfileMap = new Map((partnerProfiles || []).map((p: any) => [p.id, p]));

      const pMap = new Map(
        (partners || []).map((p: any) => [p.id, { ...p, profile: partnerProfileMap.get(p.user_id) }])
      );

      setProfileMap(new Map((profiles || []).map((p) => [p.id, p])));
      setPartnerMap(pMap);
      setShops(shopsData);
      setLoadingData(false);
    };
    load();
  }, []);

  const filtered = shops.filter((s) => {
    if (filter === "with") return !!s.partner_id;
    if (filter === "without") return !s.partner_id;
    return true;
  });

  if (loading) return null;

  return (
    <AdminLayoutShell title="Boutiques" subtitle="Toutes les boutiques de la plateforme">
      <div className="flex justify-between items-center mb-5 gap-3">
        <p className="text-sm text-slate-600">{filtered.length} boutique(s)</p>
        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="with">Avec partenaire</SelectItem>
            <SelectItem value="without">Sans partenaire</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loadingData ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#E8500A]" />
        </div>
      ) : filtered.length === 0 ? (
        <AdminEmptyState icon={Store} title="Aucune boutique" description="Aucune boutique ne correspond à ce filtre." />
      ) : (
        <Card className="bg-white border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom boutique</TableHead>
                <TableHead>Propriétaire</TableHead>
                <TableHead>Partenaire</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const owner = profileMap.get(s.user_id);
                const partner = s.partner_id ? partnerMap.get(s.partner_id) : null;
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{owner?.full_name || owner?.email || "—"}</TableCell>
                    <TableCell>
                      {partner?.profile?.full_name ? (
                        <Badge variant="outline">{partner.profile.full_name}</Badge>
                      ) : (
                        <span className="text-slate-400 text-sm">Direct</span>
                      )}
                    </TableCell>
                    <TableCell>{s.city || s.region || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/boutique/${s.slug}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </AdminLayoutShell>
  );
}
