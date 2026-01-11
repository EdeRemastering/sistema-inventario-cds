"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Boxes,
  FolderTree,
  Package2,
  ClipboardList,
  FileText,
  Ticket,
  ListChecks,
  Users,
  BarChart3,
  LogOut,
  MapPin,
  Wrench,
  FileCheck,
  Bell,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "../ui/theme-toggle";
import { CDSLogo } from "../ui/cds-logo";
import { actionGetMantenimientosPendientes } from "@/modules/mantenimientos/actions";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: "mantenimientos";
};

const items: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/categorias", label: "Categorías", icon: FolderTree },
  { href: "/subcategorias", label: "Subcategorías", icon: Boxes },
  { href: "/ubicaciones", label: "Ubicaciones", icon: MapPin },
  { href: "/elementos", label: "Elementos", icon: Package2 },
  { href: "/movimientos", label: "Movimientos", icon: ClipboardList },
  { href: "/mantenimientos", label: "Mantenimientos", icon: Wrench, badge: "mantenimientos" },
  { href: "/hojas-vida", label: "Hojas de Vida", icon: FileCheck },
  { href: "/observaciones", label: "Observaciones", icon: FileText },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/usuarios", label: "Usuarios", icon: Users },
  { href: "/logs", label: "Logs", icon: ListChecks },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mantenimientosPendientes, setMantenimientosPendientes] = useState<number>(0);

  // Cargar conteo de mantenimientos pendientes
  useEffect(() => {
    const loadPendientes = async () => {
      try {
        const count = await actionGetMantenimientosPendientes();
        setMantenimientosPendientes(count);
      } catch (error) {
        console.error("Error cargando mantenimientos pendientes:", error);
      }
    };

    loadPendientes();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(loadPendientes, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-3">
            <CDSLogo size="md" showText={true} />
          </div>
          <ThemeToggle />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ href, label, icon: Icon, badge }) => {
                const active = pathname === href;
                const showBadge = badge === "mantenimientos" && mantenimientosPendientes > 0;
                
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={label}
                    >
                      <Link href={href} className="relative">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                        {showBadge && (
                          <span className="absolute -top-1 -right-1 flex items-center justify-center">
                            <span className="relative flex h-5 min-w-5 items-center justify-center">
                              <Bell className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                {mantenimientosPendientes > 99 ? "99+" : mantenimientosPendientes}
                              </span>
                            </span>
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {session?.user && (
                <SidebarMenuItem>
                  <div className="flex flex-col gap-1 px-2 py-1">
                    <div className="text-sm font-medium text-sidebar-foreground">
                      {session.user.name}
                    </div>
                    <div className="text-xs text-sidebar-foreground/70">
                      Usuario autenticado
                    </div>
                  </div>
                </SidebarMenuItem>
              )}
              <SidebarSeparator />
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  tooltip="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
