import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Store, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORIES = [
  { value: "artisanat", label: "Artisanat" },
  { value: "electronique", label: "Électronique" },
  { value: "telephones", label: "Téléphones" },
  { value: "meubles", label: "Meubles" },
  { value: "restaurant", label: "Restaurant" },
  { value: "textiles", label: "Textiles" },
  { value: "bijoux", label: "Bijoux" },
  { value: "cuir", label: "Cuir" },
  { value: "poterie", label: "Poterie" },
  { value: "autre", label: "Autre" },
];

// Generate a URL-friendly slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "") // Trim hyphens from ends
    .substring(0, 50); // Limit length
};

// Generate unique slug with suffix if needed
const generateUniqueSlug = async (baseName: string): Promise<string> => {
  const baseSlug = generateSlug(baseName);
  const timestamp = Date.now().toString(36);
  return `${baseSlug}-${timestamp}`;
};

// Get detailed error message based on Postgres error codes
const getDetailedErrorMessage = (error: any): string => {
  const code = error?.code;
  const message = error?.message || "";

  switch (code) {
    case "23505":
      if (message.includes("slug")) {
        return "Ce nom de boutique existe déjà. Essayez un nom différent.";
      }
      return "Vous avez déjà une boutique. Accédez à votre dashboard.";
    case "42501":
      return "Erreur de permission. Veuillez vous reconnecter et réessayer.";
    case "23503":
      return "Erreur de référence dans la base de données. Contactez le support.";
    case "23502":
      return "Un champ obligatoire est manquant. Vérifiez le formulaire.";
    default:
      if (message.includes("row-level security")) {
        return "Erreur de permission. Veuillez vous reconnecter.";
      }
      return `Erreur: ${message || "Une erreur inattendue s'est produite. Contactez le support."}`;
  }
};

const CreerMaBoutique = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    shopName: "",
    category: "",
    city: "",
    whatsapp: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingExistingShop, setCheckingExistingShop] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour créer une boutique.",
        variant: "destructive",
      });
      navigate("/auth/vendeur?redirect=/creer-ma-boutique");
    }
  }, [user, authLoading, navigate]);

  // Check if user already has a shop
  useEffect(() => {
    const checkExistingShop = async () => {
      if (!user) return;

      try {
        const { data: existingShop } = await supabase
          .from("shops")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (existingShop) {
          toast({
            title: "Boutique existante",
            description: "Vous avez déjà une boutique. Redirection vers votre dashboard...",
          });
          navigate("/dashboard/boutique");
          return;
        }
      } catch (error) {
        console.error("Error checking existing shop:", error);
      } finally {
        setCheckingExistingShop(false);
      }
    };

    if (user) {
      checkExistingShop();
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer une boutique.",
        variant: "destructive",
      });
      return;
    }

    // Validate form
    if (!formData.shopName.trim()) {
      toast({
        title: "Champ manquant",
        description: "Le nom de la boutique est obligatoire.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Champ manquant",
        description: "Veuillez sélectionner un secteur d'activité.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.city.trim()) {
      toast({
        title: "Champ manquant",
        description: "La ville est obligatoire.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.whatsapp.trim()) {
      toast({
        title: "Champ manquant",
        description: "Le numéro WhatsApp est obligatoire.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate unique slug
      const slug = await generateUniqueSlug(formData.shopName);

      console.log("[CreerMaBoutique] Creating shop for user:", user.id);

      // Step 1: Insert shop into database
      const { data: shop, error: shopError } = await supabase
        .from("shops")
        .insert({
          user_id: user.id,
          name: formData.shopName.trim(),
          slug: slug,
          category: formData.category,
          city: formData.city.trim(),
          contact_whatsapp: formData.whatsapp.trim(),
          status: "pending",
        })
        .select()
        .single();

      if (shopError) {
        console.error("[CreerMaBoutique] Shop creation error:", shopError);
        throw shopError;
      }

      console.log("[CreerMaBoutique] Shop created successfully:", shop.id);

      // Step 2: Call Edge Function to assign shop_owner role
      console.log("[CreerMaBoutique] Calling assign-shop-owner-role function");
      const { data: roleData, error: roleError } = await supabase.functions.invoke(
        "assign-shop-owner-role"
      );

      if (roleError) {
        console.error("[CreerMaBoutique] Role assignment error:", roleError);
        // Don't throw - shop was created, just log the role error
        // The user can still access their shop, role can be fixed later
        toast({
          title: "Attention",
          description: "Boutique créée, mais erreur d'attribution du rôle. Contactez le support si vous rencontrez des problèmes d'accès.",
        });
      } else {
        console.log("[CreerMaBoutique] Role assigned:", roleData);
      }

      // Success!
      toast({
        title: "🎉 Boutique créée avec succès !",
        description: "Votre boutique sera visible après validation par notre équipe (24-48h).",
      });

      // Navigate to dashboard
      navigate("/dashboard/boutique");

    } catch (error: any) {
      console.error("[CreerMaBoutique] Error:", error);
      toast({
        title: "Erreur lors de la création",
        description: getDetailedErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth or existing shop
  if (authLoading || checkingExistingShop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Retour à l'accueil</span>
          </Link>
          <span className="text-lg font-bold text-primary">Loummel</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Créer ma boutique en 2 minutes
            </h1>
            <p className="text-muted-foreground">
              Remplissez les informations essentielles pour démarrer
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-card border rounded-xl p-6 shadow-sm">
            {/* Shop Name */}
            <div className="space-y-2">
              <Label htmlFor="shopName" className="text-foreground font-medium">
                Nom de la boutique <span className="text-destructive">*</span>
              </Label>
              <Input
                id="shopName"
                type="text"
                placeholder="Ex: Artisanat du Sahel"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="h-12"
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground font-medium">
                Secteur d'activité <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city" className="text-foreground font-medium">
                Ville <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                type="text"
                placeholder="Ex: Maroua, Douala, Yaoundé..."
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="h-12"
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-foreground font-medium">
                Numéro WhatsApp <span className="text-destructive">*</span>
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+237 6XX XXX XXX"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="h-12"
                disabled={isSubmitting}
                maxLength={20}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              variant="hero"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  🚀 Créer ma boutique
                </>
              )}
            </Button>

            {/* Info Notice */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Votre boutique sera visible après validation par notre équipe (24-48h).
                Vous pourrez ensuite ajouter vos produits et services depuis votre dashboard.
              </p>
            </div>
          </form>

          {/* Already have a shop? */}
          <p className="text-center mt-6 text-sm text-muted-foreground">
            Vous avez déjà une boutique ?{" "}
            <Link to="/dashboard/boutique" className="text-primary hover:underline font-medium">
              Accéder à mon dashboard
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default CreerMaBoutique;
