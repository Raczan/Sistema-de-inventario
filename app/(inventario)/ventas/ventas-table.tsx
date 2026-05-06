"use client";

import { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PencilIcon, TrashIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";

import { type VentaFormValues } from "@/lib/schemas/venta";
import { VentaForm } from "./venta-form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Tipo local que refleja lo que devuelve GET /api/ventas
type Venta = {
  id_venta: number;
  fecha_venta: string;          // "YYYY-MM-DD"
  total: string;                // numeric llega como string desde postgres
  observacion: string | null;
  num_productos: number;
};

// Tipo extendido que devuelve GET /api/ventas/:id (para editar)
type VentaConDetalles = Venta & {
  detalles: {
    id_detalle: number;
    id_lote: number;
    cantidad_vendida: number;
    precio_unitario: string;
  }[];
};

export function VentasTable() {
  const [data, setData] = useState<Venta[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Venta | null>(null);
  const [editDefaults, setEditDefaults] = useState<
    Partial<VentaFormValues> | undefined
  >(undefined);

  // ── Fetch ──────────────────────────────────────────────────────────────
  async function fetchVentas() {
    const res = await fetch("/api/ventas");
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    fetchVentas();
  }, []);

  // ── CRUD handlers ──────────────────────────────────────────────────────
  async function handleAdd(data: VentaFormValues) {
    await fetch("/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setAddOpen(false);
    fetchVentas();
  }

  async function handleEdit(data: VentaFormValues) {
    if (!selected) return;
    await fetch(`/api/ventas/${selected.id_venta}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditOpen(false);
    fetchVentas();
  }

  async function handleDelete() {
    if (!selected) return;
    await fetch(`/api/ventas/${selected.id_venta}`, { method: "DELETE" });
    setDeleteOpen(false);
    fetchVentas();
  }

  async function openEdit(venta: Venta) {
    setSelected(venta);
    // Cargamos los detalles para poblar el formulario
    const res = await fetch(`/api/ventas/${venta.id_venta}`);
    const full: VentaConDetalles = await res.json();
    setEditDefaults({
      fecha_venta: full.fecha_venta,
      observacion: full.observacion ?? "",
      detalles: full.detalles.map((d) => ({
        id_lote: d.id_lote,
        cantidad_vendida: d.cantidad_vendida,
        precio_unitario: Number(d.precio_unitario),
      })),
    });
    setEditOpen(true);
  }

  function openDelete(venta: Venta) {
    setSelected(venta);
    setDeleteOpen(true);
  }

  // ── Columnas TanStack Table ────────────────────────────────────────────
  const columns: ColumnDef<Venta>[] = [
    {
      accessorKey: "id_venta",
      header: "# Venta",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          #{row.original.id_venta}
        </span>
      ),
    },
    {
      accessorKey: "fecha_venta",
      header: "Fecha",
      cell: ({ row }) => {
        // slice(0,10) garantiza "YYYY-MM-DD" sin importar si postgres
        // devuelve timestamp completo. Mediodía evita desfases de timezone.
        const fecha = new Date(
          row.original.fecha_venta.slice(0, 10) + "T12:00:00",
        );
        return fecha.toLocaleDateString("es-GT", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    },
    {
      accessorKey: "num_productos",
      header: "Productos",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.num_productos} línea
          {row.original.num_productos !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums">
          Q {Number(row.original.total).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "observacion",
      header: "Observación",
      cell: ({ row }) => (
        <span className="text-muted-foreground truncate max-w-[180px] block">
          {row.original.observacion ?? "—"}
        </span>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => openEdit(row.original)}
          >
            <PencilIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => openDelete(row.original)}
          >
            <TrashIcon className="text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Buscar venta…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Dialog: Nueva venta */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>Nueva venta</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nueva venta</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
              <VentaForm key={String(addOpen)} onSubmit={handleAdd} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-8"
                >
                  No se encontraron registros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog: Editar venta */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar venta #{selected?.id_venta}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
            {editDefaults && (
              <VentaForm
                key={selected?.id_venta}
                defaultValues={editDefaults}
                onSubmit={handleEdit}
                submitLabel="Guardar cambios"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Eliminar venta */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar venta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la venta{" "}
              <strong>#{selected?.id_venta}</strong> y todos sus detalles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}