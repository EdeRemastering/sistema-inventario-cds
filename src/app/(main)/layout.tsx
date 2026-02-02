import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import { DashboardSidebar } from "../../components/dashboard/sidebar";
import { SidebarHeader } from "../../components/dashboard/sidebar-header";
import { ThemeProvider } from "../../contexts/theme-context";
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar";
import { AppTourProvider } from "../../components/tour/app-tour-provider";

export const runtime = "nodejs";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <ThemeProvider>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <SidebarHeader />
          <AppTourProvider />
          <main className="p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
