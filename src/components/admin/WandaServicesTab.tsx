import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  Truck, DollarSign, TrendingUp, Package,
  Clock, Star, AlertTriangle, RotateCcw,
  Search, Filter, MapPin
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface Shipment {
  id: string;
  tracking_number: string;
  type: string;
  status: string;
  origin_city: string;
  destination_city: string;
  weight_kg: number;
  delivery_cost: number;
  delivery_fee: number;
  is_damaged: boolean;
  is_returned: boolean;
  damage_notes: string | null;
  customer_rating: number | null;
  picked_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

interface ShipmentStats {
  totalRevenue: number;
  operationalCosts: number;
  netMargin: number;
  totalShipments: number;
  localShipments: number;
  internationalShipments: number;
  avgDeliveryDays: number;
  avgRating: number;
  totalDamaged: number;
  totalReturned: number;
  successRate: number;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  picked_up: { label: "Ramassé", color: "text-blue-700", bgColor: "bg-blue-100" },
  in_transit: { label: "En transit", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  delivered: { label: "Livré", color: "text-green-700", bgColor: "bg-green-100" },
  damaged: { label: "Avarie", color: "text-red-700", bgColor: "bg-red-100" },
};

export function WandaServicesTab() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState<ShipmentStats>({
    totalRevenue: 0,
    operationalCosts: 0,
    netMargin: 0,
    totalShipments: 0,
    localShipments: 0,
    internationalShipments: 0,
    avgDeliveryDays: 0,
    avgRating: 0,
    totalDamaged: 0,
    totalReturned: 0,
    successRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setShipments(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: Shipment[]) => {
    const totalRevenue = data.reduce((sum, s) => sum + Number(s.delivery_cost), 0);
    const operationalCosts = totalRevenue * 0.7; // 70% estimated costs
    const netMargin = data.reduce((sum, s) => sum + Number(s.delivery_fee), 0);

    const localShipments = data.filter(s => s.type === "local").length;
    const internationalShipments = data.filter(s => s.type === "international").length;

    // Calculate average delivery time (only for delivered shipments)
    const deliveredShipments = data.filter(s => s.status === "delivered" && s.picked_at && s.delivered_at);
    let avgDeliveryDays = 0;
    if (deliveredShipments.length > 0) {
      const totalDays = deliveredShipments.reduce((sum, s) => {
        const picked = new Date(s.picked_at!);
        const delivered = new Date(s.delivered_at!);
        return sum + Math.ceil((delivered.getTime() - picked.getTime()) / (1000 * 60 * 60 * 24));
      }, 0);
      avgDeliveryDays = Math.round(totalDays / deliveredShipments.length * 10) / 10;
    }

    // Calculate average rating
    const ratedShipments = data.filter(s => s.customer_rating !== null);
    const avgRating = ratedShipments.length > 0
      ? Math.round(ratedShipments.reduce((sum, s) => sum + (s.customer_rating || 0), 0) / ratedShipments.length * 10) / 10
      : 0;

    const totalDamaged = data.filter(s => s.is_damaged).length;
    const totalReturned = data.filter(s => s.is_returned).length;

    const successfulDeliveries = data.filter(s => s.status === "delivered" && !s.is_damaged).length;
    const successRate = data.length > 0 ? Math.round((successfulDeliveries / data.length) * 100) : 0;

    setStats({
      totalRevenue,
      operationalCosts,
      netMargin,
      totalShipments: data.length,
      localShipments,
      internationalShipments,
      avgDeliveryDays,
      avgRating,
      totalDamaged,
      totalReturned,
      successRate,
    });
  };

  const filteredShipments = shipments.filter(s => {
    const matchesSearch = s.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.origin_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.destination_city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pieData = [
    { name: "Locaux", value: stats.localShipments, color: "#966442" },
    { name: "Internationaux", value: stats.internationalShipments, color: "#FFCC00" },
  ];

  const renderStars = (rating: number | null) => {
    if (rating === null) return <span className="text-muted-foreground text-sm">-</span>;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-[#966442]">
          <Truck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-[#966442]">Wanda Services</h1>
          <p className="text-muted-foreground">Gestion de la logistique et des livraisons</p>
        </div>
      </div>

      {/* Finance Section */}
      <div>
        <h2 className="text-lg font-semibold text-[#966442] mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Finance
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-[#966442]/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold text-[#966442]">{formatPrice(stats.totalRevenue)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-[#966442]/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Coûts opérationnels</p>
                  <p className="text-2xl font-bold text-orange-600">{formatPrice(stats.operationalCosts)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Marge nette</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(stats.netMargin)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Volume Chart */}
        <Card className="border-[#966442]/20">
          <CardHeader>
            <CardTitle className="text-[#966442] flex items-center gap-2">
              <Package className="w-5 h-5" />
              Volume de colis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2 text-sm">
              <span><strong>{stats.totalShipments}</strong> colis au total</span>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <div className="space-y-4">
          <Card className="border-[#966442]/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[#966442]/10">
                  <Clock className="w-6 h-6 text-[#966442]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Temps moyen de livraison</p>
                  <p className="text-xl font-bold">{stats.avgDeliveryDays} jours</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-50">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Note satisfaction</p>
                  <p className="text-xl font-bold">{stats.avgRating}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-50">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taux de réussite</p>
                  <p className="text-xl font-bold text-green-600">{stats.successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quality Section */}
      <div>
        <h2 className="text-lg font-semibold text-[#966442] mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Qualité
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-50">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Colis endommagés</p>
                  <p className="text-2xl font-bold text-red-600">{stats.totalDamaged}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-50">
                  <RotateCcw className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Produits renvoyés</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalReturned}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Shipments Table */}
      <Card className="border-[#966442]/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-[#966442] flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Suivi des expéditions
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="picked_up">Ramassé</SelectItem>
                  <SelectItem value="in_transit">En transit</SelectItem>
                  <SelectItem value="delivered">Livré</SelectItem>
                  <SelectItem value="damaged">Avarie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Suivi</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Trajet</TableHead>
                  <TableHead>Poids</TableHead>
                  <TableHead>Coût</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.slice(0, 10).map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-mono text-sm">{shipment.tracking_number}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={shipment.type === "international" ? "border-yellow-500 text-yellow-700" : "border-[#966442] text-[#966442]"}>
                        {shipment.type === "local" ? "Local" : "International"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <span>{shipment.origin_city}</span>
                        <span className="text-muted-foreground">→</span>
                        <span>{shipment.destination_city}</span>
                      </div>
                    </TableCell>
                    <TableCell>{shipment.weight_kg} kg</TableCell>
                    <TableCell className="font-medium">{formatPrice(shipment.delivery_cost)}</TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig[shipment.status]?.bgColor} ${statusConfig[shipment.status]?.color}`}>
                        {statusConfig[shipment.status]?.label || shipment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{renderStars(shipment.customer_rating)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredShipments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune expédition trouvée
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
