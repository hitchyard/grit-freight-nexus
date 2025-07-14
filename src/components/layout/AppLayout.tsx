import { useState } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  userRole?: "admin" | "broker" | "trucker" | null;
}

export function AppLayout({ children, userRole }: AppLayoutProps) {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  if (isHomePage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar userRole={userRole} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="h-full px-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-3">
                  <img 
                    src="/lovable-uploads/79745459-cb4e-4d64-9fd5-706909b5925b.png" 
                    alt="Hitchyard" 
                    className="h-8 w-auto"
                  />
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-bold text-foreground">Hitchyard</h1>
                    <p className="text-xs text-muted-foreground">Load Board for Short Kings</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {userRole && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    <span className="capitalize text-muted-foreground">{userRole}</span>
                  </div>
                )}
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}