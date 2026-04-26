import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formatFCFA = (n: number) =>
  `${new Intl.NumberFormat("fr-FR").format(Math.round(n))} FCFA`;

type DeliveryForm = {
  full_name: string;
  phone: string;
  city: string;
  neighborhood: string;
  address: string;
  notes: string;
};

const Checkout = () => {
  const { user, loading } = useAuth();
  const { items, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryForm>({
    full_name: "",
    phone: "",
    city: "",
    neighborhood: "",
    address: "",
    notes: "",
  });
  const [paymentMode, setPaymentMode] = useState<string>("livraison");

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse text-muted-foreground">Chargement...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion?redirect=/checkout" replace />;
  }

  if (items.length === 0 && !submitting) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="p-8 text-center max-w-md mx-auto">
            <p className="text-lg mb-4">Votre panier est vide</p>
            <Button asChild>
              <Link to="/recherche">Découvrir des produits</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivery.full_name || !delivery.phone || !delivery.city || !delivery.address) {
      toast.error("Merci de remplir les champs obligatoires");
      return;
    }
    setStep(2);
  };

  const handleConfirmOrder = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          items: items as any,
          total: cartTotal,
          mode_paiement: paymentMode,
          adresse_livraison: delivery as any,
          statut: "en_attente",
        })
        .select("id")
        .single();

      if (error) throw error;

      clearCart();
      toast.success("Commande confirmée !");
      navigate(`/commande-confirmee?id=${data.id}`);
    } catch (err: any) {
      console.error("[Checkout] Order creation failed:", err);
      toast.error(err.message || "Erreur lors de la création de la commande");
      setSubmitting(false);
    }
  };

  const Stepper = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
            step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {step > 1 ? <Check className="w-4 h-4" /> : "1"}
        </div>
        <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>
          Livraison
        </span>
      </div>
      <div className="w-12 h-px bg-border" />
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
            step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          2
        </div>
        <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>
          Confirmation
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Finaliser ma commande</h1>
        <Stepper />

        {step === 1 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Informations de livraison</h2>
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nom complet *</Label>
                <Input
                  id="full_name"
                  value={delivery.full_name}
                  onChange={(e) =>
                    setDelivery({ ...delivery, full_name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={delivery.phone}
                  onChange={(e) =>
                    setDelivery({ ...delivery, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    value={delivery.city}
                    onChange={(e) =>
                      setDelivery({ ...delivery, city: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="neighborhood">Quartier</Label>
                  <Input
                    id="neighborhood"
                    value={delivery.neighborhood}
                    onChange={(e) =>
                      setDelivery({ ...delivery, neighborhood: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Adresse détaillée *</Label>
                <Textarea
                  id="address"
                  value={delivery.address}
                  onChange={(e) =>
                    setDelivery({ ...delivery, address: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  value={delivery.notes}
                  onChange={(e) =>
                    setDelivery({ ...delivery, notes: e.target.value })
                  }
                />
              </div>
              <Button type="submit" size="lg" className="w-full">
                Continuer
              </Button>
            </form>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Récapitulatif</h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex justify-between text-sm"
                  >
                    <span className="truncate pr-2">
                      {item.name}{" "}
                      <span className="text-muted-foreground">
                        × {item.quantity}
                      </span>
                    </span>
                    <span className="shrink-0">
                      {formatFCFA(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <Separator className="my-3" />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatFCFA(cartTotal)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Mode de paiement</h2>
              <RadioGroup value={paymentMode} onValueChange={setPaymentMode}>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="livraison" id="livraison" />
                  <Label htmlFor="livraison" className="flex-1 cursor-pointer">
                    Paiement à la livraison
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="orange_money" id="orange_money" />
                  <Label htmlFor="orange_money" className="flex-1 cursor-pointer">
                    Orange Money
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="mtn_momo" id="mtn_momo" />
                  <Label htmlFor="mtn_momo" className="flex-1 cursor-pointer">
                    MTN Mobile Money
                  </Label>
                </div>
              </RadioGroup>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={submitting}
                className="sm:w-auto"
              >
                Retour
              </Button>
              <Button
                onClick={handleConfirmOrder}
                disabled={submitting}
                size="lg"
                className="flex-1"
              >
                {submitting ? "Envoi..." : "Confirmer la commande"}
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
