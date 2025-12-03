import { useState } from "react";
import { useParams } from "react-router-dom";
import { ShoppingBag, Filter, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Demo products data
const demoProducts = [
  { id: "1", name: "Collier en perles Fulani", description: "Bijou artisanal authentique fait main", price: 25000, category: "Bijoux", image: "/placeholder.svg" },
  { id: "2", name: "Bracelet en cuivre", description: "Bracelet traditionnel gravé", price: 15000, category: "Bijoux", image: "/placeholder.svg" },
  { id: "3", name: "Poterie décorative", description: "Vase peint à la main", price: 18000, category: "Poterie", image: "/placeholder.svg" },
  { id: "4", name: "Sac en cuir tressé", description: "Cuir de qualité supérieure", price: 35000, category: "Cuir", image: "/placeholder.svg" },
  { id: "5", name: "Tapis tissé", description: "Grand tapis en laine naturelle", price: 75000, category: "Textiles", image: "/placeholder.svg" },
  { id: "6", name: "Sculpture en bois", description: "Figurine sculptée à la main", price: 45000, category: "Artisanat", image: "/placeholder.svg" },
  { id: "7", name: "Boucles d'oreilles", description: "Perles et métal forgé", price: 12000, category: "Bijoux", image: "/placeholder.svg" },
  { id: "8", name: "Panier décoratif", description: "Osier tressé naturel", price: 8000, category: "Artisanat", image: "/placeholder.svg" },
  { id: "9", name: "Ceinture en cuir", description: "Cuir tanné végétal", price: 22000, category: "Cuir", image: "/placeholder.svg" },
  { id: "10", name: "Boubou brodé", description: "Tissu traditionnel brodé", price: 55000, category: "Textiles", image: "/placeholder.svg" },
  { id: "11", name: "Jarre traditionnelle", description: "Terre cuite décorée", price: 28000, category: "Poterie", image: "/placeholder.svg" },
  { id: "12", name: "Sandales artisanales", description: "Cuir et perles", price: 20000, category: "Cuir", image: "/placeholder.svg" },
];

const categories = ["Tous", "Bijoux", "Poterie", "Cuir", "Textiles", "Artisanat"];

const BoutiqueProduits = () => {
  const { slug } = useParams();
  const [filter, setFilter] = useState("Tous");
  const [sortBy, setSortBy] = useState("default");
  
  const shopWhatsapp = "237600000000"; // Demo
  const shopName = "Artisanat du Sahel"; // Demo

  const filteredProducts = demoProducts
    .filter(p => filter === "Tous" || p.category === filter)
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const handleWhatsAppOrder = (productName: string) => {
    const message = encodeURIComponent(
      `Bonjour ${shopName}! Je suis intéressé(e) par "${productName}" vu sur Loummel. Pouvez-vous me donner plus d'informations?`
    );
    window.open(`https://wa.me/${shopWhatsapp}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Nos Produits
          </h2>
          <p className="text-muted-foreground">{filteredProducts.length} produits disponibles</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Par défaut</SelectItem>
              <SelectItem value="price-asc">Prix croissant</SelectItem>
              <SelectItem value="price-desc">Prix décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-card rounded-xl overflow-hidden shadow-sahel hover:shadow-sahel-card transition-all duration-300 hover:-translate-y-1"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <Badge className="absolute top-3 left-3 bg-background/90">
                {product.category}
              </Badge>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleWhatsAppOrder(product.name)}
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Commander
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun produit trouvé dans cette catégorie</p>
        </div>
      )}
    </div>
  );
};

export default BoutiqueProduits;
