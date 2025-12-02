import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import potteryImg from "@/assets/artisan-pottery.jpg";
import textilesImg from "@/assets/artisan-textiles.jpg";
import leatherImg from "@/assets/artisan-leather.jpg";
import phonesImg from "@/assets/electronics-phones.jpg";
import furnitureImg from "@/assets/furniture.jpg";
import restaurantImg from "@/assets/restaurant.jpg";
import jewelryImg from "@/assets/artisan-jewelry.jpg";

const categories = [
  {
    id: 1,
    name: "Poterie Artisanale",
    description: "Céramiques traditionnelles",
    image: potteryImg,
    count: 120,
  },
  {
    id: 2,
    name: "Textiles & Tissages",
    description: "Pagnes et tissus traditionnels",
    image: textilesImg,
    count: 85,
  },
  {
    id: 3,
    name: "Maroquinerie",
    description: "Sacs, chaussures en cuir",
    image: leatherImg,
    count: 150,
  },
  {
    id: 4,
    name: "Téléphones & Tech",
    description: "Smartphones et accessoires",
    image: phonesImg,
    count: 200,
  },
  {
    id: 5,
    name: "Meubles Artisanaux",
    description: "Mobilier en bois sculpté",
    image: furnitureImg,
    count: 65,
  },
  {
    id: 6,
    name: "Restaurants",
    description: "Cuisine du Nord Cameroun",
    image: restaurantImg,
    count: 45,
  },
  {
    id: 7,
    name: "Bijoux & Accessoires",
    description: "Parures traditionnelles",
    image: jewelryImg,
    count: 180,
  },
];

const CategoriesSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Explorez
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
              Nos Catégories
            </h2>
          </div>
          <Button variant="ghost" className="hidden md:flex">
            Voir tout
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-xl bg-card shadow-sahel hover:shadow-sahel-card transition-all duration-300 cursor-pointer animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-sahel-earth/90 via-sahel-earth/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-display font-semibold text-primary-foreground text-lg">
                  {category.name}
                </h3>
                <p className="text-primary-foreground/70 text-sm">
                  {category.description}
                </p>
                <span className="inline-block mt-2 text-xs text-accent font-medium">
                  {category.count} articles
                </span>
              </div>
            </div>
          ))}

          {/* CTA Card */}
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-sahel-ochre shadow-sahel hover:shadow-sahel-glow transition-all duration-300 cursor-pointer flex items-center justify-center animate-fade-up"
            style={{ animationDelay: "0.7s" }}
          >
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-foreground/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowRight className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-primary-foreground text-lg mb-2">
                Toutes les Catégories
              </h3>
              <p className="text-primary-foreground/80 text-sm">
                Découvrez plus de produits
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
