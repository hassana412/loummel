import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { WalletCard } from "./WalletCard";
import {
  Users, Store, Handshake, TrendingUp,
  Package, Briefcase, DollarSign, Clock,
  Truck
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalPartners: number;
  totalShops: number;
  pendingShops: number;
  vipShops: number;
  totalProducts: number;
  totalServices: number;
  estimatedRevenue: number;
  totalCommissions: number;
  pendingPartners: number;
  totalShipments: number;
  deliveredShipments: number;
}

interface WalletData {
  id: string;
  operator: string;
  balance: number;
  pending_balance: number;
  total_received: number;
  total_withdrawn: number;
}

interface WalletStats {
  monthlyReceived: number;
  monthlyWithdrawn: number;
  transactionCount: number;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
};

export function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPartners: 0,
    totalShops: 0,
    pendingShops: 0,
    vipShops: 0,
    totalProducts: 0,
    totalServices: 0,
    estimatedRevenue: 0,
    totalCommissions: 0,
    pendingPartners: 0,
    totalShipments: 0,
    deliveredShipments: 0,
  });
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [walletStats, setWalletStats] = useState<Record<string, WalletStats>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all stats in parallel
      const [
        { data: profiles },
        { data: partners },
        { data: shops },
        { count: productsCount },
        { count: servicesCount },
        { data: walletsData },
        { data: transactions },
        { data: shipments },
      ] = await Promise.all([
        supabase.from("profiles").select("id"),
        supabase.from("partners").select("*"),
        supabase.from("shops").select("*"),
        supabase.from("products").select("*", { count: 'exact', head: true }),
        supabase.from("services").select("*", { count: 'exact', head: true }),
        supabase.from("mobile_wallets").select("*"),
        supabase.from("wallet_transactions").select("*"),
        supabase.from("shipments").select("*"),
      ]);

      // Calculate stats
      const activeShops = shops?.filter(s => s.status === "active") || [];
      const estimatedRevenue = activeShops.reduce((sum, s) => sum + (Number(s.subscription_amount) || 5000), 0);
      const totalCommissions = partners?.reduce((sum, p) => sum + (Number(p.total_commission_earned) || 0), 0) || 0;

      setStats({
        totalUsers: profiles?.length || 0,
        totalPartners: partners?.length || 0,
        pendingPartners: partners?.filter(p => p.status === "pending").length || 0,
        totalShops: shops?.length || 0,
        pendingShops: shops?.filter(s => s.status === "pending").length || 0,
        vipShops: shops?.filter(s => s.is_vip).length || 0,
        totalProducts: productsCount || 0,
        totalServices: servicesCount || 0,
        estimatedRevenue,
        totalCommissions,
        totalShipments: shipments?.length || 0,
        deliveredShipments: shipments?.filter(s => s.status === "delivered").length || 0,
      });

      // Set wallets
      if (walletsData) {
        setWallets(walletsData);

        // Calculate monthly stats for each wallet
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const statsMap: Record<string, WalletStats> = {};
        walletsData.forEach(wallet => {
          const walletTransactions = transactions?.filter(t => t.wallet_id === wallet.id) || [];
          const monthlyTx = walletTransactions.filter(t => new Date(t.created_at) >= startOfMonth);
          
          const monthlyReceived = monthlyTx
            .filter(t => (t.type === 'deposit' || t.type === 'payment') && t.status === 'completed')
            .reduce((sum, t) => sum + Number(t.amount), 0);
          
          const monthlyWithdrawn = monthlyTx
            .filter(t => t.type === 'withdrawal' && t.status === 'completed')
            .reduce((sum, t) => sum + Number(t.amount), 0);

          statsMap[wallet.id] = {
            monthlyReceived,
            monthlyWithdrawn,
            transactionCount: monthlyTx.length,
          };
        });
        setWalletStats(statsMap);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { title: "Utilisateurs", value: stats.totalUsers, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
    { title: "Partenaires", value: stats.totalPartners, icon: Handshake, color: "text-purple-500", bg: "bg-purple-50" },
    { title: "Boutiques", value: stats.totalShops, icon: Store, color: "text-green-500", bg: "bg-green-50" },
    { title: "Produits", value: stats.totalProducts, icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Services", value: stats.totalServices, icon: Briefcase, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  const secondaryStats = [
    { title: "Partenaires en attente", value: stats.pendingPartners, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { title: "Boutiques à valider", value: stats.pendingShops, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Boutiques VIP", value: stats.vipShops, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Expéditions totales", value: stats.totalShipments, icon: Truck, color: "text-[#966442]", bg: "bg-[#966442]/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-[#966442]">Vue d'ensemble</h1>
        <p className="text-muted-foreground">Bienvenue sur le tableau de bord Loummel</p>
      </div>

      {/* Wallet Cards - Mobile Money */}
      <div>
        <h2 className="text-lg font-semibold text-[#966442] mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Portefeuilles Mobile Money
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {wallets.map(wallet => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              stats={walletStats[wallet.id] || { monthlyReceived: 0, monthlyWithdrawn: 0, transactionCount: 0 }}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-[#966442]/10 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {secondaryStats.map((stat) => (
          <Card key={stat.title} className="border-[#966442]/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Card */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-[#966442]/20 bg-gradient-to-br from-[#966442]/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-[#966442] flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Revenus Estimés (Abonnements)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#966442]">{formatPrice(stats.estimatedRevenue)}</p>
            <p className="text-sm text-muted-foreground mt-1">Basé sur les boutiques actives</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-transparent">
          <CardHeader>
            <CardTitle className="text-purple-600 flex items-center gap-2">
              <Handshake className="w-5 h-5" />
              Commissions Partenaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{formatPrice(stats.totalCommissions)}</p>
            <p className="text-sm text-muted-foreground mt-1">Total des commissions versées</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
