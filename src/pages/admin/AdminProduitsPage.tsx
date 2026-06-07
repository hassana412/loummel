import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Package, Loader2, ImageIcon, MoreHorizontal, CheckCircle, PauseCircle, Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function StatusBadge({ statut }: { statut?: string }) {
  if (statut === "suspendu")
    return <Badge className="bg-orange-500 hover:bg-orange-500 text-white">Suspendu</Badge>;
  if (statut === "banni")
    return <Badge className="bg-red-600 hover:bg-red-600 text-white">Banni</Badge>;
  return <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white">Actif</Badge>;
}

export default function AdminProduitsPage() {
  const { user, loading, roles } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [shopMap, setShopMap] = useState<Map<string, any>>(new Map());
  const [loadingData, setLoadingData] = useState(true);
  const [shopFilter, setShopFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [showBanned, setShowBanned] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [productToBan, setProductToBan] = useState<any>(null);

  useEffect(() => {
    if (!loading && (!user || !roles.includes("super_admin"))) navigate("/", { replace: true });
  }, [user, loading, roles, navigate]);

  useEffect(() => {
    const load = async () => {
      const [{ data: prods }, { data: shops }] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("shops").select("id, name"),
      ]);
      setProducts(prods || []);
      setShopMap(new Map((shops || []).map((s) => [s.id, s])));
      setLoadingData(false);
    };
    load();
  }, []);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );
  const shops = useMemo(() => Array.from(shopMap.values()), [shopMap]);

  const filtered = products.filter((p) => {
    if (shopFilter !== "all" && p.shop_id !== shopFilter) return false;
    if (catFilter !== "all" && p.category !== catFilter) return false;
    if (!showBanned && p.statut === "banni") return false;
    return true;
  });

  const updateStatus = async (productId: string, statut: string) => {
    const { error } = await supabase.from("products").update({ statut }).eq("id", productId);
    if (error) {
      toast.error("Erreur", { description: error.message });
      return;
    }
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, statut } : p)));
    toast.success("Statut mis à jour");
  };

  const handleBanClick = (product: any) => {
    setProductToBan(product);
    setBanDialogOpen(true);
  };

  const confirmBan = () => {
    if (productToBan) {
      updateStatus(productToBan.id, "banni");
    }
    setBanDialogOpen(false);
    setProductToBan(null);
  };

  if (loading) return null;

  return (
    <AdminLayoutShell title="Produits & Services" subtitle="Catalogue global de la plateforme">
      <div className="flex flex-wrap gap-3 mb-5 items-center justify-between">
        <p className="text-sm text-slate-600">{filtered.length} produit(s)</p>
        <div className="flex flex-wrap gap-3">
          <Select value={shopFilter} onValueChange={setShopFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Boutique" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les boutiques</SelectItem>
              {shops.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Catégorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={showBanned ? "yes" : "no"} onValueChange={(v) => setShowBanned(v === "yes")}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Afficher bannis" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="no">Masquer les bannis</SelectItem>
              <SelectItem value="yes">Afficher les bannis</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loadingData ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#E8500A]" /></div>
      ) : filtered.length === 0 ? (
        <AdminEmptyState icon={Package} title="Aucun produit" description="Aucun produit ne correspond à ce filtre." />
      ) : (
        <Card className="bg-white border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Boutique</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix détail</TableHead>
                  <TableHead>Prix gros</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className={p.statut === "banni" ? "opacity-60" : ""}>
                    <TableCell>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-md object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{shopMap.get(p.shop_id)?.name || "—"}</TableCell>
                    <TableCell>{p.category || "—"}</TableCell>
                    <TableCell>{p.prix_detail ? `${Number(p.prix_detail).toLocaleString("fr-FR")} FCFA` : `${Number(p.price).toLocaleString("fr-FR")} FCFA`}</TableCell>
                    <TableCell>{p.prix_gros ? `${Number(p.prix_gros).toLocaleString("fr-FR")} FCFA` : "—"}</TableCell>
                    <TableCell><StatusBadge statut={p.statut} /></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {p.statut !== "actif" && (
                            <DropdownMenuItem onClick={() => updateStatus(p.id, "actif")}>
                              <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                              Activer
                            </DropdownMenuItem>
                          )}
                          {p.statut !== "suspendu" && (
                            <DropdownMenuItem onClick={() => updateStatus(p.id, "suspendu")}>
                              <PauseCircle className="w-4 h-4 mr-2 text-orange-500" />
                              Suspendre
                            </DropdownMenuItem>
                          )}
                          {p.statut !== "banni" && (
                            <DropdownMenuItem onClick={() => handleBanClick(p)} className="text-red-600 focus:text-red-600">
                              <Ban className="w-4 h-4 mr-2" />
                              Bannir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bannir ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir bannir ce produit ?<br />
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setBanDialogOpen(false); setProductToBan(null); }}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBan} className="bg-red-600 hover:bg-red-700 text-white">
              Bannir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayoutShell>
  );
}
