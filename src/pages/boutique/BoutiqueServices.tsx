import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Clock, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useShop } from "./BoutiqueLayout";

// Demo services for "artisanat-rhumsiki"
const demoServices = [
  { 
    id: "1", 
    name: "Création bijoux sur mesure", 
    description: "Conception et réalisation de bijoux personnalisés selon vos envies. Choix des matériaux (perles, cuivre, argent), design unique et finitions de qualité artisanale. Consultation préalable incluse.",
    price: 50000, 
    duration: "2-3 semaines",
  },
  { 
    id: "2", 
    name: "Visite atelier artisanal", 
    description: "Découverte immersive de notre atelier au cœur de Rhumsiki. Rencontrez nos artisans, observez les techniques traditionnelles de fabrication et admirez les montagnes. Thé traditionnel offert.",
    price: 15000, 
    duration: "2 heures",
  },
  { 
    id: "3", 
    name: "Formation tissage traditionnel", 
    description: "Apprenez les bases du tissage Fulani avec un maître tisserand. Initiation complète aux techniques, aux motifs traditionnels et à la teinture naturelle. Certificat de participation remis.",
    price: 35000, 
    duration: "1 journée",
  },
  { 
    id: "4", 
    name: "Gravure personnalisée", 
    description: "Service de gravure sur cuir, métal ou bois. Initiales, motifs traditionnels ou dessins personnalisés sur vos articles achetés ou apportés. Travail artisanal minutieux.",
    price: 12000, 
    duration: "24-48h",
  },
];

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: string | null;
}

const BoutiqueServices = () => {
  const { slug } = useParams();
  const { shop } = useShop();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      if (!shop) return;

      // Demo shop fallback
      if (shop.id === "demo-artisanat-rhumsiki" || slug === "artisanat-rhumsiki") {
        // Try DB first
        const { data } = await supabase
          .from("services")
          .select("*")
          .eq("shop_id", shop.id)
          .order("sort_order");

        if (data && data.length > 0) {
          setServices(data);
        } else {
          setServices(demoServices);
        }
        setLoading(false);
        return;
      }

      // Load from Supabase
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("shop_id", shop.id)
        .order("sort_order");

      if (data) {
        setServices(data);
      }
      setLoading(false);
    };

    fetchServices();
  }, [shop, slug]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const handleWhatsAppBooking = (serviceName: string) => {
    const whatsapp = shop?.contact_whatsapp || "237677888999";
    const shopName = shop?.name || "la boutique";
    const message = encodeURIComponent(
      `Bonjour ${shopName}! Je souhaite réserver le service "${serviceName}" vu sur Loummel. Pouvez-vous me donner plus d'informations sur la disponibilité?`
    );
    window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          Nos Services
        </h2>
        <p className="text-muted-foreground">{services.length} services proposés</p>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {services.map((service) => (
          <Card key={service.id} className="overflow-hidden hover:shadow-sahel-card transition-all">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-display font-semibold text-lg text-foreground">
                          {service.name}
                        </h3>
                        {service.duration && (
                          <Badge variant="outline" className="shrink-0">
                            <Clock className="w-3 h-3 mr-1" />
                            {service.duration}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">À partir de</p>
                        <p className="text-xl font-bold text-primary">
                          {formatPrice(service.price)}
                        </p>
                      </div>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleWhatsAppBooking(service.name)}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Réserver via WhatsApp
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun service disponible pour le moment</p>
        </div>
      )}
    </div>
  );
};

export default BoutiqueServices;