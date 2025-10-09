import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import { DashboardSidebar } from "../../components/dashboard/sidebar";
import { SidebarHeader } from "../../components/dashboard/sidebar-header";
import { ThemeProvider } from "../../contexts/theme-context";
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  console.log(session);
  if (!session) redirect("/login");

  return (
    <ThemeProvider>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <SidebarHeader />
          <main className="p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
