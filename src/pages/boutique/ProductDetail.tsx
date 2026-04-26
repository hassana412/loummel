import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
import { ShoppingCart, PackageX, AlertCircle, Store, ChevronLeft } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  promo_price: number | null;
  is_promo: boolean | null;
  image_url: string | null;
  category: string | null;
  shop_id: string;
  // Champs optionnels (si présents en BD via extension future)
  images?: string[] | null;
  stock?: number | null;
  variantes?: { name: string; options: string[] }[] | null;
}

interface ShopMini {
  id: string;
  name: string;
  slug: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-FR").format(price) + " FCFA";

const ProductDetail = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [shop, setShop] = useState<ShopMini | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !slug) return;
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        // 1. Boutique
        const { data: shopData, error: shopErr } = await supabase
          .from("shops")
          .select("id, name, slug")
          .eq("slug", slug)
          .eq("status", "active")
          .maybeSingle();

        if (shopErr) throw shopErr;
        if (!shopData) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setShop(shopData);

        // 2. Produit
        const { data: prodData, error: prodErr } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .eq("shop_id", shopData.id)
          .maybeSingle();

        if (prodErr) throw prodErr;
        if (!prodData) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setProduct(prodData as Product);

        // 3. Autres produits de la boutique
        const { data: relatedData } = await supabase
          .from("products")
          .select("*")
          .eq("shop_id", shopData.id)
          .neq("id", id)
          .limit(4);

        setRelated((relatedData as Product[]) || []);
      } catch (err) {
        console.error("[ProductDetail] Erreur:", err);
        setError("Impossible de charger le produit. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Reset
    setActiveImage(0);
    setSelectedVariants({});
  }, [id, slug]);

  // ----- États : Loading -----
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8">
          <Skeleton className="h-5 w-80 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Skeleton className="aspect-square w-full rounded-xl" />
              <div className="flex gap-2 mt-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ----- États : Erreur Supabase -----
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center container py-16">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Une erreur est survenue</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ----- États : 404 -----
  if (notFound || !product || !shop) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center container py-16">
          <div className="text-center max-w-md">
            <PackageX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Produit introuvable</h1>
            <p className="text-muted-foreground mb-6">
              Ce produit n'existe pas ou n'est plus disponible.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Retour
              </Button>
              <Button asChild>
                <Link to="/">Accueil</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ----- Données dérivées -----
  const gallery: string[] = (() => {
    if (product.images && product.images.length > 0) return product.images;
    if (product.image_url) return [product.image_url];
    return ["/placeholder.svg"];
  })();

  const hasPromo = product.is_promo && product.promo_price;
  const displayPrice = hasPromo ? product.promo_price! : product.price;
  const stock = product.stock ?? null;
  const variantes = product.variantes || [];

  const handleAddToCart = () => {
    // Validation variantes
    for (const v of variantes) {
      if (!selectedVariants[v.name]) {
        toast.error(`Veuillez sélectionner : ${v.name}`);
        return;
      }
    }
    toast.success("Ajouté au panier", {
      description: product.name,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container py-6 md:py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Accueil</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/boutique/${shop.slug}`}>{shop.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Galerie */}
          <div>
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-muted shadow-sm border">
              <img
                src={gallery[activeImage] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === idx
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary/50"
                    }`}
                    aria-label={`Image ${idx + 1}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="space-y-5">
            {product.category && (
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
            )}

            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {product.name}
            </h1>

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

            {/* Stock */}
            {stock !== null && (
              <div className="text-sm">
                {stock > 0 ? (
                  <span className="text-green-600 font-medium">
                    ✓ En stock ({stock} disponible{stock > 1 ? "s" : ""})
                  </span>
                ) : (
                  <span className="text-destructive font-medium">Rupture de stock</span>
                )}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="font-semibold text-foreground mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Variantes */}
            {variantes.length > 0 && (
              <div className="space-y-4">
                {variantes.map((variant) => (
                  <div key={variant.name}>
                    <h3 className="font-semibold text-sm mb-2 text-foreground">
                      {variant.name}
                      {selectedVariants[variant.name] && (
                        <span className="ml-2 text-muted-foreground font-normal">
                          : {selectedVariants[variant.name]}
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((opt) => {
                        const isSelected = selectedVariants[variant.name] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() =>
                              setSelectedVariants((prev) => ({
                                ...prev,
                                [variant.name]: opt,
                              }))
                            }
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background hover:border-primary/50"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <Button
              size="lg"
              className="w-full md:w-auto"
              onClick={handleAddToCart}
              disabled={stock !== null && stock <= 0}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Ajouter au panier
            </Button>
          </div>
        </div>

        {/* Produits liés */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Autres produits de cette boutique
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => {
                const promo = p.is_promo && p.promo_price;
                const price = promo ? p.promo_price! : p.price;
                return (
                  <Link
                    key={p.id}
                    to={`/boutique/${shop.slug}/produit/${p.id}`}
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
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
