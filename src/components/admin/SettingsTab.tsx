import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { PasswordInput, getPasswordStrength } from "@/components/auth/AuthHelpers";
import FlyerManager from "@/components/admin/FlyerManager";
import {
  Settings, UserPlus, Shield, Trash2, Loader2,
  KeyRound, Megaphone, ClipboardList, Users
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface UserRole {
  user_id: string;
  role: string;
}

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
}

const DEFAULT_ADMIN_PASSWORD = "Loummel@2024!";

export function SettingsTab() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Admin creation form
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [profilesRes, rolesRes, logsRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email"),
      supabase.from("user_roles").select("*"),
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

    if (profilesRes.data) setProfiles(profilesRes.data);
    if (rolesRes.data) setUserRoles(rolesRes.data);
    if (logsRes.data) setAuditLogs(logsRes.data as AuditLog[]);
  };

  const logAuditAction = async (action: string, entityType: string, entityId?: string, details?: Record<string, any>) => {
    if (!user) return;
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details: details || null,
    });
  };

  const createDelegatedAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminEmail || !newAdminPassword || !newAdminName) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs", variant: "destructive" });
      return;
    }

    const strength = getPasswordStrength(newAdminPassword);
    if (strength.score < 2) {
      toast({ 
        title: "Mot de passe trop faible", 
        description: "Utilisez au moins 8 caractères avec des majuscules et des chiffres.", 
        variant: "destructive" 
      });
      return;
    }

    setIsCreatingAdmin(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "create-delegated-admin",
        {
          body: {
            email: newAdminEmail,
            password: newAdminPassword,
            full_name: newAdminName,
          },
        }
      );

      if (fnError) throw fnError;
      if (!data?.user_id) throw new Error("Erreur lors de la création du compte");

      await logAuditAction("admin_created", "admin", data.user_id, {
        name: newAdminName,
        email: newAdminEmail,
      });

      toast({ 
        title: "Admin délégué créé !", 
        description: `${newAdminName} peut maintenant accéder au backoffice.` 
      });
      
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminName("");
      fetchData();
    } catch (error: any) {
      toast({ 
        title: "Erreur", 
        description: error.message || "Impossible de créer l'admin délégué", 
        variant: "destructive" 
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const revokeAdminRole = async (userId: string) => {
    if (userId === user?.id) {
      toast({ title: "Erreur", description: "Vous ne pouvez pas révoquer votre propre rôle", variant: "destructive" });
      return;
    }

    const adminProfile = profiles.find(p => p.id === userId);

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "super_admin");

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      await logAuditAction("admin_revoked", "admin", userId, { 
        name: adminProfile?.full_name, 
        email: adminProfile?.email 
      });
      toast({ title: "Succès", description: "Rôle admin révoqué" });
      fetchData();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      admin_created: { label: "Admin créé", color: "bg-blue-100 text-blue-800" },
      admin_revoked: { label: "Admin révoqué", color: "bg-red-100 text-red-800" },
      shop_activated: { label: "Boutique activée", color: "bg-green-100 text-green-800" },
      shop_suspended: { label: "Boutique suspendue", color: "bg-orange-100 text-orange-800" },
      shop_validated: { label: "Boutique validée", color: "bg-green-100 text-green-800" },
      partner_approved: { label: "Partenaire approuvé", color: "bg-green-100 text-green-800" },
      partner_rejected: { label: "Partenaire rejeté", color: "bg-red-100 text-red-800" },
    };
    const l = labels[action] || { label: action, color: "bg-gray-100 text-gray-800" };
    return <Badge className={l.color}>{l.label}</Badge>;
  };

  // Get super admins list
  const superAdmins = userRoles
    .filter(r => r.role === "super_admin")
    .map(r => {
      const profile = profiles.find(p => p.id === r.user_id);
      return { userId: r.user_id, ...profile };
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-[#966442]">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-[#966442]">Paramètres</h1>
          <p className="text-muted-foreground">Configuration et administration</p>
        </div>
      </div>

      <Tabs defaultValue="admins" className="space-y-6">
        <TabsList className="bg-[#966442]/10">
          <TabsTrigger value="admins" className="data-[state=active]:bg-[#966442] data-[state=active]:text-white">
            <Shield className="w-4 h-4 mr-2" />
            Administration
          </TabsTrigger>
          <TabsTrigger value="flyers" className="data-[state=active]:bg-[#966442] data-[state=active]:text-white">
            <Megaphone className="w-4 h-4 mr-2" />
            Flyers
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-[#966442] data-[state=active]:text-white">
            <ClipboardList className="w-4 h-4 mr-2" />
            Logs d'audit
          </TabsTrigger>
        </TabsList>

        {/* Admins Tab */}
        <TabsContent value="admins" className="space-y-6">
          {/* Create Admin Form */}
          <Card className="border-[#966442]/20">
            <CardHeader>
              <CardTitle className="text-[#966442] flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Créer un admin délégué
              </CardTitle>
              <CardDescription>
                Créez un nouveau compte administrateur avec accès au backoffice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createDelegatedAdmin} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nom complet</Label>
                    <Input
                      placeholder="Jean Dupont"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="admin@loummel.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mot de passe</Label>
                    <PasswordInput
                      id="new-admin-password"
                      value={newAdminPassword}
                      onChange={(value) => setNewAdminPassword(value)}
                      placeholder="Mot de passe sécurisé"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button 
                    type="submit" 
                    disabled={isCreatingAdmin}
                    className="bg-[#966442] hover:bg-[#966442]/90"
                  >
                    {isCreatingAdmin ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Création...</>
                    ) : (
                      <><UserPlus className="w-4 h-4 mr-2" /> Créer l'admin</>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setNewAdminPassword(DEFAULT_ADMIN_PASSWORD)}
                  >
                    <KeyRound className="w-4 h-4 mr-2" />
                    Mot de passe par défaut
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Admins List */}
          <Card className="border-[#966442]/20">
            <CardHeader>
              <CardTitle className="text-[#966442] flex items-center gap-2">
                <Users className="w-5 h-5" />
                Administrateurs ({superAdmins.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {superAdmins.map((admin) => (
                  <div key={admin.userId} className="flex items-center justify-between p-3 bg-[#966442]/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#966442] flex items-center justify-center">
                        <span className="text-white font-bold">
                          {admin.full_name?.charAt(0) || "A"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{admin.full_name || "Admin"}</p>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                    {admin.userId !== user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeAdminRole(admin.userId)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Révoquer
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flyers Tab */}
        <TabsContent value="flyers">
          <FlyerManager />
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="logs">
          <Card className="border-[#966442]/20">
            <CardHeader>
              <CardTitle className="text-[#966442] flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Historique des actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {auditLogs.map((log) => {
                  const actor = profiles.find(p => p.id === log.user_id);
                  return (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getActionLabel(log.action)}
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">{actor?.full_name || "Système"}</span>
                            {log.details?.name && (
                              <span className="text-muted-foreground"> • {log.details.name}</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(log.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {auditLogs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Aucune action enregistrée</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
