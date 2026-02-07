import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "super_admin" | "partner" | "shop_owner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  hasRole: (role: AppRole) => boolean;
  refreshRoles: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching roles:", error);
        return [];
      }

      return (data?.map((r) => r.role as AppRole) || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
      return [];
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Fonction centralisée pour récupérer les rôles
    const loadRoles = async (userId: string) => {
      const fetchedRoles = await fetchUserRoles(userId);
      if (isMounted) setRoles(fetchedRoles);
      return fetchedRoles;
    };

    // Listener pour les CHANGEMENTS en cours (fire-and-forget, ne contrôle PAS loading)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      // Fire-and-forget - pas de await, pas de setLoading
      if (session?.user) {
        loadRoles(session.user.id);
      } else {
        setRoles([]);
      }
    });

    // INITIALISATION (contrôle loading)
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        // Attendre les rôles AVANT de mettre loading à false
        if (session?.user) {
          await loadRoles(session.user.id);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth?mode=reset`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    return { error };
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  const refreshRoles = async () => {
    if (user) {
      const fetchedRoles = await fetchUserRoles(user.id);
      setRoles(fetchedRoles);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        roles,
        hasRole,
        refreshRoles,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};