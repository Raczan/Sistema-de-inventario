"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";

import { ProductoForm } from "./producto-form";
import { type ProductoFormValues } from "@/lib/schemas/producto";

// ── Tipo local ────────────────────────────────────────────────────────────────
type Producto = {
  id_producto: number;
  sku: string;
  nombre: string;
  nombre_proveedor: string | null;
  precio_venta: number;
  disponible: boolean;
  creado_en: string;
  descripcion: string | null;
  ingredientes: string;
  tipo_producto: string;
  presentacion: string;
  unidades_por_empaque: number;
  precio_compra: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(value);
}

// ── Componente principal ──────────────────────────────────────────────────────
export function ProductosTable() {
  const [data, setData] = useState<Producto[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Producto | null>(null);

  async function fetchProductos() {
    const res = await fetch("/api/productos");
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    fetchProductos();
  }, []);

  async function handleAdd(formData: ProductoFormValues) {
    await fetch("/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setAddOpen(false);
    fetchProductos();
  }

  async function handleEdit(formData: ProductoFormValues) {
    if (!selected) return;
    await fetch(`/api/productos/${selected.id_producto}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, disponible: selected.disponible }),
    });
    setEditOpen(false);
    fetchProductos();
  }

  async function handleDelete() {
    if (!selected) return;
    await fetch(`/api/productos/${selected.id_producto}`, {
      method: "DELETE",
    });
    setDeleteOpen(false);
    fetchProductos();
  }

  function openEdit(producto: Producto) {
    setSelected(producto);
    setEditOpen(true);
  }

  function openDelete(producto: Producto) {
    setSelected(producto);
    setDeleteOpen(true);
  }

  const columns: ColumnDef<Producto>[] = [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs">{getValue<string>()}</span>
      ),
    },
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "tipo_producto", header: "Tipo" },
    { accessorKey: "presentacion", header: "Presentación" },
    {
      accessorKey: "precio_compra",
      header: "P. Compra",
      cell: ({ getValue }) => (
        <span className="text-right block">
          {formatCurrency(getValue<number>())}
        </span>
      ),
    },
    {
      accessorKey: "precio_venta",
      header: "P. Venta",
      cell: ({ getValue }) => (
        <span className="text-right block">
          {formatCurrency(getValue<number>())}
        </span>
      ),
    },
    {
      accessorKey: "unidades_por_empaque",
      header: "Unid./Empaque",
      cell: ({ getValue }) => (
        <span className="text-center block">{getValue<number>()}</span>
      ),
    },
    //Campo de proveedor agregado a la tabla
    {
      accessorKey: "nombre_proveedor",
      header: "Proveedor",
      cell: ({getValue}) => getValue<string>() ?? "-",
    },
    {
      accessorKey: "disponible",
      header: "Estado",
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Badge variant="default">Disponible</Badge>
        ) : (
          <Badge variant="secondary">No disponible</Badge>
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

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Buscar productos…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2" />
              Agregar producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo producto</DialogTitle>
            </DialogHeader>
            <ProductoForm key={String(addOpen)} onSubmit={handleAdd} />
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
                  No se encontraron productos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog: Editar */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
          </DialogHeader>
          <ProductoForm
            key={selected?.id_producto}
            defaultValues={
              selected
                ? {
                    sku: selected.sku,
                    nombre: selected.nombre,
                    precio_venta: selected.precio_venta,
                    disponible: selected.disponible,
                    descripcion: selected.descripcion ?? "",
                    ingredientes: selected.ingredientes,
                    tipo_producto: selected.tipo_producto,
                    presentacion: selected.presentacion,
                    unidades_por_empaque: selected.unidades_por_empaque,
                    precio_compra: selected.precio_compra,
                  }
                : undefined
            }
            onSubmit={handleEdit}
            submitLabel="Guardar cambios"
          />
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Eliminar */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará{" "}
              <strong>{selected?.nombre}</strong> (SKU: {selected?.sku}) y todo
              su detalle asociado.
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
