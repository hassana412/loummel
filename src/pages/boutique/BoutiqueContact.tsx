import { useParams } from "react-router-dom";
import { Phone, MessageCircle, Mail, MapPin, Send, Facebook, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

// Demo contact data
const demoContact = {
  phone: "+237 677 123 456",
  whatsapp: "237677123456",
  email: "contact@artisanatsahel.cm",
  address: "Quartier Marouaré, Maroua, Extrême-Nord, Cameroun",
  facebook: "https://facebook.com/artisanatsahel",
  instagram: "https://instagram.com/artisanatsahel",
  tiktok: "https://tiktok.com/@artisanatsahel",
  youtube: "https://youtube.com/@artisanatsahel",
};

const BoutiqueContact = () => {
  const { slug } = useParams();
  const shopName = "Artisanat du Sahel"; // Demo
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message envoyé !",
      description: "Le vendeur vous répondra dans les plus brefs délais.",
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Bonjour ${shopName}! Je vous contacte depuis Loummel. J'aimerais avoir plus d'informations sur vos produits et services.`
    );
    window.open(`https://wa.me/${demoContact.whatsapp}?text=${message}`, '_blank');
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Contact Info */}
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Contactez-nous
          </h2>
          <p className="text-muted-foreground">
            N'hésitez pas à nous contacter pour toute question ou demande de renseignements
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Phone */}
          <Card className="hover:shadow-sahel transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <a href={`tel:${demoContact.phone}`} className="font-semibold hover:text-primary">
                    {demoContact.phone}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp */}
          <Card 
            className="hover:shadow-sahel transition-shadow cursor-pointer bg-green-50 border-green-200"
            onClick={handleWhatsAppContact}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-600 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-700">WhatsApp</p>
                  <span className="font-semibold text-green-800">
                    Discuter maintenant
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email */}
          <Card className="hover:shadow-sahel transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${demoContact.email}`} className="font-semibold hover:text-primary text-sm">
                    {demoContact.email}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="hover:shadow-sahel transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-semibold text-sm">
                    {demoContact.address}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Suivez-nous sur les réseaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {demoContact.facebook && (
                <a
                  href={demoContact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                </a>
              )}
              {demoContact.instagram && (
                <a
                  href={demoContact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Instagram className="w-5 h-5" />
                  Instagram
                </a>
              )}
              {demoContact.tiktok && (
                <a
                  href={demoContact.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                  TikTok
                </a>
              )}
              {demoContact.youtube && (
                <a
                  href={demoContact.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                  YouTube
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Form */}
      <Card className="shadow-sahel-card">
        <CardHeader>
          <CardTitle className="font-display">Envoyez-nous un message</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Votre nom"
                required
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+237 6XX XXX XXX"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Votre message..."
                rows={5}
                required
              />
            </div>

            <Button type="submit" className="w-full" variant="hero">
              <Send className="w-4 h-4 mr-2" />
              Envoyer le message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BoutiqueContact;
