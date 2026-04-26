import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShoppingCart, ShoppingBag, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useShop } from "./BoutiqueLayout";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  is_promo: boolean | null;
  promo_price: number | null;
  shop_id: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-FR").format(price) + " FCFA";

const ProductDetail = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const { shop } = useShop();
  const { addToCart, setIsOpen: setCartOpen } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !shop) return;
      setLoading(true);

      // Produit
      const { data: prodData, error: prodErr } = await supabase
        .from("products")
        .select("id, name, description, price, category, image_url, is_promo, promo_price, shop_id")
        .eq("id", id)
        .eq("shop_id", shop.id)
        .maybeSingle();

      if (prodErr) {
        console.error("[ProductDetail] Erreur produit:", prodErr);
      }
      setProduct((prodData as Product) || null);

      // Autres produits
      if (prodData) {
        const { data: relatedData } = await supabase
          .from("products")
          .select("id, name, description, price, category, image_url, is_promo, promo_price, shop_id")
          .eq("shop_id", shop.id)
          .neq("id", id)
          .limit(4);

        setRelated((relatedData as Product[]) || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [id, shop]);

  // Skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-80" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-11 flex-1" />
              <Skeleton className="h-11 flex-1" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Introuvable
  if (!product || !shop) {
    return (
      <div className="text-center py-16">
        <PackageX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Produit introuvable</h1>
        <p className="text-muted-foreground mb-6">
          Ce produit n'existe pas ou n'est plus disponible.
        </p>
        <Button asChild variant="outline">
          <Link to={`/boutique/${slug}`}>Retour à la boutique</Link>
        </Button>
      </div>
    );
  }

  const hasPromo = product.is_promo && product.promo_price;
  const displayPrice = hasPromo ? product.promo_price! : product.price;

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      name: product.name,
      price: displayPrice,
      image_url: product.image_url,
      quantity: 1,
      shop_id: shop.id,
      shop_name: shop.name,
    });
    toast.success("Ajouté au panier ✓", { description: product.name });
    setCartOpen(true);
  };

  const handleOrderNow = () => {
    addToCart({
      product_id: product.id,
      name: product.name,
      price: displayPrice,
      image_url: product.image_url,
      quantity: 1,
      shop_id: shop.id,
      shop_name: shop.name,
    });
    toast.success("Ajouté au panier ✓", { description: "Direction le panier..." });
    navigate("/panier");
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Accueil</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/boutique/${slug}`}>{shop.name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1">{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Layout principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="h-80 w-full object-cover rounded-xl border bg-muted"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>

        {/* Infos */}
        <div className="space-y-5">
          {product.category && (
            <Badge variant="outline">{product.category}</Badge>
          )}

          <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>

          {/* Prix */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(displayPrice)}
            </span>
            {hasPromo && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="font-semibold text-foreground mb-2">Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Ajouter au panier
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={handleOrderNow}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Commander maintenant
            </Button>
          </div>
        </div>
      </div>

      {/* Produits liés */}
      {related.length > 0 && (
        <section className="pt-6 border-t">
          <h2 className="font-display text-xl font-bold mb-6">
            Autres produits de cette boutique
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => {
              const promo = p.is_promo && p.promo_price;
              const price = promo ? p.promo_price! : p.price;
              return (
                <Link
                  key={p.id}
                  to={`/boutique/${slug}/produit/${p.id}`}
                  className="group bg-card rounded-xl overflow-hidden border hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={p.image_url || "/placeholder.svg"}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-1 min-h-[2.5rem]">
                      {p.name}
                    </h3>
                    <p className="font-bold text-primary text-sm">{formatPrice(price)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
