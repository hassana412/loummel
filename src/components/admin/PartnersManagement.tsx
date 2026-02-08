import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Handshake, Loader2, MapPin, Store, Coins, 
  CheckCircle, XCircle, Pause, Eye, ChevronLeft, ChevronRight 
} from "lucide-react";

interface Partner {
  id: string;
  user_id: string;
  partnership_type: "commission" | "forfait";
  status: string;
  region: string | null;
  departments: string[] | null;
  shops_recruited: number | null;
  total_commission_earned: number | null;
  current_commission_rate: number | null;
  forfait_amount: number | null;
  created_at: string | null;
  profile?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  };
}

const ITEMS_PER_PAGE = 10;

export function PartnersManagement() {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const { data: partnersData, error } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each partner
      const userIds = partnersData?.map(p => p.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .in("id", userIds);

      const partnersWithProfiles = (partnersData || []).map(partner => ({
        ...partner,
        profile: profiles?.find(p => p.id === partner.user_id),
      }));

      setPartners(partnersWithProfiles);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePartnerStatus = async (partnerId: string, newStatus: "pending" | "approved" | "active" | "suspended" | "rejected") => {
    try {
      const { error } = await supabase
        .from("partners")
        .update({ status: newStatus })
        .eq("id", partnerId);

      if (error) throw error;

      // Log audit
      const partner = partners.find(p => p.id === partnerId);
      await supabase.from("audit_logs").insert({
        user_id: user?.id,
        action: newStatus === "approved" ? "partner_approved" : "partner_rejected",
        entity_type: "partner",
        entity_id: partnerId,
        details: { name: partner?.profile?.full_name, email: partner?.profile?.email },
      });

      toast({
        title: "Succès",
        description: `Partenaire ${newStatus === "approved" ? "approuvé" : "suspendu"}`,
      });

      fetchPartners();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Filter partners
  const filteredPartners = partners.filter(partner => {
    return statusFilter === "all" || partner.status === statusFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPartners.length / ITEMS_PER_PAGE);
  const paginatedPartners = filteredPartners.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { className: string; icon: React.ReactNode }> = {
      pending: { className: "bg-yellow-100 text-yellow-800", icon: <Pause className="w-3 h-3" /> },
      approved: { className: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3 h-3" /> },
      active: { className: "bg-blue-100 text-blue-800", icon: <CheckCircle className="w-3 h-3" /> },
      suspended: { className: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> },
      rejected: { className: "bg-gray-100 text-gray-800", icon: <XCircle className="w-3 h-3" /> },
    };
    const labels: Record<string, string> = {
      pending: "En attente",
      approved: "Approuvé",
      active: "Actif",
      suspended: "Suspendu",
      rejected: "Rejeté",
    };
    const style = styles[status] || styles.pending;
    return (
      <Badge variant="outline" className={`${style.className} flex items-center gap-1`}>
        {style.icon}
        {labels[status] || status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "0 FCFA";
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary">
          <Handshake className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-primary">Partenaires</h1>
          <p className="text-muted-foreground">Gestion des partenaires commerciaux</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{partners.length}</div>
            <p className="text-sm text-muted-foreground">Total partenaires</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {partners.filter(p => p.status === "approved" || p.status === "active").length}
            </div>
            <p className="text-sm text-muted-foreground">Actifs</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {partners.filter(p => p.status === "pending").length}
            </div>
            <p className="text-sm text-muted-foreground">En attente</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {partners.reduce((sum, p) => sum + (p.shops_recruited || 0), 0)}
            </div>
            <p className="text-sm text-muted-foreground">Boutiques recrutées</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <CardTitle className="text-primary flex items-center gap-2">
              <Handshake className="w-5 h-5" />
              Liste des partenaires
            </CardTitle>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvés</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="suspended">Suspendus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5">
                      <TableHead>Partenaire</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Boutiques</TableHead>
                      <TableHead>Commissions</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPartners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Aucun partenaire trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPartners.map((partner) => (
                        <TableRow key={partner.id} className="hover:bg-primary/5">
                          <TableCell>
                            <div>
                              <p className="font-medium">{partner.profile?.full_name || "Sans nom"}</p>
                              <p className="text-sm text-muted-foreground">{partner.profile?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={partner.partnership_type === "commission" ? "bg-blue-50" : "bg-purple-50"}>
                              {partner.partnership_type === "commission" ? "Commission" : "Forfait"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              {partner.region || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Store className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{partner.shops_recruited || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Coins className="w-4 h-4 text-muted-foreground" />
                              {formatCurrency(partner.total_commission_earned)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(partner.status || "pending")}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {partner.status === "pending" && (
                                <Button
                                  size="sm"
                                  onClick={() => updatePartnerStatus(partner.id, "approved")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approuver
                                </Button>
                              )}
                              {(partner.status === "approved" || partner.status === "active") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updatePartnerStatus(partner.id, "suspended")}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Pause className="w-4 h-4 mr-1" />
                                  Suspendre
                                </Button>
                              )}
                              {partner.status === "suspended" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updatePartnerStatus(partner.id, "approved")}
                                  className="text-green-600 hover:bg-green-50"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Réactiver
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
