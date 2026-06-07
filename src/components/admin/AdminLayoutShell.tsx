import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Handshake, Store, Users, Wallet, Package, LogOut, Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/admin/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, end: true },
  { to: "/admin/partenaires", label: "Partenaires", icon: Handshake },
  { to: "/admin/boutiques", label: "Boutiques", icon: Store },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/finances", label: "Finances", icon: Wallet },
  { to: "/admin/produits", label: "Produits & Services", icon: Package },
];

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AdminLayoutShell({ title, subtitle, children }: Props) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-screen">
        <div className="h-16 px-5 flex items-center gap-3" style={{ backgroundColor: "#E8500A" }}>
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-none">Loummel</h1>
            <p className="text-white/80 text-xs mt-0.5">Admin</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#E8500A] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="font-bold text-slate-900 text-lg leading-none">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
