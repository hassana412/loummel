import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users, Store, Handshake, TrendingUp,
  Check, X, Clock, LogOut, Shield, Eye,
  Package, Briefcase, DollarSign, Search,
  Download, ExternalLink, UserX, Mail, Phone,
  UserPlus, Trash2, Loader2
} from "lucide-react";
import { PasswordInput, getPasswordStrength } from "@/components/auth/AuthHelpers";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
}

interface UserRole {
  user_id: string;
  role: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [partners, setPartners] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalPartners: 0,
    pendingPartners: 0,
    totalShops: 0,
    pendingShops: 0,
    vipShops: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalServices: 0,
    estimatedRevenue: 0,
    totalCommissions: 0,
  });

  // States for delegated admin creation
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch partners
    const { data: partnersData } = await supabase
      .from("partners")
      .select("*")
      .order("created_at", { ascending: false });

    if (partnersData) {
      setPartners(partnersData);
      const totalCommissions = partnersData.reduce((sum, p) => sum + (Number(p.total_commission_earned) || 0), 0);
      setStats(prev => ({
        ...prev,
        totalPartners: partnersData.length,
        pendingPartners: partnersData.filter(p => p.status === "pending").length,
        totalCommissions,
      }));
    }

    // Fetch shops
    const { data: shopsData } = await supabase
      .from("shops")
      .select("*")
      .order("created_at", { ascending: false });

    if (shopsData) {
      setShops(shopsData);
      const activeShops = shopsData.filter(s => s.status === "active");
      const estimatedRevenue = activeShops.reduce((sum, s) => sum + (Number(s.subscription_amount) || 5000), 0);
      setStats(prev => ({
        ...prev,
        totalShops: shopsData.length,
        pendingShops: shopsData.filter(s => s.status === "pending").length,
        vipShops: shopsData.filter(s => s.is_vip).length,
        estimatedRevenue,
      }));
    }

    // Fetch profiles
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesData) {
      setProfiles(profilesData);
      setStats(prev => ({
        ...prev,
        totalUsers: profilesData.length,
      }));
    }

    // Fetch user roles
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("*");

    if (rolesData) {
      setUserRoles(rolesData);
    }

    // Fetch products count
    const { count: productsCount } = await supabase
      .from("products")
      .select("*", { count: 'exact', head: true });

    // Fetch services count
    const { count: servicesCount } = await supabase
      .from("services")
      .select("*", { count: 'exact', head: true });

    setStats(prev => ({
      ...prev,
      totalProducts: productsCount || 0,
      totalServices: servicesCount || 0,
    }));
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
      // 1. Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdminEmail,
        password: newAdminPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/backoffice`,
          data: { full_name: newAdminName }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erreur lors de la création du compte");

      // 2. Assign super_admin role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        role: "super_admin"
      });

      if (roleError) throw roleError;

      toast({ 
        title: "Admin délégué créé !", 
        description: `${newAdminName} peut maintenant accéder au backoffice.` 
      });
      
      // Reset form
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminName("");
      
      // Refresh data
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
    // Prevent revoking own admin role
    if (userId === user?.id) {
      toast({ title: "Erreur", description: "Vous ne pouvez pas révoquer votre propre rôle", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "super_admin");

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Rôle admin révoqué" });
      fetchData();
    }
  };

  const updatePartnerStatus = async (partnerId: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("partners")
      .update({ status })
      .eq("id", partnerId);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: `Partenaire ${status === "approved" ? "approuvé" : "rejeté"}` });
      fetchData();
    }
  };

  const updateShopStatus = async (shopId: string, status: "active" | "suspended") => {
    const { error } = await supabase
      .from("shops")
      .update({ status })
      .eq("id", shopId);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: `Boutique ${status === "active" ? "activée" : "suspendue"}` });
      fetchData();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Approuvé", className: "bg-green-100 text-green-800" },
      active: { label: "Actif", className: "bg-green-100 text-green-800" },
      suspended: { label: "Suspendu", className: "bg-red-100 text-red-800" },
      rejected: { label: "Rejeté", className: "bg-red-100 text-red-800" },
    };
    const v = variants[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={v.className}>{v.label}</Badge>;
  };

  const getRoleBadge = (userId: string) => {
    const role = userRoles.find(r => r.user_id === userId);
    if (!role) return <Badge variant="outline">Client</Badge>;
    
    const roleLabels: Record<string, { label: string; className: string }> = {
      super_admin: { label: "Super Admin", className: "bg-[#FFCC00] text-black" },
      partner: { label: "Partenaire", className: "bg-purple-500 text-white" },
      shop_owner: { label: "Vendeur", className: "bg-blue-500 text-white" },
    };
    const r = roleLabels[role.role] || { label: role.role, className: "bg-gray-500 text-white" };
    return <Badge className={r.className}>{r.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const exportCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {}).join(",");
    const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  const filteredProfiles = profiles.filter(p => 
    (p.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (p.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const filteredShops = shops.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.region?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const filteredPartners = partners.filter(p =>
    (p.region?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // Get super admins list
  const superAdmins = userRoles
    .filter(r => r.role === "super_admin")
    .map(r => {
      const profile = profiles.find(p => p.id === r.user_id);
      return { userId: r.user_id, ...profile };
    });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#FFCC00] rounded-xl">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Dashboard Super Admin</h1>
                <p className="text-muted-foreground">Gestion de la plateforme Loummel</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>

          {/* Stats Cards - Extended */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-indigo-500" /><div><p className="text-2xl font-bold">{stats.totalUsers}</p><p className="text-xs text-muted-foreground">Utilisateurs</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Handshake className="w-8 h-8 text-purple-500" /><div><p className="text-2xl font-bold">{stats.totalPartners}</p><p className="text-xs text-muted-foreground">Partenaires</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Store className="w-8 h-8 text-green-500" /><div><p className="text-2xl font-bold">{stats.totalShops}</p><p className="text-xs text-muted-foreground">Boutiques</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Package className="w-8 h-8 text-blue-500" /><div><p className="text-2xl font-bold">{stats.totalProducts}</p><p className="text-xs text-muted-foreground">Produits</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Briefcase className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{stats.totalServices}</p><p className="text-xs text-muted-foreground">Services</p></div></div></CardContent></Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-yellow-500" /><div><p className="text-2xl font-bold">{stats.pendingPartners}</p><p className="text-xs text-muted-foreground">Partenaires en attente</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{stats.pendingShops}</p><p className="text-xs text-muted-foreground">Boutiques à valider</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><TrendingUp className="w-8 h-8 text-amber-500" /><div><p className="text-2xl font-bold">{stats.vipShops}</p><p className="text-xs text-muted-foreground">Boutiques VIP</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-emerald-500" /><div><p className="text-lg font-bold">{formatPrice(stats.estimatedRevenue)}</p><p className="text-xs text-muted-foreground">Revenus estimés</p></div></div></CardContent></Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="users">
            <TabsList>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="partners">Partenaires</TabsTrigger>
              <TabsTrigger value="shops">Boutiques</TabsTrigger>
              <TabsTrigger value="admin" className="bg-[#FFCC00]/20">
                <Shield className="w-4 h-4 mr-1" />
                Administration
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Gestion des Utilisateurs</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => exportCSV(profiles, 'utilisateurs')}>
                    <Download className="w-4 h-4 mr-2" />
                    Exporter CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  {filteredProfiles.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucun utilisateur trouvé</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredProfiles.map((profile) => (
                        <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{profile.full_name || "Sans nom"}</p>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                {profile.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {profile.email}
                                  </span>
                                )}
                                {profile.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {profile.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getRoleBadge(profile.id)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Partners Tab */}
            <TabsContent value="partners" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Gestion des Partenaires</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => exportCSV(partners, 'partenaires')}>
                    <Download className="w-4 h-4 mr-2" />
                    Exporter CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  {filteredPartners.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucun partenaire trouvé</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredPartners.map((partner) => {
                        const partnerProfile = profiles.find(p => p.id === partner.user_id);
                        return (
                          <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold">{partnerProfile?.full_name || partner.region}</p>
                                <Badge variant="outline">{partner.partnership_type === "commission" ? "Commission" : "Forfait"}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{partner.region}</span>
                                {partnerProfile?.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {partnerProfile.email}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Store className="w-3 h-3" />
                                  {partner.shops_recruited || 0} boutiques
                                </span>
                                <span className="flex items-center gap-1 text-emerald-600">
                                  <DollarSign className="w-3 h-3" />
                                  {formatPrice(Number(partner.total_commission_earned) || 0)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(partner.status)}
                              {partner.status === "pending" && (
                                <>
                                  <Button size="sm" variant="outline" className="text-green-600" onClick={() => updatePartnerStatus(partner.id, "approved")}>
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => updatePartnerStatus(partner.id, "rejected")}>
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shops Tab */}
            <TabsContent value="shops" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Gestion des Boutiques</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => exportCSV(shops, 'boutiques')}>
                    <Download className="w-4 h-4 mr-2" />
                    Exporter CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  {filteredShops.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucune boutique trouvée</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredShops.map((shop) => (
                        <div key={shop.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">{shop.name}</p>
                              {shop.is_vip && <Badge className="bg-amber-500 text-white">VIP</Badge>}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{shop.category}</span>
                              <span>{shop.region} • {shop.city}</span>
                              {shop.contact_phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {shop.contact_phone}
                                </span>
                              )}
                              <span className="text-primary">
                                {formatPrice(Number(shop.subscription_amount) || 5000)}/an
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(shop.status)}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/boutique/${shop.slug}`)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Voir
                            </Button>
                            {shop.status === "pending" && (
                              <Button size="sm" variant="outline" className="text-green-600" onClick={() => updateShopStatus(shop.id, "active")}>
                                <Check className="w-4 h-4 mr-1" />
                                Activer
                              </Button>
                            )}
                            {shop.status === "active" && (
                              <Button size="sm" variant="outline" className="text-red-600" onClick={() => updateShopStatus(shop.id, "suspended")}>
                                <UserX className="w-4 h-4 mr-1" />
                                Suspendre
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Administration Tab */}
            <TabsContent value="admin" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Create Delegated Admin */}
                <Card className="border-[#FFCC00]/30">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#FFCC00] rounded-lg">
                        <UserPlus className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Créer un Admin Délégué</CardTitle>
                        <CardDescription>Ajouter un nouveau super administrateur</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={createDelegatedAdmin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-name">Nom complet</Label>
                        <Input
                          id="admin-name"
                          type="text"
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                          placeholder="Jean Dupont"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-email">Email</Label>
                        <Input
                          id="admin-email"
                          type="email"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="admin.delegue@loummel.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-password">Mot de passe</Label>
                        <PasswordInput
                          id="admin-password"
                          value={newAdminPassword}
                          onChange={setNewAdminPassword}
                          showStrength
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-[#CC9900] hover:bg-[#B38600] text-white"
                        disabled={isCreatingAdmin}
                      >
                        {isCreatingAdmin ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4 mr-2" />
                        )}
                        Créer l'admin délégué
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Existing Super Admins List */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#FFCC00] rounded-lg">
                        <Shield className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Super Administrateurs</CardTitle>
                        <CardDescription>{superAdmins.length} admin(s) actif(s)</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {superAdmins.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">Aucun super admin trouvé</p>
                    ) : (
                      <div className="space-y-3">
                        {superAdmins.map((admin) => (
                          <div key={admin.userId} className="flex items-center justify-between p-3 border rounded-lg bg-[#FFCC00]/5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#FFCC00] flex items-center justify-center">
                                <Shield className="w-5 h-5 text-black" />
                              </div>
                              <div>
                                <p className="font-semibold">{admin.full_name || "Sans nom"}</p>
                                <p className="text-sm text-muted-foreground">{admin.email}</p>
                              </div>
                            </div>
                            {admin.userId !== user?.id && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => revokeAdminRole(admin.userId)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Révoquer
                              </Button>
                            )}
                            {admin.userId === user?.id && (
                              <Badge className="bg-green-100 text-green-800">Vous</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
