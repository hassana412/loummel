import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Store, Loader2, Eye, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type FilterKey = "all" | "active" | "pending" | "suspended";

export default function AdminBoutiquesPage() {
  const { user, loading, roles } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState<any[]>([]);
  const [partnerMap, setPartnerMap] = useState<Map<string, any>>(new Map());
  const [profileMap, setProfileMap] = useState<Map<string, any>>(new Map());
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loadingData, setLoadingData] = useState(true);

  const [validateTarget, setValidateTarget] = useState<any>(null);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !roles.includes("super_admin"))) navigate("/", { replace: true });
  }, [user, loading, roles, navigate]);

  const load = async () => {
    setLoadingData(true);
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

  useEffect(() => {
    load();
  }, []);

  const pendingCount = shops.filter((s) => s.status === "pending").length;

  const filtered = shops.filter((s) => {
    if (filter === "active") return s.status === "active";
    if (filter === "pending") return s.status === "pending";
    if (filter === "suspended") return s.status === "suspended";
    return true;
  });

  const validateShop = async () => {
    if (!validateTarget) return;
    setActionLoading(true);
    const { error } = await supabase
      .from("shops")
      .update({ status: "active" })
      .eq("id", validateTarget.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      await supabase.from("notifications").insert({
        user_id: validateTarget.user_id,
        title: "Boutique validée !",
        message: `Votre boutique "${validateTarget.name}" a été validée.`,
        type: "shop_validated",
        related_id: validateTarget.id,
      });
      if (user) {
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "shop_validated",
          entity_type: "shop",
          entity_id: validateTarget.id,
          details: { name: validateTarget.name },
        });
      }
      toast({ title: "Boutique validée" });
      setValidateTarget(null);
      load();
    }
    setActionLoading(false);
  };

  const rejectShop = async () => {
    if (!rejectTarget || !rejectComment.trim()) return;
    setActionLoading(true);
    const { error } = await supabase
      .from("shops")
      .update({ status: "rejected" })
      .eq("id", rejectTarget.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      await supabase.from("notifications").insert({
        user_id: rejectTarget.user_id,
        title: "Boutique rejetée",
        message: `Votre boutique "${rejectTarget.name}" a été rejetée. Motif: ${rejectComment.trim()}`,
        type: "shop_rejected",
        related_id: rejectTarget.id,
      });
      if (user) {
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "shop_rejected",
          entity_type: "shop",
          entity_id: rejectTarget.id,
          details: { name: rejectTarget.name, motif: rejectComment.trim() },
        });
      }
      toast({ title: "Boutique rejetée" });
      setRejectTarget(null);
      setRejectComment("");
      load();
    }
    setActionLoading(false);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      active: { label: "Active", className: "bg-green-100 text-green-800" },
      pending: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
      suspended: { label: "Suspendue", className: "bg-red-100 text-red-800" },
      rejected: { label: "Rejetée", className: "bg-red-100 text-red-800" },
    };
    const v = map[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={v.className}>{v.label}</Badge>;
  };

  if (loading) return null;

  return (
    <AdminLayoutShell title="Boutiques" subtitle="Toutes les boutiques de la plateforme">
      <div className="mb-5">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="active">Actifs</TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              En attente
              {pendingCount > 0 && (
                <Badge className="bg-yellow-500 text-white h-5 px-1.5">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="suspended">Suspendus</TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-sm text-slate-600 mt-3">{filtered.length} boutique(s)</p>
      </div>

      {loadingData ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#966442]" />
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
                    <TableCell>{statusBadge(s.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => setValidateTarget(s)}
                            >
                              <Check className="w-3 h-3 mr-1" /> Valider
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setRejectTarget(s)}
                            >
                              <X className="w-3 h-3 mr-1" /> Rejeter
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/boutique/${s.slug}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <AlertDialog open={!!validateTarget} onOpenChange={(o) => !o && setValidateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Valider la boutique</AlertDialogTitle>
            <AlertDialogDescription>
              Confirmer l'activation de "{validateTarget?.name}" ? Le vendeur sera notifié.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading}
              onClick={validateShop}
              className="bg-green-600 hover:bg-green-700"
            >
              Valider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!rejectTarget} onOpenChange={(o) => { if (!o) { setRejectTarget(null); setRejectComment(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la boutique</DialogTitle>
            <DialogDescription>
              Veuillez préciser le motif du rejet de "{rejectTarget?.name}". Ce commentaire est obligatoire.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motif du rejet..."
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectComment(""); }} disabled={actionLoading}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={actionLoading || !rejectComment.trim()}
              onClick={rejectShop}
            >
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayoutShell>
  );
}
