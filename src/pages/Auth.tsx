import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, LogIn, UserPlus, Eye, EyeOff, ShoppingBag, ArrowLeft, Mail, KeyRound } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Email invalide");
const passwordSchema = z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères");

type AuthMode = "main" | "forgot" | "reset";

// Helper function for detailed error messages
const getErrorMessage = (error: any): string => {
  const message = error?.message || "";
  
  if (message.includes("Invalid login credentials")) {
    return "Email ou mot de passe incorrect. Vérifiez vos identifiants.";
  }
  if (message.includes("User already registered")) {
    return "Un compte existe déjà avec cet email. Connectez-vous ou réinitialisez votre mot de passe.";
  }
  if (message.includes("Email not confirmed")) {
    return "Veuillez confirmer votre email avant de vous connecter.";
  }
  if (message.includes("Password should be at least")) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  if (message.includes("Email rate limit exceeded")) {
    return "Trop de tentatives. Veuillez patienter quelques minutes.";
  }
  if (message.includes("User not found")) {
    return "Aucun compte trouvé avec cet email.";
  }
  
  return message || "Une erreur est survenue. Veuillez réessayer.";
};

// Password strength calculator
const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 1) return { score, label: "Faible", color: "bg-destructive" };
  if (score <= 3) return { score, label: "Moyen", color: "bg-yellow-500" };
  return { score, label: "Fort", color: "bg-green-500" };
};

// Password strength indicator component
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  if (!password) return null;
  
  const strength = getPasswordStrength(password);
  
  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= strength.score ? strength.color : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${
        strength.score <= 1 ? "text-destructive" : 
        strength.score <= 3 ? "text-yellow-600" : "text-green-600"
      }`}>
        Force du mot de passe : {strength.label}
      </p>
      <p className="text-xs text-muted-foreground">
        Conseil : 8+ caractères avec majuscules, chiffres et symboles
      </p>
    </div>
  );
};

// Password input with toggle visibility
const PasswordInput = ({ 
  id, 
  value, 
  onChange, 
  placeholder = "••••••••",
  showStrength = false 
}: { 
  id: string; 
  value: string; 
  onChange: (value: string) => void;
  placeholder?: string;
  showStrength?: boolean;
}) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full hover:bg-transparent"
          onClick={() => setShow(!show)}
        >
          {show ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
        </Button>
      </div>
      {showStrength && <PasswordStrengthIndicator password={value} />}
    </div>
  );
};

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, roles, signIn, signUp, resetPassword, updatePassword, loading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("main");
  const [emailSent, setEmailSent] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  // Quick client signup
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPassword, setClientPassword] = useState("");

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");

  // Reset password
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Detect reset mode from URL
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "reset") {
      setAuthMode("reset");
    }
  }, [searchParams]);

  // Redirect if already logged in (but not in reset mode)
  useEffect(() => {
    if (user && !loading && authMode !== "reset") {
      const from = (location.state as any)?.from?.pathname;
      
      if (from) {
        navigate(from, { replace: true });
      } else if (roles.includes("super_admin")) {
        navigate("/dashboard/admin", { replace: true });
      } else if (roles.includes("partner")) {
        navigate("/dashboard/partenaire", { replace: true });
      } else if (roles.includes("shop_owner")) {
        navigate("/dashboard/boutique", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, roles, loading, navigate, location, authMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
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
    
    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      toast({
        title: "Erreur de connexion",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Loummel !",
      });
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre nom complet",
        variant: "destructive",
      });
      return;
    }
    
    try {
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
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
    
    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    const strength = getPasswordStrength(signupPassword);
    if (strength.score < 2) {
      toast({
        title: "Mot de passe trop faible",
        description: "Utilisez au moins 8 caractères avec des majuscules et des chiffres.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    
    if (error) {
      toast({
        title: "Erreur d'inscription",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Inscription réussie !",
        description: "Votre compte a été créé avec succès.",
      });
    }
    
    setIsLoading(false);
  };

  const handleQuickClientSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre nom",
        variant: "destructive",
      });
      return;
    }
    
    try {
      emailSchema.parse(clientEmail);
      passwordSchema.parse(clientPassword);
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
    
    const { error } = await signUp(clientEmail, clientPassword, clientName);
    
    if (error) {
      toast({
        title: "Erreur d'inscription",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Compte créé !",
        description: "Vous pouvez maintenant effectuer vos achats.",
      });
      navigate("/");
    }
    
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
        description: "Consultez votre boîte de réception pour réinitialiser votre mot de passe.",
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
        description: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
      });
      setAuthMode("main");
      navigate("/auth", { replace: true });
    }
    
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Forgot Password View
  if (authMode === "forgot") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md shadow-sahel-card">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">Mot de passe oublié</CardTitle>
              <CardDescription>
                {emailSent 
                  ? "Un email de réinitialisation a été envoyé"
                  : "Entrez votre email pour recevoir un lien de réinitialisation"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailSent ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Consultez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setAuthMode("main");
                      setEmailSent(false);
                      setForgotEmail("");
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la connexion
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
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Envoyer le lien
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setAuthMode("main")}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la connexion
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    );
  }

  // Reset Password View (after clicking email link)
  if (authMode === "reset") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md shadow-sahel-card">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">Nouveau mot de passe</CardTitle>
              <CardDescription>
                Créez un nouveau mot de passe sécurisé pour votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <PasswordInput
                    id="new-password"
                    value={newPassword}
                    onChange={setNewPassword}
                    showStrength
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">Confirmer le mot de passe</Label>
                  <PasswordInput
                    id="confirm-new-password"
                    value={confirmNewPassword}
                    onChange={setConfirmNewPassword}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4 mr-2" />
                  )}
                  Mettre à jour le mot de passe
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    );
  }

  // Main Auth View (Login/Signup/Client tabs)
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-sahel-card">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Bienvenue sur Loummel</CardTitle>
            <CardDescription>
              Connectez-vous ou créez un compte pour continuer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
                <TabsTrigger value="client">Client</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <PasswordInput
                      id="login-password"
                      value={loginPassword}
                      onChange={setLoginPassword}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4 mr-2" />
                    )}
                    Se connecter
                  </Button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setAuthMode("forgot")}
                      className="text-sm text-primary hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                </form>
              </TabsContent>
              
              {/* Signup Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nom complet</Label>
                    <Input
                      id="signup-name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Votre nom complet"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <PasswordInput
                      id="signup-password"
                      value={signupPassword}
                      onChange={setSignupPassword}
                      showStrength
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirmer le mot de passe</Label>
                    <PasswordInput
                      id="signup-confirm"
                      value={signupConfirmPassword}
                      onChange={setSignupConfirmPassword}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    Créer mon compte
                  </Button>
                </form>
              </TabsContent>

              {/* Quick Client Signup Tab */}
              <TabsContent value="client">
                <div className="mt-4">
                  <div className="text-center mb-4 p-3 bg-primary/5 rounded-lg">
                    <ShoppingBag className="w-8 h-8 mx-auto text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Créez un compte rapidement pour acheter sur Loummel
                    </p>
                  </div>
                  <form onSubmit={handleQuickClientSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-name">Votre nom</Label>
                      <Input
                        id="client-name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Nom complet"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="client-email">Email</Label>
                      <Input
                        id="client-email"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="client-password">Mot de passe</Label>
                      <PasswordInput
                        id="client-password"
                        value={clientPassword}
                        onChange={setClientPassword}
                        showStrength
                      />
                    </div>
                    
                    <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ShoppingBag className="w-4 h-4 mr-2" />
                      )}
                      Créer mon compte client
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;