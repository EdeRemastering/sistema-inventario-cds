import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import { DashboardSidebar } from "../../components/dashboard/sidebar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  console.log(session);
  if (!session) redirect("/login");

  return (
    <div className="min-h-dvh bg-background grid sm:grid-cols-[16rem_1fr]">
      <DashboardSidebar />
      <main className="p-6">{children}</main>
    </div>
  );
}
