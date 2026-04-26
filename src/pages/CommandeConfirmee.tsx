import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CommandeConfirmee = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id") || "";
  const shortId = orderId.slice(0, 8).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="p-8 md:p-12 max-w-lg w-full text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-20 h-20 text-green-600" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold mb-3">Commande confirmée !</h1>
          {shortId && (
            <p className="text-muted-foreground mb-2">
              Numéro de commande :{" "}
              <span className="font-mono font-semibold text-foreground">
                #{shortId}
              </span>
            </p>
          )}
          <p className="text-muted-foreground mb-8">
            Vous serez contacté(e) par le vendeur sous 24h pour confirmer votre
            commande et organiser la livraison.
          </p>
          <Button asChild size="lg">
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default CommandeConfirmee;
