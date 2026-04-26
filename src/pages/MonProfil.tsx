import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";

const MonProfil = () => {
  const { user, loading: authLoading, roles } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        toast.error("Erreur lors du chargement du profil");
      } else if (data) {
        setFullName(data.full_name || "");
        setEmail(data.email || user.email || "");
        setPhone(data.phone || "");
        setAvatarUrl(data.avatar_url || null);
      } else {
        setEmail(user.email || "");
      }
      setLoading(false);
    };

    if (user) loadProfile();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion?redirect=/mon-profil" replace />;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      toast.error(error.message || "Erreur lors de la mise à jour");
    } else {
      toast.success("Profil mis à jour ✓");
    }
    setSaving(false);
  };

  const initials = (fullName || email || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || "")
    .join("") || "?";

  const roleLabel = roles.includes("shop_owner")
    ? "Vendeur"
    : roles.includes("partner")
      ? "Partenaire"
      : roles.includes("super_admin")
        ? "Administrateur"
        : "Client";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center text-center mb-8">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName || "Avatar"}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary">
                  {initials}
                </span>
              </div>
            )}
            <h1 className="text-xl font-semibold mt-4">
              {fullName || "Utilisateur"}
            </h1>
            <p className="text-sm text-muted-foreground">{email}</p>
            <Badge variant="secondary" className="mt-2">
              {roleLabel}
            </Badge>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Form Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Mes informations</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nom complet</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Votre nom complet"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="6XX XXX XXX"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        "Enregistrer les modifications"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Security Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-primary" />
                    Sécurité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Mot de passe</h3>
                    <p className="text-sm text-muted-foreground">
                      Pour modifier votre mot de passe, utilisez le lien de
                      réinitialisation envoyé par email.
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/mot-de-passe-oublie">
                      Réinitialiser mon mot de passe
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MonProfil;
