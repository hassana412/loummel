import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  User, Store, Package, Briefcase, Phone, CreditCard, 
  ArrowRight, ArrowLeft, Check, Plus, Trash2, Crown,
  Facebook, Instagram, Youtube
} from "lucide-react";
import { getAllRegionNames } from "@/data/cameroon-regions";

const steps = [
  { id: 1, title: "Informations", icon: User },
  { id: 2, title: "Boutique", icon: Store },
  { id: 3, title: "Produits", icon: Package },
  { id: 4, title: "Services", icon: Briefcase },
  { id: 5, title: "Contact", icon: Phone },
  { id: 6, title: "Abonnement", icon: CreditCard },
];

const categories = [
  "Artisanat", "Électronique", "Téléphones", "Meubles", 
  "Restaurant", "Textiles", "Bijoux", "Cuir", "Poterie", "Autre"
];

const InscriptionVendeur = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const regions = getAllRegionNames();

  // Form state
  const [formData, setFormData] = useState({
    ownerName: "",
    email: "",
    phone: "",
    region: "",
    city: "",
    shopName: "",
    shopCategory: "",
    shopDescription: "",
    products: [{ name: "", description: "", price: "", category: "" }],
    services: [{ name: "", description: "", price: "", duration: "" }],
    contactPhone: "",
    contactWhatsapp: "",
    contactEmail: "",
    contactAddress: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    subscriptionType: "base" as 'base' | 'vip',
    addSEO: false,
    addWhatsapp: false,
    addSocial: false,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addProduct = () => {
    if (formData.products.length < 12) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, { name: "", description: "", price: "", category: "" }]
      }));
    }
  };

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const updateProduct = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((p, i) => i === index ? { ...p, [field]: value } : p)
    }));
  };

  const addService = () => {
    if (formData.services.length < 5) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, { name: "", description: "", price: "", duration: "" }]
      }));
    }
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const updateService = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };

  const calculateTotal = () => {
    if (formData.subscriptionType === 'vip') return 15000;
    let total = 5000;
    if (formData.addSEO) total += 3000;
    if (formData.addWhatsapp) total += 2000;
    if (formData.addSocial) total += 3000;
    return total;
  };

  const handleSubmit = () => {
    toast({
      title: "Inscription réussie !",
      description: "Votre boutique sera créée après validation du paiement.",
    });
    navigate("/");
  };

  const nextStep = () => {
    if (currentStep < 6) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Créer ma Boutique
            </h1>
            <p className="text-muted-foreground">
              Rejoignez Loummel et vendez vos produits en ligne
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs mt-1 ${isActive ? "font-medium text-primary" : "text-muted-foreground"}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 md:w-16 h-0.5 mx-2 ${isCompleted ? "bg-green-500" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <Card className="shadow-sahel-card">
            <CardHeader>
              <CardTitle className="font-display">
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription>
                Étape {currentStep} sur 6
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Nom complet *</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) => updateFormData("ownerName", e.target.value)}
                      placeholder="Votre nom et prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Région *</Label>
                    <Select value={formData.region} onValueChange={(v) => updateFormData("region", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une région" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="city">Ville *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateFormData("city", e.target.value)}
                      placeholder="Votre ville"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Shop Info */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shopName">Nom de la boutique *</Label>
                    <Input
                      id="shopName"
                      value={formData.shopName}
                      onChange={(e) => updateFormData("shopName", e.target.value)}
                      placeholder="Ex: Artisanat du Sahel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shopCategory">Catégorie principale *</Label>
                    <Select value={formData.shopCategory} onValueChange={(v) => updateFormData("shopCategory", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shopDescription">Description de votre activité *</Label>
                    <Textarea
                      id="shopDescription"
                      value={formData.shopDescription}
                      onChange={(e) => updateFormData("shopDescription", e.target.value)}
                      placeholder="Décrivez votre boutique et vos produits..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Products */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Ajoutez jusqu'à 12 produits
                    </p>
                    <Badge variant="outline">{formData.products.length}/12</Badge>
                  </div>
                  
                  {formData.products.map((product, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">Produit {index + 1}</span>
                        {formData.products.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => removeProduct(index)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          placeholder="Nom du produit"
                          value={product.name}
                          onChange={(e) => updateProduct(index, "name", e.target.value)}
                        />
                        <Input
                          placeholder="Prix (FCFA)"
                          type="number"
                          value={product.price}
                          onChange={(e) => updateProduct(index, "price", e.target.value)}
                        />
                        <Input
                          placeholder="Description courte"
                          className="md:col-span-2"
                          value={product.description}
                          onChange={(e) => updateProduct(index, "description", e.target.value)}
                        />
                      </div>
                    </Card>
                  ))}
                  
                  {formData.products.length < 12 && (
                    <Button variant="outline" onClick={addProduct} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un produit
                    </Button>
                  )}
                </div>
              )}

              {/* Step 4: Services */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Ajoutez jusqu'à 5 services
                    </p>
                    <Badge variant="outline">{formData.services.length}/5</Badge>
                  </div>
                  
                  {formData.services.map((service, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">Service {index + 1}</span>
                        {formData.services.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => removeService(index)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          placeholder="Nom du service"
                          value={service.name}
                          onChange={(e) => updateService(index, "name", e.target.value)}
                        />
                        <Input
                          placeholder="Prix (FCFA)"
                          type="number"
                          value={service.price}
                          onChange={(e) => updateService(index, "price", e.target.value)}
                        />
                        <Input
                          placeholder="Durée (ex: 2 heures)"
                          value={service.duration}
                          onChange={(e) => updateService(index, "duration", e.target.value)}
                        />
                        <Input
                          placeholder="Description"
                          value={service.description}
                          onChange={(e) => updateService(index, "description", e.target.value)}
                        />
                      </div>
                    </Card>
                  ))}
                  
                  {formData.services.length < 5 && (
                    <Button variant="outline" onClick={addService} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un service
                    </Button>
                  )}
                </div>
              )}

              {/* Step 5: Contact */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">📱 Téléphone mobile *</Label>
                      <Input
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={(e) => updateFormData("contactPhone", e.target.value)}
                        placeholder="+237 6XX XXX XXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactWhatsapp">💬 WhatsApp *</Label>
                      <Input
                        id="contactWhatsapp"
                        value={formData.contactWhatsapp}
                        onChange={(e) => updateFormData("contactWhatsapp", e.target.value)}
                        placeholder="+237 6XX XXX XXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">📧 Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => updateFormData("contactEmail", e.target.value)}
                        placeholder="boutique@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactAddress">📍 Adresse physique</Label>
                      <Input
                        id="contactAddress"
                        value={formData.contactAddress}
                        onChange={(e) => updateFormData("contactAddress", e.target.value)}
                        placeholder="Quartier, Ville"
                      />
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Réseaux sociaux (optionnel)</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                        </Label>
                        <Input
                          value={formData.facebook}
                          onChange={(e) => updateFormData("facebook", e.target.value)}
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Instagram className="w-4 h-4 text-pink-600" /> Instagram
                        </Label>
                        <Input
                          value={formData.instagram}
                          onChange={(e) => updateFormData("instagram", e.target.value)}
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>🎵 TikTok</Label>
                        <Input
                          value={formData.tiktok}
                          onChange={(e) => updateFormData("tiktok", e.target.value)}
                          placeholder="https://tiktok.com/@..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Youtube className="w-4 h-4 text-red-600" /> YouTube
                        </Label>
                        <Input
                          value={formData.youtube}
                          onChange={(e) => updateFormData("youtube", e.target.value)}
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Subscription */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  {/* VIP Pack */}
                  <Card 
                    className={`cursor-pointer border-2 transition-all ${
                      formData.subscriptionType === 'vip' 
                        ? 'border-amber-400 bg-amber-50' 
                        : 'border-border hover:border-amber-200'
                    }`}
                    onClick={() => updateFormData("subscriptionType", "vip")}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display font-bold text-lg">Pack VIP</h3>
                            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0">
                              Recommandé
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Boutique + SEO + Réseaux Sociaux + Vitrine VIP
                          </p>
                          <p className="text-2xl font-bold text-primary">15 000 FCFA/an</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          formData.subscriptionType === 'vip' ? 'border-amber-500 bg-amber-500' : 'border-muted'
                        }`}>
                          {formData.subscriptionType === 'vip' && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Base Pack */}
                  <Card 
                    className={`cursor-pointer border-2 transition-all ${
                      formData.subscriptionType === 'base' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => updateFormData("subscriptionType", "base")}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Store className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display font-bold text-lg mb-1">Pack Base</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Boutique en ligne avec 12 produits et 5 services
                          </p>
                          <p className="text-2xl font-bold text-primary">5 000 FCFA/an</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          formData.subscriptionType === 'base' ? 'border-primary bg-primary' : 'border-muted'
                        }`}>
                          {formData.subscriptionType === 'base' && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </div>

                      {/* Add-ons */}
                      {formData.subscriptionType === 'base' && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <p className="text-sm font-medium">Options supplémentaires :</p>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="addSEO"
                              checked={formData.addSEO}
                              onCheckedChange={(v) => updateFormData("addSEO", v)}
                            />
                            <Label htmlFor="addSEO" className="flex-1 cursor-pointer">
                              SEO / Référencement (+3 000 FCFA/an)
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="addWhatsapp"
                              checked={formData.addWhatsapp}
                              onCheckedChange={(v) => updateFormData("addWhatsapp", v)}
                            />
                            <Label htmlFor="addWhatsapp" className="flex-1 cursor-pointer">
                              WhatsApp Business (+2 000 FCFA/an)
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="addSocial"
                              checked={formData.addSocial}
                              onCheckedChange={(v) => updateFormData("addSocial", v)}
                            />
                            <Label htmlFor="addSocial" className="flex-1 cursor-pointer">
                              Publicité Réseaux Sociaux (+3 000 FCFA/an)
                            </Label>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Total */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total à payer :</span>
                      <span className="text-2xl font-bold text-primary">
                        {new Intl.NumberFormat('fr-FR').format(calculateTotal())} FCFA/an
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Précédent
                </Button>
                
                {currentStep < 6 ? (
                  <Button onClick={nextStep}>
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button variant="hero" onClick={handleSubmit}>
                    <Check className="w-4 h-4 mr-2" />
                    Créer ma boutique
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InscriptionVendeur;
