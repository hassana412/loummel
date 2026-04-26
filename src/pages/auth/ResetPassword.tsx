import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const computeStrength = (pwd: string) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (pwd.length >= 12) score = Math.min(4, score + 1);
  return Math.min(4, score);
};

const STRENGTH_LABELS = ["Faible", "Faible", "Moyen", "Fort", "Très fort"];
const STRENGTH_COLORS = [
  "bg-muted",
  "bg-destructive",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-600",
];

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Supabase auto-handles the recovery token in the URL hash via onAuthStateChange.
  // Just make sure the auth client picks it up.
  useEffect(() => {
    // Trigger session detection from URL fragment if present
    if (window.location.hash.includes("access_token")) {
      // supabase-js v2 handles this automatically on init; nothing else needed.
    }
  }, []);

  const strength = useMemo(() => computeStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Mot de passe mis à jour !");
      setTimeout(() => navigate("/connexion"), 2000);
    } catch (err: any) {
      console.error("[ResetPassword]", err);
      toast.error(err.message || "Erreur lors de la mise à jour du mot de passe");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-8 pb-6 space-y-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#966442]/10 flex items-center justify-center mx-auto">
                  <LockKeyhole className="w-12 h-12 text-[#966442]" />
                </div>
                <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
                <p className="text-sm text-muted-foreground">
                  Choisissez un mot de passe sécurisé pour votre compte.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />

                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((lvl) => (
                          <div
                            key={lvl}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              strength >= lvl
                                ? STRENGTH_COLORS[strength]
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Force :{" "}
                        <span className="font-medium">
                          {STRENGTH_LABELS[strength]}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive mt-1">
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#966442] hover:bg-[#966442]/90"
                  size="lg"
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Mettre à jour le mot de passe
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
