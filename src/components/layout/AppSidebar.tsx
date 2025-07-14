import { useLocation, NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  Truck, 
  Package, 
  MessageSquare, 
  FileText, 
  Users, 
  Star,
  DollarSign,
  BarChart3,
  Settings,
  UserPlus,
  Target,
  Clock,
  TrendingUp
} from "lucide-react";

interface AppSidebarProps {
  userRole?: "admin" | "broker" | "trucker" | null;
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary border-r-2 border-primary" : "hover:bg-accent";

  // Different navigation items based on user role
  const brokerNavItems = [
    { title: "Dashboard", url: "/broker", icon: BarChart3 },
    { title: "Post Load", url: "/broker/post-load", icon: Package },
    { title: "My Loads", url: "/broker/loads", icon: Truck },
    { title: "Bookings", url: "/broker/bookings", icon: FileText },
    { title: "Chat", url: "/broker/chat", icon: MessageSquare },
    { title: "My Truckers", url: "/broker/truckers", icon: Users },
    { title: "Invite Trucker", url: "/broker/invite", icon: UserPlus },
    { title: "Payments", url: "/broker/payments", icon: DollarSign },
    { title: "Ratings", url: "/broker/ratings", icon: Star },
  ];

  const truckerNavItems = [
    { title: "Dashboard", url: "/trucker", icon: BarChart3 },
    { title: "Available Loads", url: "/trucker/loads", icon: Package },
    { title: "My Bookings", url: "/trucker/bookings", icon: FileText },
    { title: "Chat", url: "/trucker/chat", icon: MessageSquare },
    { title: "Lane Profile", url: "/trucker/profile", icon: Target },
    { title: "Earnings", url: "/trucker/earnings", icon: DollarSign },
    { title: "Delivery History", url: "/trucker/history", icon: Clock },
    { title: "Speed Score", url: "/trucker/score", icon: TrendingUp },
  ];

  const adminNavItems = [
    { title: "Dashboard", url: "/admin", icon: BarChart3 },
    { title: "Broker Applications", url: "/admin/applications", icon: UserPlus },
    { title: "All Loads", url: "/admin/loads", icon: Package },
    { title: "Users", url: "/admin/users", icon: Users },
    { title: "Payments", url: "/admin/payments", icon: DollarSign },
    { title: "Analytics", url: "/admin/analytics", icon: TrendingUp },
    { title: "Settings", url: "/admin/settings", icon: Settings },
  ];

  const getNavItems = () => {
    switch (userRole) {
      case "broker":
        return brokerNavItems;
      case "trucker":
        return truckerNavItems;
      case "admin":
        return adminNavItems;
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const isExpanded = navItems.some((item) => isActive(item.url));

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-semibold tracking-wide">
            {userRole ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Panel` : "Navigation"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}