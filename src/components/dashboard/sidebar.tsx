"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { ThemeToggle } from "../ui/theme-toggle";
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
} from "lucide-react";

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
  return (
    <aside className="hidden border-r bg-card/50 sm:block sm:w-64">
      <div className="flex items-center justify-between p-4">
        <div className="text-lg font-semibold text-primary">Sistema CDs</div>
        <ThemeToggle />
      </div>
      <nav className="grid gap-1 p-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                active && "bg-primary text-primary-foreground font-medium"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
