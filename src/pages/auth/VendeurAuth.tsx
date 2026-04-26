import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Store, Eye, EyeOff, ArrowLeft, Mail, KeyRound } from "lucide-react";
import { z } from "zod";
import { PasswordInput, getErrorMessage, getPasswordStrength } from "@/components/auth/AuthHelpers";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

const emailSchema = z.string().email("Email invalide");
const passwordSchema = z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères");
const nameSchema = z.string().min(2, "Le nom doit contenir au moins 2 caractères");

type AuthMode = "login" | "signup" | "forgot" | "reset";

const VendeurAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, roles, signIn, signUp, resetPassword, updatePassword, loading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "reset") {
      setAuthMode("reset");
    } else if (mode === "signup") {
      setAuthMode("signup");
    }
  }, [searchParams]);

  // Redirect if already logged in with shop_owner role
  useEffect(() => {
    if (user && !loading && authMode !== "reset") {
      const redirectUrl = searchParams.get("redirect");
      if (roles.includes("shop_owner")) {
        navigate(redirectUrl || "/dashboard/boutique", { replace: true });
      } else {
        // User is logged in but has no shop - redirect to shop creation
        navigate(redirectUrl || "/creer-ma-boutique", { replace: true });
      }
    }
  }, [user, roles, loading, navigate, authMode, searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      nameSchema.parse(fullName);
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

    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    const strength = getPasswordStrength(password);
    if (strength.score < 2) {
      toast({
        title: "Mot de passe trop faible",
        description: "Utilisez au moins 8 caractères avec des majuscules et des chiffres.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      toast({
        title: "Erreur d'inscription",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    toast({
      title: "🎉 Compte créé !",
      description: "Vérifiez votre email pour confirmer votre inscription.",
    });
    
    setIsLoading(false);
  };

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
        description: getErrorMessage(error),
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(forgotEmail);
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
    
    const { error } = await resetPassword(forgotEmail);
    
    if (error) {
      toast({
        title: "Erreur",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } else {
      setEmailSent(true);
      toast({
        title: "Email envoyé !",
        description: "Consultez votre boîte de réception.",
      });
    }
    
    setIsLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      passwordSchema.parse(newPassword);
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
    
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    const strength = getPasswordStrength(newPassword);
    if (strength.score < 2) {
      toast({
        title: "Mot de passe trop faible",
        description: "Utilisez au moins 8 caractères avec des majuscules et des chiffres.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await updatePassword(newPassword);
    
    if (error) {
      toast({
        title: "Erreur",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Mot de passe mis à jour !",
        description: "Vous pouvez maintenant vous connecter.",
      });
      setAuthMode("login");
      navigate("/auth/vendeur", { replace: true });
    }
    
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-green-800">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // Forgot Password View
  if (authMode === "forgot") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="font-display text-xl">Mot de passe oublié</CardTitle>
              <CardDescription>
                {emailSent ? "Email envoyé !" : "Réinitialisez votre mot de passe"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailSent ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-sm text-green-700">
                      Consultez votre boîte de réception.
                    </p>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => { setAuthMode("login"); setEmailSent(false); }}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Envoyer le lien
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setAuthMode("login")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Reset Password View
  if (authMode === "reset") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="font-display text-xl">Nouveau mot de passe</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <PasswordInput id="new-password" value={newPassword} onChange={setNewPassword} showStrength />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer</Label>
                  <PasswordInput id="confirm-password" value={confirmNewPassword} onChange={setConfirmNewPassword} />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Mettre à jour
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Signup View
  if (authMode === "signup") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-4">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Créer un compte
            </h1>
            <p className="text-white/80">
              Pour créer votre boutique sur Loummel
            </p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="font-display text-xl">Inscription Vendeur</CardTitle>
              <CardDescription>
                Créez votre compte pour démarrer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleAuthButton 
                className="mb-4" 
                redirectTo={`${window.location.origin}/creer-ma-boutique`}
              />
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Votre nom complet"
                    required
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <PasswordInput
                    id="signup-password"
                    value={password}
                    onChange={setPassword}
                    showStrength
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-signup-password">Confirmer le mot de passe</Label>
                  <PasswordInput
                    id="confirm-signup-password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                  />
                </div>
                
                <Button type="submit" className="w-full h-11 bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Store className="w-4 h-4 mr-2" />
                  )}
                  Créer mon compte
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Déjà un compte ?
                </p>
                <Button variant="outline" className="w-full" onClick={() => setAuthMode("login")}>
                  <Lock className="w-4 h-4 mr-2" />
                  Se connecter
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-white/60 text-sm mt-6">
            © 2024 Loummel. Tous droits réservés.
          </p>
        </div>
      </div>
    );
  }

  // Login View (default)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Espace Vendeur
          </h1>
          <p className="text-white/80">
            Gérez votre boutique sur Loummel
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-xl">Connexion Vendeur</CardTitle>
            <CardDescription>
              Accédez à votre tableau de bord boutique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoogleAuthButton 
              className="mb-4" 
              redirectTo={`${window.location.origin}/dashboard/boutique`}
            />
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Ou</span>
              </div>
            </div>

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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    to="/mot-de-passe-oublie"
                    className="text-sm text-primary hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={setPassword}
                />
              </div>
              
              <Button type="submit" className="w-full h-11 bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                Se connecter
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Pas encore de compte ?
              </p>
              <Button variant="outline" className="w-full" onClick={() => setAuthMode("signup")}>
                <Store className="w-4 h-4 mr-2" />
                Créer un compte vendeur
              </Button>
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

export default VendeurAuth;
