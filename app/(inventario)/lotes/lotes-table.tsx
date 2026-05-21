"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MagnifyingGlassIcon, PencilIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoteForm } from "./lote-form";
import { type LoteFormValues } from "@/lib/schemas/lote";

type Lote = {
  id_lote: number;
  codigo_lote: string;
  id_producto: number;
  nombre: string;
  cantidad_inicial: number;
  cantidad_actual: number;
  fecha_entrada: string;
  fecha_vencimiento: string;
};

export function LotesTable() {
  const [data, setData] = useState<Lote[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Lote | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch lotes
  async function fetchLotes() {
    const res = await fetch("/api/lotes");
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    fetchLotes();
  }, []);

  // Limpiar error cuando cierra el diálogo
  useEffect(() => {
    if (!deleteOpen) {
      setDeleteError(null);
    }
  }, [deleteOpen]);

  // Handlers
  async function handleAdd(formData: LoteFormValues) {
    await fetch("/api/lotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setAddOpen(false);
    fetchLotes();
  }

  async function handleEdit(formData: LoteFormValues) {
    if (!selected) return;
    await fetch(`/api/lotes/${selected.id_lote}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setEditOpen(false);
    fetchLotes();
  }

  async function handleDelete() {
    if (!selected) return;
    setDeleteError(null);

    const res = await fetch(`/api/lotes/${selected.id_lote}`, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json();
      setDeleteError(data.error || "Error al eliminar el lote");
      return;
    }

    setDeleteOpen(false);
    fetchLotes();
  }

  function openEdit(lote: Lote) {
    setSelected(lote);
    setEditOpen(true);
  }

  function openDelete(lote: Lote) {
    setSelected(lote);
    setDeleteOpen(true);
  }

  // Columns
  const columns: ColumnDef<Lote>[] = [
    { accessorKey: "codigo_lote", header: "Código del Lote" },
    { accessorKey: "nombre", header: "Producto" },
    { accessorKey: "cantidad_inicial", header: "Cantidad Inicial" },
    { accessorKey: "cantidad_actual", header: "Cantidad Actual" },
    {
      accessorKey: "fecha_entrada",
      header: "Fecha de Entrada",
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return new Date(date).toLocaleDateString("es-GT");
      },
    },
    {
      accessorKey: "fecha_vencimiento",
      header: "Fecha de Vencimiento",
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return new Date(date).toLocaleDateString("es-GT");
      },
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

  // Table instance
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Buscar..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon /> Agregar Lote
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Lote</DialogTitle>
            </DialogHeader>
            <LoteForm key={String(addOpen)} onSubmit={handleAdd} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

      {/* Dialog Editar */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Lote</DialogTitle>
          </DialogHeader>
          <LoteForm
            key={selected?.id_lote}
            defaultValues={
              selected
                ? {
                    codigo_lote: selected.codigo_lote,
                    id_producto: selected.id_producto,
                    cantidad_inicial: selected.cantidad_inicial,
                    cantidad_actual: selected.cantidad_actual,
                    fecha_entrada: new Date(selected.fecha_entrada).toISOString().split("T")[0],
                    fecha_vencimiento: new Date(selected.fecha_vencimiento).toISOString().split("T")[0],
                  }
                : undefined
            }
            onSubmit={handleEdit}
            submitLabel="Guardar cambios"
          />
        </DialogContent>
      </Dialog>

      {/* AlertDialog Eliminar */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteError ? "No se puede eliminar" : "¿Eliminar lote?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteError
                ? deleteError
                : `Esta acción no se puede deshacer. Se eliminará el lote ${selected?.codigo_lote}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {deleteError ? (
              <AlertDialogCancel>Entendido</AlertDialogCancel>
            ) : (
              <>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDelete}>
                  Eliminar
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
