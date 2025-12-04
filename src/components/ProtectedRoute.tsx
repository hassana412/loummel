import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

type AppRole = "super_admin" | "partner" | "shop_owner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  requireAuth?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  requireAuth = true 
}: ProtectedRouteProps) => {
  const { user, loading, roles } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some(role => roles.includes(role));
    
    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on user's role
      if (roles.includes("super_admin")) {
        return <Navigate to="/dashboard/admin" replace />;
      } else if (roles.includes("partner")) {
        return <Navigate to="/dashboard/partenaire" replace />;
      } else if (roles.includes("shop_owner")) {
        return <Navigate to="/dashboard/boutique" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
