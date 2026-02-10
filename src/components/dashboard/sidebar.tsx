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
  Ticket,
  ListChecks,
  Users,
  BarChart3,
  LineChart,
  LogOut,
  MapPin,
  Wrench,
  FileCheck,
  CircleHelp,
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
  tourId?: string;
};

const items: NavItem[] = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: LayoutDashboard,
    tourId: "nav-inicio",
  },
  { href: "/usuarios", label: "Usuarios", icon: Users, tourId: "nav-usuarios" },
  {
    href: "/ubicaciones",
    label: "Ubicaciones",
    icon: MapPin,
    tourId: "nav-ubicaciones",
  },
  {
    href: "/categorias",
    label: "Categorías",
    icon: FolderTree,
    tourId: "nav-categorias",
  },
  {
    href: "/subcategorias",
    label: "Subcategorías",
    icon: Boxes,
    tourId: "nav-subcategorias",
  },
  {
    href: "/elementos",
    label: "Elementos",
    icon: Package2,
    tourId: "nav-elementos",
  },
  {
    href: "/mantenimientos",
    label: "Mantenimientos",
    icon: Wrench,
    badge: "mantenimientos",
    tourId: "nav-mantenimientos",
  },
  {
    href: "/hojas-vida",
    label: "Hojas de Vida",
    icon: FileCheck,
    tourId: "nav-hojas-vida",
  },
  { href: "/tickets", label: "Tickets", icon: Ticket, tourId: "nav-tickets" },
  {
    href: "/kpis/mantenimientos",
    label: "KPIs",
    icon: LineChart,
    tourId: "nav-kpis",
  },
  {
    href: "/reportes",
    label: "Reportes",
    icon: BarChart3,
    tourId: "nav-reportes",
  },
  { href: "/logs", label: "Logs", icon: ListChecks, tourId: "nav-logs" },
  {
    href: "/tutorial",
    label: "Tutorial",
    icon: CircleHelp,
    tourId: "nav-tutorial",
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mantenimientosPendientes, setMantenimientosPendientes] =
    useState<number>(0);

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
            <SidebarMenu data-tour="sidebar-menu">
              {items.map(({ href, label, icon: Icon, badge, tourId }) => {
                const active = pathname === href;
                const showBadge =
                  badge === "mantenimientos" && mantenimientosPendientes > 0;

                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={label}
                      // Por defecto el sidebar button tiene `overflow-hidden`, lo que recorta badges.
                      // Solo lo abrimos cuando hay badge visible.
                      className={
                        showBadge
                          ? "overflow-visible pr-10 group-data-[collapsible=icon]:pr-2"
                          : undefined
                      }
                    >
                      <Link href={href} className="relative" data-tour={tourId}>
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                        {showBadge && (
                          // Solo círculo con número (alerta)
                          <span className="ml-auto relative flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-sidebar shrink-0">
                            {mantenimientosPendientes > 99
                              ? "99+"
                              : mantenimientosPendientes}
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
