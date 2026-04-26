import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Veuillez entrer votre email");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      console.error("[ForgotPassword]", err);
      toast.error(err.message || "Erreur lors de l'envoi du lien");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {sent ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto" />
                <h1 className="text-2xl font-bold text-green-800">
                  Email envoyé !
                </h1>
                <p className="text-sm text-green-700">
                  Vérifiez votre boîte mail et cliquez sur le lien reçu pour
                  réinitialiser votre mot de passe.
                </p>
                <Button asChild className="w-full bg-[#966442] hover:bg-[#966442]/90">
                  <Link to="/connexion">Retour à la connexion</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-8 pb-6 space-y-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#966442]/10 flex items-center justify-center mx-auto">
                    <KeyRound className="w-12 h-12 text-[#966442]" />
                  </div>
                  <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
                  <p className="text-sm text-muted-foreground">
                    Entrez votre email, nous vous enverrons un lien de
                    réinitialisation.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Adresse email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#966442] hover:bg-[#966442]/90"
                    size="lg"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Envoyer le lien
                  </Button>
                </form>

                <div className="text-center">
                  <Link
                    to="/connexion"
                    className="inline-flex items-center text-sm text-[#966442] hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    Retour à la connexion
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
