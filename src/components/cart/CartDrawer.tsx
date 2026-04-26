import { Link } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-FR").format(price) + " FCFA";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Mon panier
            {cartCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({cartCount} article{cartCount > 1 ? "s" : ""})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingCart className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-1">
              Votre panier est vide
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Découvrez nos boutiques pour ajouter des produits
            </p>
            <Button asChild onClick={() => setIsOpen(false)}>
              <Link to="/recherche">Explorer les boutiques</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={item.product_id}
                    className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-0.5">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                        {item.shop_name}
                      </p>
                      <p className="text-sm font-bold text-primary mb-2">
                        {formatPrice(item.price)}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(item.product_id, item.quantity - 1)
                            }
                            className="px-2 py-1 hover:bg-muted transition-colors"
                            aria-label="Diminuer la quantité"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product_id, item.quantity + 1)
                            }
                            className="px-2 py-1 hover:bg-muted transition-colors"
                            aria-label="Augmenter la quantité"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Supprimer l'article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="px-6 py-4 border-t bg-muted/30 flex-col sm:flex-col gap-3">
              <div className="flex items-center justify-between w-full">
                <span className="text-base font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button
                  variant="outline"
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link to="/panier">Voir mon panier</Link>
                </Button>
                <Button
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link to="/checkout">Commander</Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
