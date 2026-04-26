import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, Store } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";

const formatFCFA = (n: number) =>
  `${new Intl.NumberFormat("fr-FR").format(Math.round(n))} FCFA`;

const Panier = () => {
  const { items, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal, itemsByShop, shopCount } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mon panier</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="w-20 h-20 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-6">Votre panier est vide</p>
            <Button asChild>
              <Link to="/recherche">Découvrir des produits</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items list grouped by shop */}
            <div className="lg:col-span-2 space-y-6">
              {Object.values(itemsByShop).map((group) => (
                <div key={group.shop_id} className="space-y-3">
                  {/* Shop header */}
                  <div className="flex items-center justify-between gap-2 px-1">
                    <Badge variant="secondary" className="flex items-center gap-1.5 py-1.5 px-3">
                      <Store className="w-3.5 h-3.5" />
                      <span className="font-semibold">{group.shop_name}</span>
                    </Badge>
                    <span className="text-sm font-semibold text-primary">
                      {formatFCFA(group.subtotal)}
                    </span>
                  </div>

                  {group.items.map((item) => (
                    <Card key={item.product_id} className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded overflow-hidden bg-muted shrink-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <ShoppingBag className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold truncate">{item.name}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {item.shop_name}
                              </p>
                              <p className="text-sm mt-1">{formatFCFA(item.price)}</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product_id)}
                              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                              aria-label="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                            <div className="flex items-center border rounded-md">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(item.product_id, item.quantity - 1)
                                }
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(item.product_id, item.quantity + 1)
                                }
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="font-semibold">
                              {formatFCFA(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Résumé</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Articles</span>
                      <span className="text-xs text-muted-foreground">
                        {shopCount} boutique{shopCount > 1 ? "s" : ""}
                      </span>
                    </div>
                    <span>{cartCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{formatFCFA(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frais de livraison</span>
                    <span className="text-xs">À confirmer avec le vendeur</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-primary">
                      {formatFCFA(cartTotal)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Button asChild className="w-full" size="lg">
                    <Link to="/checkout">Passer la commande</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearCart}
                  >
                    Vider le panier
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Panier;
