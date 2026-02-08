import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { 
  MessageSquareWarning, Search, Filter, Loader2, 
  ChevronLeft, ChevronRight, Clock, CheckCircle, 
  AlertTriangle, XCircle, Eye, UserPlus
} from "lucide-react";

interface Complaint {
  id: string;
  complainant_id: string;
  target_type: string;
  target_id: string | null;
  subject: string;
  description: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  resolution_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  complainant?: {
    full_name: string | null;
    email: string | null;
  };
  assignee?: {
    full_name: string | null;
  };
}

const ITEMS_PER_PAGE = 10;

export function ComplaintsTab() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch complainant and assignee profiles
      const complainantIds = [...new Set(data?.map(c => c.complainant_id) || [])];
      const assigneeIds = [...new Set(data?.filter(c => c.assigned_to).map(c => c.assigned_to!) || [])];
      const allUserIds = [...new Set([...complainantIds, ...assigneeIds])];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", allUserIds);

      const complaintsWithProfiles = (data || []).map(complaint => ({
        ...complaint,
        complainant: profiles?.find(p => p.id === complaint.complainant_id),
        assignee: profiles?.find(p => p.id === complaint.assigned_to),
      }));

      setComplaints(complaintsWithProfiles);
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

  const updateComplaintStatus = async (complaintId: string, newStatus: string, notes?: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "resolved") {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolution_notes = notes || null;
      }

      const { error } = await supabase
        .from("complaints")
        .update(updateData)
        .eq("id", complaintId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Réclamation mise à jour`,
      });

      setIsDialogOpen(false);
      setSelectedComplaint(null);
      setResolutionNotes("");
      fetchComplaints();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const assignToSelf = async (complaintId: string) => {
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ assigned_to: user?.id, status: "in_progress" })
        .eq("id", complaintId);

      if (error) throw error;

      toast({ title: "Succès", description: "Réclamation assignée" });
      fetchComplaints();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (complaint.complainant?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || complaint.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; icon: React.ReactNode; label: string }> = {
      pending: { className: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-3 h-3" />, label: "En attente" },
      in_progress: { className: "bg-blue-100 text-blue-800", icon: <AlertTriangle className="w-3 h-3" />, label: "En cours" },
      resolved: { className: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3 h-3" />, label: "Résolu" },
      closed: { className: "bg-gray-100 text-gray-800", icon: <XCircle className="w-3 h-3" />, label: "Fermé" },
    };
    const c = config[status] || config.pending;
    return (
      <Badge variant="outline" className={`${c.className} flex items-center gap-1`}>
        {c.icon}
        {c.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      low: "Basse",
      medium: "Moyenne",
      high: "Haute",
    };
    return (
      <Badge variant="outline" className={styles[priority] || styles.medium}>
        {labels[priority] || priority}
      </Badge>
    );
  };

  const getTargetLabel = (type: string) => {
    const labels: Record<string, string> = {
      shop: "Boutique",
      product: "Produit",
      partner: "Partenaire",
      order: "Commande",
      service: "Service",
      other: "Autre",
    };
    return labels[type] || type;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openResolveDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResolutionNotes(complaint.resolution_notes || "");
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary">
          <MessageSquareWarning className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-primary">Réclamations</h1>
          <p className="text-muted-foreground">Système de ticketing et suivi des plaintes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{complaints.length}</div>
            <p className="text-sm text-muted-foreground">Total réclamations</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {complaints.filter(c => c.status === "pending").length}
            </div>
            <p className="text-sm text-muted-foreground">En attente</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {complaints.filter(c => c.status === "in_progress").length}
            </div>
            <p className="text-sm text-muted-foreground">En cours</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {complaints.filter(c => c.status === "resolved").length}
            </div>
            <p className="text-sm text-muted-foreground">Résolues</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <CardTitle className="text-primary flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5" />
              Liste des réclamations
            </CardTitle>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-10 w-full sm:w-48"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="resolved">Résolues</SelectItem>
                  <SelectItem value="closed">Fermées</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes priorités</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="low">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                      <TableHead>Date</TableHead>
                      <TableHead>Expéditeur</TableHead>
                      <TableHead>Cible</TableHead>
                      <TableHead>Sujet</TableHead>
                      <TableHead>Priorité</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Assigné</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedComplaints.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Aucune réclamation trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedComplaints.map((complaint) => (
                        <TableRow key={complaint.id} className={`hover:bg-primary/5 ${complaint.priority === "high" ? "bg-red-50/50" : ""}`}>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(complaint.created_at)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{complaint.complainant?.full_name || "Inconnu"}</p>
                              <p className="text-xs text-muted-foreground">{complaint.complainant?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{getTargetLabel(complaint.target_type)}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate font-medium">
                            {complaint.subject}
                          </TableCell>
                          <TableCell>{getPriorityBadge(complaint.priority)}</TableCell>
                          <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                          <TableCell className="text-sm">
                            {complaint.assignee?.full_name || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openResolveDialog(complaint)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {!complaint.assigned_to && complaint.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => assignToSelf(complaint.id)}
                                >
                                  <UserPlus className="w-4 h-4 mr-1" />
                                  Prendre
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

      {/* Resolution Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Détails de la réclamation</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Sujet</Label>
                <p className="font-medium">{selectedComplaint.subject}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm">{selectedComplaint.description || "Aucune description"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Statut</Label>
                  <div className="mt-1">{getStatusBadge(selectedComplaint.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priorité</Label>
                  <div className="mt-1">{getPriorityBadge(selectedComplaint.priority)}</div>
                </div>
              </div>
              {selectedComplaint.status !== "resolved" && selectedComplaint.status !== "closed" && (
                <div>
                  <Label htmlFor="resolution">Notes de résolution</Label>
                  <Textarea
                    id="resolution"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Décrivez la résolution..."
                    className="mt-1"
                  />
                </div>
              )}
              {selectedComplaint.resolved_at && (
                <div>
                  <Label className="text-muted-foreground">Résolu le</Label>
                  <p className="text-sm">{formatDate(selectedComplaint.resolved_at)}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Fermer</Button>
            {selectedComplaint && selectedComplaint.status !== "resolved" && selectedComplaint.status !== "closed" && (
              <>
                {selectedComplaint.status === "pending" && (
                  <Button
                    variant="outline"
                    onClick={() => updateComplaintStatus(selectedComplaint.id, "in_progress")}
                    className="text-blue-600"
                  >
                    Mettre en cours
                  </Button>
                )}
                <Button
                  onClick={() => updateComplaintStatus(selectedComplaint.id, "resolved", resolutionNotes)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marquer résolu
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
