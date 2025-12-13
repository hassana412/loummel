import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

// Helper function for detailed error messages
export const getErrorMessage = (error: any): string => {
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
export const getPasswordStrength = (password: string) => {
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
export const PasswordStrengthIndicator = ({ password }: { password: string }) => {
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
export const PasswordInput = ({ 
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
