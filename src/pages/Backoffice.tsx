import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Shield, Store, Handshake, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Email invalide");
const passwordSchema = z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères");

const Backoffice = () => {
  const navigate = useNavigate();
  const { user, roles, signIn, loading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already logged in with appropriate role
  useEffect(() => {
    if (user && !loading) {
      if (roles.includes("super_admin")) {
        navigate("/dashboard/admin", { replace: true });
      } else if (roles.includes("partner")) {
        navigate("/dashboard/partenaire", { replace: true });
      } else if (roles.includes("shop_owner")) {
        navigate("/dashboard/boutique", { replace: true });
      }
    }
  }, [user, roles, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: err.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Erreur de connexion",
        description: error.message === "Invalid login credentials" 
          ? "Email ou mot de passe incorrect" 
          : error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    toast({
      title: "Connexion réussie",
      description: "Redirection vers votre tableau de bord...",
    });
    
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sahel-earth to-sahel-terracotta">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sahel-earth via-sahel-terracotta/80 to-sahel-ochre p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Loummel Backoffice
          </h1>
          <p className="text-white/80">
            Espace réservé aux administrateurs et partenaires
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-xl">Connexion</CardTitle>
            <CardDescription>
              Accédez à votre tableau de bord
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                Se connecter
              </Button>
            </form>

            {/* Access types */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-center text-muted-foreground mb-4">
                Types d'accès disponibles
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-red-50 rounded-lg">
                  <Shield className="w-5 h-5 mx-auto text-red-600 mb-1" />
                  <p className="text-xs font-medium text-red-700">Admin</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Handshake className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                  <p className="text-xs font-medium text-blue-700">Partenaire</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Store className="w-5 h-5 mx-auto text-green-600 mb-1" />
                  <p className="text-xs font-medium text-green-700">Boutique</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-white/60 text-sm mt-6">
          © 2024 Loummel. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default Backoffice;
