import { LayoutDashboard, Store, Truck, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard, tab: "overview" },
  { title: "Boutiques", url: "/dashboard/admin?tab=boutiques", icon: Store, tab: "boutiques" },
  { title: "Wanda Services", url: "/dashboard/admin?tab=wanda", icon: Truck, tab: "wanda" },
  { title: "Paramètres", url: "/dashboard/admin?tab=settings", icon: Settings, tab: "settings" },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r border-[#966442]/20 bg-gradient-to-b from-[#966442]/5 to-background`}
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-[#966442]/20">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#966442] flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-display font-bold text-[#966442]">LOUMMEL</h2>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-xl bg-[#966442] flex items-center justify-center mx-auto">
              <Store className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "sr-only" : ""} text-[#966442]/70 text-xs uppercase tracking-wider`}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = activeTab === item.tab;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.tab)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#966442] text-white shadow-md"
                          : "hover:bg-[#966442]/10 text-foreground"
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#966442]"}`} />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-[#966442]/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-center mb-2 hover:bg-[#966442]/10"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-[#966442]" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 text-[#966442] mr-2" />
              <span className="text-sm">Réduire</span>
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className={`w-full ${collapsed ? "justify-center" : "justify-start"} text-destructive hover:bg-destructive/10`}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Déconnexion</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
