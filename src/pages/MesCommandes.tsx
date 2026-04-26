import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  MapPin,
  Wallet,
  Store,
} from "lucide-react";

const formatPrice = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";

const formatDate = (d: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));

interface OrderItem {
  name?: string;
  quantity?: number;
  price?: number;
  [key: string]: any;
}

interface ShopOrder {
  id: string;
  order_id: string | null;
  shop_name: string;
  subtotal: number;
  statut: string;
  items: OrderItem[];
}

interface Order {
  id: string;
  total: number;
  statut: string;
  mode_paiement: string;
  created_at: string;
  items: OrderItem[];
  adresse_livraison: any;
}

const StatusBadge = ({ statut }: { statut: string }) => {
  const map: Record<
    string,
    { label: string; className: string; icon?: typeof Clock }
  > = {
    en_attente: {
      label: "En attente",
      className: "bg-muted text-muted-foreground",
      icon: Clock,
    },
    paiement_en_cours: {
      label: "Paiement en cours",
      className: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
      icon: Loader2,
    },
    dispatche: {
      label: "Dispatché",
      className: "bg-green-500/15 text-green-700 dark:text-green-400",
      icon: CheckCircle2,
    },
    annule: {
      label: "Annulé",
      className: "bg-red-500/15 text-red-700 dark:text-red-400",
      icon: XCircle,
    },
    erreur: {
      label: "Erreur",
      className: "bg-red-500/15 text-red-700 dark:text-red-400",
      icon: XCircle,
    },
  };
  const config = map[statut] || {
    label: statut,
    className: "bg-muted text-muted-foreground",
  };
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`${config.className} border-0 gap-1`}>
      {Icon && <Icon className="w-3 h-3" />}
      {config.label}
    </Badge>
  );
};

const PaymentBadge = ({ mode }: { mode: string }) => {
  if (mode === "orange_money") {
    return (
      <Badge className="bg-orange-500 hover:bg-orange-500 text-white gap-1">
        <Wallet className="w-3 h-3" />
        Orange Money
      </Badge>
    );
  }
  if (mode === "mtn_momo") {
    return (
      <Badge className="bg-yellow-500 hover:bg-yellow-500 text-black gap-1">
        <Wallet className="w-3 h-3" />
        MTN MoMo
      </Badge>
    );
  }
  return <Badge variant="outline">{mode}</Badge>;
};

const MesCommandes = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [shopOrdersByOrder, setShopOrdersByOrder] = useState<
    Record<string, ShopOrder[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select(
          "id, total, statut, mode_paiement, created_at, items, adresse_livraison"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error || !ordersData) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const typedOrders = ordersData as unknown as Order[];
      setOrders(typedOrders);

      if (typedOrders.length > 0) {
        const { data: shopOrdersData } = await supabase
          .from("shop_orders")
          .select("id, order_id, shop_name, subtotal, statut, items")
          .in(
            "order_id",
            typedOrders.map((o) => o.id)
          );

        const grouped: Record<string, ShopOrder[]> = {};
        ((shopOrdersData as unknown as ShopOrder[]) || []).forEach((so) => {
          if (!so.order_id) return;
          if (!grouped[so.order_id]) grouped[so.order_id] = [];
          grouped[so.order_id].push(so);
        });
        setShopOrdersByOrder(grouped);
      }

      setLoading(false);
    };

    if (user) load();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion?redirect=/mes-commandes" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-2xl font-bold">Mes commandes</h1>
            {!loading && (
              <Badge className="bg-primary text-primary-foreground">
                {orders.length}
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-6">
                Vous n'avez pas encore passé de commande
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link to="/">Découvrir les boutiques</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const shopOrders = shopOrdersByOrder[order.id] || [];
                const adr = order.adresse_livraison || {};
                return (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-semibold">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <StatusBadge statut={order.statut} />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="details" className="border-0">
                          <AccordionTrigger className="py-2 text-sm hover:no-underline">
                            Voir le détail
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            {/* Mode de paiement */}
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">
                                Paiement :
                              </span>
                              <PaymentBadge mode={order.mode_paiement} />
                            </div>

                            {/* Adresse */}
                            <div className="text-sm space-y-1">
                              <div className="flex items-center gap-2 font-medium">
                                <MapPin className="w-4 h-4 text-primary" />
                                Adresse de livraison
                              </div>
                              <div className="pl-6 text-muted-foreground space-y-0.5">
                                {adr.full_name && <p>{adr.full_name}</p>}
                                {adr.phone && <p>{adr.phone}</p>}
                                {(adr.city || adr.neighborhood) && (
                                  <p>
                                    {[adr.city, adr.neighborhood]
                                      .filter(Boolean)
                                      .join(" - ")}
                                  </p>
                                )}
                                {adr.address && <p>{adr.address}</p>}
                              </div>
                            </div>

                            {/* Boutiques */}
                            {shopOrders.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 font-medium text-sm">
                                  <Store className="w-4 h-4 text-primary" />
                                  Boutiques
                                </div>
                                {shopOrders.map((so) => (
                                  <div
                                    key={so.id}
                                    className="rounded-lg border border-border bg-muted/30 p-3 space-y-2"
                                  >
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-sm">
                                          {so.shop_name}
                                        </span>
                                        <StatusBadge statut={so.statut} />
                                      </div>
                                      <span className="text-sm font-semibold text-primary">
                                        {formatPrice(so.subtotal)}
                                      </span>
                                    </div>
                                    <ul className="space-y-1 text-xs text-muted-foreground">
                                      {(so.items || []).map((it, idx) => {
                                        const qty = it.quantity || 1;
                                        const price = it.price || 0;
                                        return (
                                          <li
                                            key={idx}
                                            className="flex justify-between"
                                          >
                                            <span>
                                              {it.name} × {qty}
                                            </span>
                                            <span>
                                              {formatPrice(price * qty)}
                                            </span>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MesCommandes;
