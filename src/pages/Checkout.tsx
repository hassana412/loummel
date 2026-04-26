import { useState, useMemo } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Check, Loader2, ShieldCheck } from "lucide-react";
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

type PaymentMode = "orange_money" | "mtn_momo";

const Checkout = () => {
  const { user, loading } = useAuth();
  const { items, cartTotal, clearCart, itemsByShop } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryForm>({
    full_name: "",
    phone: "",
    city: "",
    neighborhood: "",
    address: "",
    notes: "",
  });
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("orange_money");
  const [paymentNumber, setPaymentNumber] = useState("");

  const shopGroups = useMemo(() => Object.values(itemsByShop), [itemsByShop]);

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
    if (!paymentNumber.trim()) {
      toast.error("Merci de renseigner votre numéro de paiement");
      return;
    }

    setSubmitting(true);
    setStep(3);

    let createdOrderId: string | null = null;

    try {
      // 1. Insert global order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          items: items as any,
          total: cartTotal,
          mode_paiement: paymentMode,
          mode_paiement_numero: paymentNumber,
          adresse_livraison: delivery as any,
          statut: "paiement_en_cours",
        })
        .select("id")
        .single();

      if (orderError) throw orderError;
      createdOrderId = order.id;

      // 2. Insert one shop_order per shop
      const shopOrdersPayload = shopGroups.map((group) => ({
        order_id: order.id,
        shop_id: group.shop_id,
        shop_name: group.shop_name,
        items: group.items as any,
        subtotal: group.subtotal,
        statut: "en_attente",
      }));

      const { error: shopOrdersError } = await supabase
        .from("shop_orders")
        .insert(shopOrdersPayload);

      if (shopOrdersError) throw shopOrdersError;

      // 3. Clear cart and navigate
      clearCart();
      toast.success("Commande confirmée !");
      navigate(`/commande-confirmee?id=${order.id}`);
    } catch (err: any) {
      console.error("[Checkout] Order creation failed:", err);
      toast.error(err.message || "Erreur lors de la création de la commande");

      // Mark order as errored if it was created
      if (createdOrderId) {
        await supabase
          .from("orders")
          .update({ statut: "erreur" })
          .eq("id", createdOrderId);
      }

      setSubmitting(false);
      setStep(2);
    }
  };

  const Stepper = () => {
    const steps = [
      { n: 1, label: "Livraison" },
      { n: 2, label: "Paiement" },
      { n: 3, label: "Confirmation" },
    ];
    return (
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
        {steps.map((s, idx) => (
          <div key={s.n} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                  step >= s.n
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.n ? <Check className="w-4 h-4" /> : s.n}
              </div>
              <span
                className={`text-sm ${
                  step >= s.n ? "font-medium" : "text-muted-foreground"
                } hidden sm:inline`}
              >
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && <div className="w-8 sm:w-12 h-px bg-border" />}
          </div>
        ))}
      </div>
    );
  };

  // Loading overlay during processing
  if (step === 3 && submitting) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="p-10 text-center max-w-md w-full">
            <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Traitement de votre commande...
            </h2>
            <p className="text-sm text-muted-foreground">
              Merci de patienter, ne fermez pas cette page.
            </p>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

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
                Continuer →
              </Button>
            </form>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xl font-semibold">Paiement sécurisé</h2>
                  <p className="text-sm text-muted-foreground">
                    Votre paiement sera reçu par Loummel et dispatché à chaque boutique.
                  </p>
                </div>
              </div>

              <RadioGroup
                value={paymentMode}
                onValueChange={(v) => setPaymentMode(v as PaymentMode)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3 border rounded-md p-3 hover:bg-accent transition-colors">
                  <RadioGroupItem value="orange_money" id="orange_money" />
                  <Label
                    htmlFor="orange_money"
                    className="flex-1 cursor-pointer flex items-center gap-3"
                  >
                    <span className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
                      OM
                    </span>
                    <span className="font-medium">Orange Money</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-md p-3 hover:bg-accent transition-colors">
                  <RadioGroupItem value="mtn_momo" id="mtn_momo" />
                  <Label
                    htmlFor="mtn_momo"
                    className="flex-1 cursor-pointer flex items-center gap-3"
                  >
                    <span className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-foreground font-bold text-xs">
                      MTN
                    </span>
                    <span className="font-medium">MTN Mobile Money</span>
                  </Label>
                </div>
              </RadioGroup>

              <div className="mt-4">
                <Label htmlFor="payment_number">
                  Numéro de paiement *
                </Label>
                <Input
                  id="payment_number"
                  type="tel"
                  placeholder="6XX XXX XXX"
                  value={paymentNumber}
                  onChange={(e) => setPaymentNumber(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Numéro {paymentMode === "orange_money" ? "Orange Money" : "MTN MoMo"} à débiter
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-3">Récapitulatif</h2>
              <div className="space-y-2">
                {shopGroups.map((group) => (
                  <div
                    key={group.shop_id}
                    className="flex justify-between text-sm py-1"
                  >
                    <span className="truncate pr-2 text-muted-foreground">
                      {group.shop_name}
                      <span className="ml-1 text-xs">
                        ({group.items.length} article{group.items.length > 1 ? "s" : ""})
                      </span>
                    </span>
                    <span className="shrink-0 font-medium">
                      {formatFCFA(group.subtotal)}
                    </span>
                  </div>
                ))}
                <Separator className="my-3" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatFCFA(cartTotal)}</span>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={submitting}
                className="sm:w-auto"
              >
                ← Retour
              </Button>
              <Button
                onClick={handleConfirmOrder}
                disabled={submitting}
                size="lg"
                className="flex-1"
              >
                Confirmer le paiement
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
