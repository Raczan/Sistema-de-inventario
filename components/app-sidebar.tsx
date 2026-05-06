"use client";

import * as React from "react";
import {
  StackIcon,
  PackageIcon,
  ArchiveBoxIcon,
  ReceiptIcon,
  TruckIcon,
} from "@phosphor-icons/react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: <StackIcon />,
  },
  {
    title: "Productos",
    url: "/productos",
    icon: <PackageIcon />,
  },
  {
    title: "Lotes",
    url: "/lotes",
    icon: <ArchiveBoxIcon />,
  },
  {
    title: "Ventas",
    url: "/ventas",
    icon: <ReceiptIcon />,
  },
  {
    title: "Proveedores",
    url: "/proveedores",
    icon: <TruckIcon />,
  },
];

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string };
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <StackIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    Sistema inventario
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
