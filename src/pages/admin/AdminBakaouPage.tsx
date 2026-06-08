import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Package, Loader2, ImageIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SHOP_SLUG = "bakaou";
const CATEGORIES = ["Alimentation", "Construction", "Autres"];

function StatusBadge({ statut }: { statut?: string }) {
  if (statut === "suspendu")
    return <Badge className="bg-orange-500 hover:bg-orange-500 text-white">Suspendu</Badge>;
  if (statut === "banni")
    return <Badge className="bg-red-600 hover:bg-red-600 text-white">Banni</Badge>;
  return <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white">Actif</Badge>;
}

type ProductForm = {
  name: string;
  category: string;
  prix_detail: string;
  prix_gros: string;
  unite: string;
  image_url: string;
  statut: string;
};

const emptyForm: ProductForm = {
  name: "",
  category: "Alimentation",
  prix_detail: "",
  prix_gros: "",
  unite: "",
  image_url: "",
  statut: "actif",
};

export default function AdminBakaouPage() {
  const { user, loading, roles } = useAuth();
  const navigate = useNavigate();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [statutFilter, setStatutFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/auth/vendeur", { replace: true });
  }, [user, loading, navigate]);

  const loadProducts = async (shopId: string) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });
    setProducts(data || []);
  };

  useEffect(() => {
    // Wait until auth + roles are fully resolved to avoid race-condition redirects
    if (loading) return;
    if (roles.length === 0) return;
    if (!user) return;
    const load = async () => {
      const { data: s } = await supabase
        .from("shops")
        .select("id, name, slug, user_id")
        .eq("slug", SHOP_SLUG)
        .maybeSingle();
      if (!s) {
        setLoadingData(false);
        return;
      }
      // Access control: super_admin OR owner of this shop
      const isAdmin = roles.includes("super_admin");
      const isOwner = roles.includes("shop_owner") && s.user_id === user.id;
      if (!isAdmin && !isOwner) {
        navigate("/", { replace: true });
        return;
      }
      setShop(s);
      await loadProducts(s.id);
      setLoadingData(false);
    };
    load();
  }, [user, roles, loading, navigate]);


  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (statutFilter !== "all" && (p.statut || "actif") !== statutFilter) return false;
        if (catFilter !== "all" && p.category !== catFilter) return false;
        return true;
      }),
    [products, statutFilter, catFilter]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name || "",
      category: p.category || "Alimentation",
      prix_detail: p.prix_detail?.toString() || p.price?.toString() || "",
      prix_gros: p.prix_gros?.toString() || "",
      unite: p.unite || "",
      image_url: p.image_url || "",
      statut: p.statut || "actif",
    });
    setDialogOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `bakaou/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("shop-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("shop-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast.success("Image téléversée");
    } catch (e: any) {
      toast.error("Erreur upload", { description: e.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!shop) return;
    if (!form.name.trim() || !form.prix_detail) {
      toast.error("Nom et prix détail requis");
      return;
    }
    setSaving(true);
    const payload: any = {
      shop_id: shop.id,
      name: form.name.trim(),
      category: form.category,
      prix_detail: Number(form.prix_detail),
      price: Number(form.prix_detail),
      prix_gros: form.prix_gros ? Number(form.prix_gros) : null,
      unite: form.unite || null,
      image_url: form.image_url || null,
      statut: form.statut,
    };
    let error;
    if (editingId) {
      ({ error } = await supabase.from("products").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("products").insert(payload));
    }
    setSaving(false);
    if (error) {
      toast.error("Erreur", { description: error.message });
      return;
    }
    toast.success(editingId ? "Produit mis à jour" : "Produit ajouté");
    setDialogOpen(false);
    await loadProducts(shop.id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("products").delete().eq("id", deleteId);
    if (error) {
      toast.error("Erreur", { description: error.message });
    } else {
      toast.success("Produit supprimé");
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
    }
    setDeleteId(null);
  };

  if (loading || loadingData) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#E8500A]" />
    </div>
  );


  return (
    <AdminLayoutShell
      title={shop ? `Boutique ${shop.name}` : "Boutique Bakaou"}
      subtitle="Gestion des produits"
    >
      <div className="flex flex-wrap gap-3 mb-5 items-center justify-between">
        <p className="text-sm text-slate-600">{filtered.length} produit(s)</p>
        <div className="flex flex-wrap gap-3">
          <Select value={statutFilter} onValueChange={setStatutFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="suspendu">Suspendu</SelectItem>
              <SelectItem value="banni">Banni</SelectItem>
            </SelectContent>
          </Select>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
          <Button onClick={openCreate} className="bg-[#E8500A] hover:bg-[#E8500A]/90 text-white">
            <Plus className="w-4 h-4 mr-2" />Ajouter un produit
          </Button>
        </div>
      </div>

      {loadingData ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#E8500A]" /></div>
      ) : !shop ? (
        <AdminEmptyState icon={Package} title="Boutique introuvable" description="La boutique 'bakaou' n'existe pas." />
      ) : filtered.length === 0 ? (
        <AdminEmptyState icon={Package} title="Aucun produit" description="Ajoutez votre premier produit." />
      ) : (
        <Card className="bg-white border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix détail</TableHead>
                  <TableHead>Prix gros</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell>{p.category || "—"}</TableCell>
                    <TableCell>{p.prix_detail ? `${Number(p.prix_detail).toLocaleString("fr-FR")} FCFA` : `${Number(p.price).toLocaleString("fr-FR")} FCFA`}</TableCell>
                    <TableCell>{p.prix_gros ? `${Number(p.prix_gros).toLocaleString("fr-FR")} FCFA` : "—"}</TableCell>
                    <TableCell>{p.unite || "—"}</TableCell>
                    <TableCell><StatusBadge statut={p.statut} /></TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => setDeleteId(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier le produit" : "Ajouter un produit"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom du produit *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Catégorie</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={form.statut} onValueChange={(v) => setForm({ ...form, statut: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="suspendu">Suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Prix détail (FCFA) *</Label>
                <Input type="number" value={form.prix_detail} onChange={(e) => setForm({ ...form, prix_detail: e.target.value })} />
              </div>
              <div>
                <Label>Prix gros (FCFA)</Label>
                <Input type="number" value={form.prix_gros} onChange={(e) => setForm({ ...form, prix_gros: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Unité (ex: sac 50kg, carton, litre)</Label>
              <Input value={form.unite} onChange={(e) => setForm({ ...form, unite: e.target.value })} />
            </div>
            <div>
              <Label>Photo</Label>
              <div className="flex items-center gap-3">
                {form.image_url && (
                  <img src={form.image_url} alt="" className="w-14 h-14 rounded object-cover" />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                  disabled={uploading}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving || uploading} className="bg-[#E8500A] hover:bg-[#E8500A]/90 text-white">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayoutShell>
  );
}
