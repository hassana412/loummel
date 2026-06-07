import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminProduitsPage() {
  const { user, loading, roles } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [shopMap, setShopMap] = useState<Map<string, any>>(new Map());
  const [loadingData, setLoadingData] = useState(true);
  const [shopFilter, setShopFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");

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
    return true;
  });

  if (loading) return null;

  return (
    <AdminLayoutShell title="Produits & Services" subtitle="Catalogue global de la plateforme">
      <div className="flex flex-wrap gap-3 mb-5 items-center justify-between">
        <p className="text-sm text-slate-600">{filtered.length} produit(s)</p>
        <div className="flex gap-3">
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
        </div>
      </div>

      {loadingData ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#E8500A]" /></div>
      ) : filtered.length === 0 ? (
        <AdminEmptyState icon={Package} title="Aucun produit" description="Aucun produit ne correspond à ce filtre." />
      ) : (
        <Card className="bg-white border border-slate-200">
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
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
                  <TableCell>
                    <Badge variant={p.is_promo ? "default" : "secondary"}>{p.is_promo ? "Promo" : "Actif"}</Badge>
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
