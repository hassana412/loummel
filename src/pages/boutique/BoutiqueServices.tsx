import { useParams } from "react-router-dom";
import { Briefcase, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Demo services data
const demoServices = [
  { 
    id: "1", 
    name: "Création de bijoux personnalisés", 
    description: "Conception et réalisation de bijoux uniques sur mesure selon vos envies. Choix des matériaux, design personnalisé et finitions de qualité.",
    price: 30000, 
    duration: "2-3 semaines",
    image: "/placeholder.svg" 
  },
  { 
    id: "2", 
    name: "Réparation de poterie", 
    description: "Restauration professionnelle de vos pièces en céramique et poterie. Réparation des fissures, recollage et finition.",
    price: 15000, 
    duration: "3-5 jours",
    image: "/placeholder.svg" 
  },
  { 
    id: "3", 
    name: "Formation en artisanat", 
    description: "Apprenez les techniques traditionnelles de l'artisanat du Nord Cameroun. Cours individuels ou en groupe.",
    price: 25000, 
    duration: "1 journée",
    image: "/placeholder.svg" 
  },
  { 
    id: "4", 
    name: "Gravure sur cuir", 
    description: "Personnalisation de vos articles en cuir avec gravure de motifs, initiales ou dessins sur mesure.",
    price: 10000, 
    duration: "24-48h",
    image: "/placeholder.svg" 
  },
  { 
    id: "5", 
    name: "Conseil en décoration", 
    description: "Consultation pour intégrer des pièces artisanales dans votre intérieur. Recommandations personnalisées.",
    price: 20000, 
    duration: "2 heures",
    image: "/placeholder.svg" 
  },
];

const BoutiqueServices = () => {
  const { slug } = useParams();
  const shopWhatsapp = "237600000000"; // Demo
  const shopName = "Artisanat du Sahel"; // Demo

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const handleWhatsAppBooking = (serviceName: string) => {
    const message = encodeURIComponent(
      `Bonjour ${shopName}! Je souhaite réserver le service "${serviceName}" vu sur Loummel. Pouvez-vous me donner plus d'informations sur la disponibilité?`
    );
    window.open(`https://wa.me/${shopWhatsapp}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          Nos Services
        </h2>
        <p className="text-muted-foreground">{demoServices.length} services proposés</p>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {demoServices.map((service) => (
          <Card key={service.id} className="overflow-hidden hover:shadow-sahel-card transition-all">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-48 h-48 md:h-auto shrink-0">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-display font-semibold text-lg text-foreground">
                          {service.name}
                        </h3>
                        <Badge variant="outline" className="shrink-0">
                          <Clock className="w-3 h-3 mr-1" />
                          {service.duration}
                        </Badge>
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

      {demoServices.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun service disponible pour le moment</p>
        </div>
      )}
    </div>
  );
};

export default BoutiqueServices;
