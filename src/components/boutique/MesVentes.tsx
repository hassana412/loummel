import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Wallet, Clock, CheckCircle2, Loader2, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ShopOrder {
  id: string;
  order_id: string | null;
  shop_id: string | null;
  shop_name: string;
  items: any;
  subtotal: number;
  statut: string;
  created_at: string;
}

const formatFCFA = (n: number) =>
  `${new Intl.NumberFormat("fr-FR").format(Math.round(Number(n) || 0))} FCFA`;

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusBadge = (statut: string) => {
  if (statut === "dispatche") {
    return (
      <Badge className="bg-green-600 hover:bg-green-600/90 text-white gap-1">
        <CheckCircle2 className="w-3 h-3" />
        Dispatché
      </Badge>
    );
  }
  if (statut === "en_attente") {
    return (
      <Badge className="bg-muted text-muted-foreground gap-1">
        <Clock className="w-3 h-3" />
        En attente
      </Badge>
    );
  }
  return <Badge variant="secondary">{statut}</Badge>;
};

export function MesVentes() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopSlug, setShopSlug] = useState<string | null>(null);
  const [shopOrders, setShopOrders] = useState<ShopOrder[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);

      const { data: shop } = await supabase
        .from("shops")
        .select("id, slug")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!shop) {
        setLoading(false);
        return;
      }

      setShopId(shop.id);
      setShopSlug(shop.slug);

      const { data: orders } = await supabase
        .from("shop_orders")
        .select("*")
        .eq("shop_id", shop.id)
        .order("created_at", { ascending: false });

      setShopOrders((orders as ShopOrder[]) || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const totalSales = shopOrders.reduce((s, o) => s + (Number(o.subtotal) || 0), 0);
  const ordersCount = shopOrders.length;
  const pendingCount = shopOrders.filter((o) => o.statut === "en_attente").length;

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#966442]" />
      </div>
    );
  }

  if (!shopId) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Aucune boutique trouvée pour votre compte.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#966442]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#966442]" />
              Total des ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#966442]">
              {formatFCFA(totalSales)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#966442]" />
              Commandes reçues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{ordersCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#966442]" />
              En attente de dispatch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#966442]" />
            Mes ventes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shopOrders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Aucune vente pour le moment</p>
              {shopSlug && (
                <Button asChild variant="outline">
                  <Link to={`/boutique/${shopSlug}`}>
                    <Store className="w-4 h-4 mr-2" />
                    Voir ma boutique publique
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Réf commande</TableHead>
                    <TableHead>Articles</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopOrders.map((o) => {
                    const itemsCount = Array.isArray(o.items) ? o.items.length : 0;
                    return (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs font-semibold">
                          #{(o.order_id || o.id).slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {itemsCount} article{itemsCount > 1 ? "s" : ""}
                        </TableCell>
                        <TableCell className="font-semibold text-[#966442]">
                          {formatFCFA(o.subtotal)}
                        </TableCell>
                        <TableCell>{statusBadge(o.statut)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(o.created_at)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
