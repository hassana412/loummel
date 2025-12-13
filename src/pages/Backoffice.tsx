import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Shield, ArrowLeft, Mail, KeyRound } from "lucide-react";
import { z } from "zod";
import { PasswordInput, getErrorMessage, getPasswordStrength } from "@/components/auth/AuthHelpers";

const emailSchema = z.string().email("Email invalide");
const passwordSchema = z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères");

type AuthMode = "main" | "forgot" | "reset";

const Backoffice = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, roles, signIn, resetPassword, updatePassword, loading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("main");
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "reset") {
      setAuthMode("reset");
    }
  }, [searchParams]);

  // Redirect if already logged in with super_admin role ONLY
  useEffect(() => {
    if (user && !loading && authMode !== "reset") {
      if (roles.includes("super_admin")) {
        navigate("/dashboard/admin", { replace: true });
      } else {
        // Non-admin users shouldn't access backoffice
        toast({
          title: "Accès refusé",
          description: "Cette zone est réservée aux administrateurs.",
          variant: "destructive",
        });
        navigate("/", { replace: true });
      }
    }
  }, [user, roles, loading, navigate, authMode]);

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
      description: "Vérification des droits d'accès...",
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
      setAuthMode("main");
      navigate("/backoffice", { replace: true });
    }
    
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFCC00]">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  // Forgot Password View
  if (authMode === "forgot") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFCC00] p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#996600]" />
              </div>
              <CardTitle className="font-display text-xl">Mot de passe oublié</CardTitle>
              <CardDescription>
                {emailSent ? "Email envoyé !" : "Réinitialisez votre mot de passe admin"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailSent ? (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-100 rounded-lg text-center">
                    <p className="text-sm text-[#996600]">
                      Consultez votre boîte de réception.
                    </p>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => { setAuthMode("main"); setEmailSent(false); }}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email admin</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@loummel.com"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#CC9900] hover:bg-[#B38600] text-white" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Envoyer le lien
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setAuthMode("main")}>
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
      <div className="min-h-screen flex items-center justify-center bg-[#FFCC00] p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6 text-[#996600]" />
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
                <Button type="submit" className="w-full bg-[#CC9900] hover:bg-[#B38600] text-white" disabled={isLoading}>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFCC00] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black/10 backdrop-blur-sm mb-4">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <h1 className="font-display text-3xl font-bold text-black mb-2">
            Loummel Backoffice
          </h1>
          <p className="text-black/70">
            Zone réservée aux Super Administrateurs
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-xl">Connexion Admin</CardTitle>
            <CardDescription>
              Accédez au panneau d'administration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email administrateur</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@loummel.com"
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={setPassword}
                />
              </div>
              
              <Button type="submit" className="w-full h-11 bg-[#CC9900] hover:bg-[#B38600] text-white" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                Se connecter
              </Button>

              <div className="text-center">
                <button type="button" onClick={() => setAuthMode("forgot")} className="text-sm text-[#996600] hover:underline">
                  Mot de passe oublié ?
                </button>
              </div>
            </form>

            {/* Warning */}
            <div className="mt-6 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
              <p className="text-xs text-[#996600] text-center">
                <Shield className="w-4 h-4 inline mr-1" />
                Accès strictement réservé aux administrateurs autorisés.
                Toute tentative non autorisée sera enregistrée.
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-black/60 text-sm mt-6">
          © 2024 Loummel. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default Backoffice;
