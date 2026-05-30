"use client";

import Link from "next/link";
import {
  PackageIcon,
  ArchiveBoxIcon,
  ReceiptIcon,
  TruckIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const sections = [
  {
    title: "Productos",
    description: "Gestiona el catálogo de productos disponibles en el sistema.",
    href: "/productos",
    icon: PackageIcon,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    title: "Lotes",
    description: "Consulta y administra los lotes de inventario registrados.",
    href: "/lotes",
    icon: ArchiveBoxIcon,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    title: "Ventas",
    description: "Registra y revisa el historial de ventas realizadas.",
    href: "/ventas",
    icon: ReceiptIcon,
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  {
    title: "Proveedores",
    description: "Administra los proveedores asociados al inventario.",
    href: "/proveedores",
    icon: TruckIcon,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
];

export default function DashboardPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-8 p-8 pt-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bienvenido al sistema de inventario
          </h1>
          <p className="text-muted-foreground">
            Desde aquí puedes gestionar productos, lotes, ventas y proveedores.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {sections.map(({ title, description, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl border bg-card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              <div
                className={`flex size-10 items-center justify-center rounded-lg ${color}`}
              >
                <Icon className="size-5" />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted-foreground leading-snug">
                  {description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                Ir a {title}
                <ArrowRightIcon className="size-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
