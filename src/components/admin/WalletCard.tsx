import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Activity, Loader2 } from "lucide-react";

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

interface WalletCardProps {
  wallet: WalletData;
  stats: WalletStats;
  isLoading?: boolean;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
};

const operatorConfig: Record<string, { name: string; color: string; bgColor: string; logo: string }> = {
  mtn_momo: {
    name: "MTN Mobile Money",
    color: "#FFCC00",
    bgColor: "bg-[#FFCC00]/10",
    logo: "📱",
  },
  orange_money: {
    name: "Orange Money",
    color: "#FF6600",
    bgColor: "bg-[#FF6600]/10",
    logo: "📱",
  },
};

export function WalletCard({ wallet, stats, isLoading }: WalletCardProps) {
  const config = operatorConfig[wallet.operator] || {
    name: wallet.operator,
    color: "#966442",
    bgColor: "bg-[#966442]/10",
    logo: "💳",
  };

  if (isLoading) {
    return (
      <Card className="border-[#966442]/20">
        <CardContent className="pt-6 flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-[#966442]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-l-4 shadow-md hover:shadow-lg transition-shadow`} style={{ borderLeftColor: config.color }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.logo}</span>
            <CardTitle className="text-lg font-semibold" style={{ color: config.color }}>
              {config.name}
            </CardTitle>
          </div>
          <div className={`p-2 rounded-full ${config.bgColor}`}>
            <Activity className="w-4 h-4" style={{ color: config.color }} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Balance */}
        <div>
          <p className="text-sm text-muted-foreground">Solde disponible</p>
          <p className="text-2xl font-bold text-foreground">{formatPrice(wallet.balance)}</p>
        </div>

        {/* Pending Balance */}
        <div className={`p-3 rounded-lg ${config.bgColor}`}>
          <p className="text-xs text-muted-foreground">En attente de validation</p>
          <p className="text-lg font-semibold" style={{ color: config.color }}>
            {formatPrice(wallet.pending_balance)}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground mb-2">Ce mois</p>
          
          {/* Monthly Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded bg-green-100">
                <ArrowUpRight className="w-3 h-3 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reçus</p>
                <p className="text-sm font-semibold text-green-600">
                  +{formatPrice(stats.monthlyReceived)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded bg-red-100">
                <ArrowDownRight className="w-3 h-3 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Retirés</p>
                <p className="text-sm font-semibold text-red-600">
                  -{formatPrice(stats.monthlyWithdrawn)}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Count */}
          <div className="mt-3 flex items-center gap-1 text-muted-foreground">
            <Activity className="w-3 h-3" />
            <span className="text-xs">{stats.transactionCount} transactions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
