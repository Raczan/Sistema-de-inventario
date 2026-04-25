import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function InventarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = {
    name: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
  };

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
