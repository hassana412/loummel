import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Bell, Search, Filter, Loader2, Download, 
  ChevronLeft, ChevronRight, User, Calendar,
  Store, AlertTriangle, CheckCircle, Info
} from "lucide-react";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: string | null;
  is_read: boolean | null;
  related_id: string | null;
  created_at: string | null;
  recipient?: {
    full_name: string | null;
    email: string | null;
  };
}

const ITEMS_PER_PAGE = 15;

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data: notifs, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch recipient profiles
      const userIds = [...new Set(notifs?.map(n => n.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      const notifsWithRecipients = (notifs || []).map(notif => ({
        ...notif,
        recipient: profiles?.find(p => p.id === notif.user_id),
      }));

      setNotifications(notifsWithRecipients);
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

  const exportToCSV = () => {
    const headers = ["Date", "Destinataire", "Email", "Type", "Titre", "Message", "Lu"];
    const rows = filteredNotifications.map(n => [
      formatDate(n.created_at),
      n.recipient?.full_name || "-",
      n.recipient?.email || "-",
      n.type || "-",
      n.title,
      n.message || "-",
      n.is_read ? "Oui" : "Non",
    ]);

    const csvContent = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `notifications_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: "Export réussi", description: "Fichier CSV téléchargé" });
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = 
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notif.message?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (notif.recipient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesType = typeFilter === "all" || notif.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get unique types
  const notifTypes = [...new Set(notifications.map(n => n.type).filter(Boolean))];

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case "new_shop":
        return <Store className="w-4 h-4 text-blue-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: string | null) => {
    const styles: Record<string, string> = {
      new_shop: "bg-blue-100 text-blue-800",
      warning: "bg-yellow-100 text-yellow-800",
      success: "bg-green-100 text-green-800",
      info: "bg-gray-100 text-gray-800",
    };
    const labels: Record<string, string> = {
      new_shop: "Nouvelle boutique",
      warning: "Alerte",
      success: "Succès",
      info: "Info",
    };
    return (
      <Badge variant="outline" className={styles[type || "info"] || styles.info}>
        {labels[type || "info"] || type || "Info"}
      </Badge>
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary">
          <Bell className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-primary">Centre de Notifications</h1>
          <p className="text-muted-foreground">Historique de toutes les notifications envoyées</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{notifications.length}</div>
            <p className="text-sm text-muted-foreground">Total envoyées</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {notifications.filter(n => n.is_read).length}
            </div>
            <p className="text-sm text-muted-foreground">Lues</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {notifications.filter(n => !n.is_read).length}
            </div>
            <p className="text-sm text-muted-foreground">Non lues</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {notifications.filter(n => n.type === "new_shop").length}
            </div>
            <p className="text-sm text-muted-foreground">Nouvelles boutiques</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <CardTitle className="text-primary flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Historique des notifications
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {notifTypes.map(type => (
                    <SelectItem key={type} value={type || ""}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
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
                      <TableHead>Destinataire</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Lu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedNotifications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Aucune notification trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedNotifications.map((notif) => (
                        <TableRow key={notif.id} className={`hover:bg-primary/5 ${!notif.is_read ? "bg-yellow-50/50" : ""}`}>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {formatDate(notif.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">{notif.recipient?.full_name || "Inconnu"}</p>
                                <p className="text-xs text-muted-foreground">{notif.recipient?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(notif.type)}
                              {getTypeBadge(notif.type)}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{notif.title}</TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {notif.message || "-"}
                          </TableCell>
                          <TableCell>
                            {notif.is_read ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800">Lu</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Non lu</Badge>
                            )}
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
