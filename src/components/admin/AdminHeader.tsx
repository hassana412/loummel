import { Bell, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const shopCategories = [
  "Alimentation",
  "Mode & Vêtements",
  "Électronique",
  "Artisanat",
  "Services",
  "Restauration",
  "Beauté & Bien-être",
  "Mobilier",
];

interface AdminHeaderProps {
  onTabChange: (tab: string) => void;
}

export function AdminHeader({ onTabChange }: AdminHeaderProps) {
  const { toggleSidebar } = useSidebar();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: any) => {
    await markAsRead(notification.id);
    
    // If it's a new shop notification, navigate to boutiques tab with shop highlight
    if (notification.type === "new_shop" && notification.related_id) {
      navigate(`/dashboard/admin?tab=boutiques&shop=${notification.related_id}`);
    }
  };

  return (
    <header className="h-16 border-b border-[#966442]/20 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden hover:bg-[#966442]/10"
          >
            <Menu className="w-5 h-5 text-[#966442]" />
          </Button>

          {/* Categories Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[#966442]/30 hover:bg-[#966442]/10">
                Catégories de boutiques
                <ChevronDown className="w-4 h-4 ml-2 text-[#966442]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {shopCategories.map((category) => (
                <DropdownMenuItem key={category} className="cursor-pointer">
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-[#966442]/10">
                <Bell className="w-5 h-5 text-[#966442]" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-destructive text-white text-xs">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-3 py-2 border-b">
                <h4 className="font-semibold text-[#966442]">Notifications</h4>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Aucune notification
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notif) => (
                    <DropdownMenuItem
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                        !notif.is_read ? "bg-[#966442]/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="font-medium text-sm">{notif.title}</span>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-[#966442] ml-auto" />
                        )}
                      </div>
                      {notif.message && (
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {notif.message}
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:flex items-center gap-2 pl-4 border-l">
            <div className="w-8 h-8 rounded-full bg-[#966442] flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="text-sm font-medium">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
