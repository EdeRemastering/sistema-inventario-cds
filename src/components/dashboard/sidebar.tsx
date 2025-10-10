"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
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

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const items: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/categorias", label: "Categorías", icon: FolderTree },
  { href: "/subcategorias", label: "Subcategorías", icon: Boxes },
  { href: "/elementos", label: "Elementos", icon: Package2 },
  { href: "/movimientos", label: "Movimientos", icon: ClipboardList },
  { href: "/observaciones", label: "Observaciones", icon: FileText },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/usuarios", label: "Usuarios", icon: Users },
  { href: "/logs", label: "Logs", icon: ListChecks },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-3">
            <CDSLogo size="md" showText={true} />
            {/* <div className="text-lg font-semibold text-sidebar-foreground">
              Sistema CDs
            </div> */}
          </div>
          <ThemeToggle />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={label}
                    >
                      <Link href={href}>
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
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
