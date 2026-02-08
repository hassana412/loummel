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
  KeyRound, Megaphone, ClipboardList, Users,
  Database, Download, CheckCircle, XCircle, Wifi
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

  // Connectivity
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const [isExporting, setIsExporting] = useState(false);

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

  // Test Supabase connection
  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus("idle");
    
    try {
      const start = Date.now();
      const { data, error } = await supabase.from("profiles").select("id").limit(1);
      const latency = Date.now() - start;
      
      if (error) throw error;
      
      setConnectionStatus("success");
      toast({
        title: "Connexion réussie",
        description: `Latence: ${latency}ms - Base de données opérationnelle`,
      });
    } catch (error: any) {
      setConnectionStatus("error");
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Export data to JSON
  const exportData = async (format: "json" | "csv") => {
    setIsExporting(true);
    
    try {
      // Fetch all main tables
      const [shopsRes, productsRes, partnersRes, profilesRes] = await Promise.all([
        supabase.from("shops").select("*"),
        supabase.from("products").select("*"),
        supabase.from("partners").select("*"),
        supabase.from("profiles").select("*"),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        shops: shopsRes.data || [],
        products: productsRes.data || [],
        partners: partnersRes.data || [],
        profiles: profilesRes.data || [],
      };

      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === "json") {
        content = JSON.stringify(exportData, null, 2);
        filename = `loummel_export_${new Date().toISOString().split("T")[0]}.json`;
        mimeType = "application/json";
      } else {
        // CSV export - flatten shops data
        const headers = ["ID", "Nom", "Slug", "Catégorie", "Région", "Ville", "Statut", "VIP", "Créé le"];
        const rows = (shopsRes.data || []).map(s => [
          s.id, s.name, s.slug, s.category || "", s.region || "", 
          s.city || "", s.status || "", s.is_vip ? "Oui" : "Non", s.created_at
        ]);
        content = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
        filename = `loummel_boutiques_${new Date().toISOString().split("T")[0]}.csv`;
        mimeType = "text/csv;charset=utf-8;";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: `Fichier ${format.toUpperCase()} téléchargé`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'export",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
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
        <TabsList className="bg-primary/10">
          <TabsTrigger value="admins" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield className="w-4 h-4 mr-2" />
            Administration
          </TabsTrigger>
          <TabsTrigger value="flyers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Megaphone className="w-4 h-4 mr-2" />
            Flyers
          </TabsTrigger>
          <TabsTrigger value="connectivity" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Database className="w-4 h-4 mr-2" />
            Connectivité
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ClipboardList className="w-4 h-4 mr-2" />
            Logs d'audit
          </TabsTrigger>
        </TabsList>

        {/* Admins Tab */}
        <TabsContent value="admins" className="space-y-6">
          {/* Create Admin Form */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
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
                      className="bg-primary hover:bg-primary/90"
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
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Users className="w-5 h-5" />
                Administrateurs ({superAdmins.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {superAdmins.map((admin) => (
                  <div key={admin.userId} className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold">
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

        {/* Connectivity Tab */}
        <TabsContent value="connectivity" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Connection Test Card */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  Test de Connexion
                </CardTitle>
                <CardDescription>
                  Vérifiez la connexion au backend Lovable Cloud
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={testConnection}
                    disabled={isTestingConnection}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isTestingConnection ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Test en cours...</>
                    ) : (
                      <><Database className="w-4 h-4 mr-2" /> Tester la connexion</>
                    )}
                  </Button>
                  {connectionStatus === "success" && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Connecté</span>
                    </div>
                  )}
                  {connectionStatus === "error" && (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="w-5 h-5" />
                      <span>Erreur</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Data Export Card */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Sauvegarde des Données
                </CardTitle>
                <CardDescription>
                  Exportez vos données en JSON ou CSV
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => exportData("json")}
                    disabled={isExporting}
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Export JSON
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportData("csv")}
                    disabled={isExporting}
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Export CSV
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  JSON inclut toutes les données (boutiques, produits, partenaires, profils).
                  CSV exporte uniquement les boutiques.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Flyers Tab */}
        <TabsContent value="flyers">
          <FlyerManager />
        </TabsContent>
        {/* Audit Logs Tab */}
        <TabsContent value="logs">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
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
