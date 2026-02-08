import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { ShopsManagement } from "@/components/admin/ShopsManagement";
import { WandaServicesTab } from "@/components/admin/WandaServicesTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading, roles } = useAuth();
  
  // Get active tab from URL or default to "overview"
  const activeTab = searchParams.get("tab") || "overview";

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!loading && (!user || !roles.includes("super_admin"))) {
      navigate("/backoffice");
    }
  }, [user, loading, roles, navigate]);

  const handleTabChange = (tab: string) => {
    if (tab === "overview") {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "boutiques":
        return <ShopsManagement />;
      case "wanda":
        return <WandaServicesTab />;
      case "settings":
        return <SettingsTab />;
      case "overview":
      default:
        return <DashboardOverview />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#966442]" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        
        <div className="flex-1 flex flex-col">
          <AdminHeader onTabChange={handleTabChange} />
          
          <main className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
