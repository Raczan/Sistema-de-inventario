@AGENTS.md

---

# Patrones de referencia — pantalla Proveedores

Esta sección documenta el patrón canónico para construir pantallas CRUD en este proyecto. La ruta `proveedores` es la referencia; replicar exactamente esta estructura en todas las pantallas nuevas.

---

## Estructura de archivos

Cada entidad vive en su propia carpeta bajo `app/(inventario)/`:

```
app/(inventario)/proveedores/
  page.tsx              ← layout de la pantalla (breadcrumb + contenedor)
  proveedores-table.tsx ← tabla con datos, dialogs de CRUD, filtro
  proveedor-form.tsx    ← formulario reutilizable para crear y editar

app/api/proveedores/
  route.ts              ← GET (lista) + POST (crear)
  [id]/route.ts         ← PUT (editar) + DELETE (eliminar)

lib/schemas/
  proveedor.ts          ← schema Zod + tipo inferido
```

---

## 1. Base de datos — `lib/db/index.ts`

Cliente `postgres` (paquete `postgres`, no `pg`). Se importa como `sql` y se usa como template literal. La conexión lee `DATABASE_URL` del entorno con SSL obligatorio.

```ts
import sql from "@/lib/db";

// Query de sólo lectura
const rows = await sql`SELECT * FROM proveedores ORDER BY nombre_proveedor ASC`;

// Query con parámetros (escapado automático, sin interpolación manual)
const [row] = await sql`
  INSERT INTO proveedores (nombre_proveedor, nit_proveedor)
  VALUES (${nombre_proveedor}, ${nit_proveedor})
  RETURNING *
`;
```

- **Nunca** concatenar strings para construir queries; usar siempre el template literal de `postgres`.
- Desestructurar el array cuando se espera una sola fila: `const [row] = await sql\`...\``.

---

## 2. API Layer — Route Handlers de Next.js

Ubicación: `app/api/<entidad>/route.ts` y `app/api/<entidad>/[id]/route.ts`.

**`route.ts` — colección (sin ID):**

```ts
import sql from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await sql`SELECT ... FROM tabla ORDER BY campo ASC`;
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { campo1, campo2 } = body;
  const [row] = await sql`INSERT INTO tabla (...) VALUES (${campo1}, ${campo2}) RETURNING *`;
  return NextResponse.json(row, { status: 201 });
}
```

**`[id]/route.ts` — recurso individual:**

```ts
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;   // params es una Promise en esta versión de Next.js
  const body = await request.json();
  // ... update query
  return NextResponse.json(row);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM tabla WHERE id_campo = ${id}`;
  return new NextResponse(null, { status: 204 });
}
```

> **Importante:** `params` es una `Promise` en esta versión de Next.js. Siempre `await params` antes de desestructurar.

---

## 3. Schema de validación — `lib/schemas/<entidad>.ts`

Zod para validar tanto el formulario (cliente) como potencialmente el body del API.

```ts
import { z } from "zod";

export const entidadSchema = z.object({
  campo_requerido: z.string().min(2, "Mensaje de error"),
  campo_opcional: z.string(),
});

export type EntidadFormValues = z.infer<typeof entidadSchema>;
```

- El tipo `FormValues` se infieres del schema con `z.infer<>`.
- El schema se importa tanto en el form como en la tabla para tipado consistente.

---

## 4. Formulario — `<entidad>-form.tsx`

Componente "tonto": recibe `onSubmit`, `defaultValues` y `submitLabel`. No sabe nada de fetch ni de dialogs.

```tsx
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entidadSchema, type EntidadFormValues } from "@/lib/schemas/entidad";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  defaultValues?: Partial<EntidadFormValues>;
  onSubmit: (data: EntidadFormValues) => Promise<void>;
  submitLabel?: string;
};

export function EntidadForm({ defaultValues, onSubmit, submitLabel = "Guardar" }: Props) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<EntidadFormValues>({
    resolver: zodResolver(entidadSchema),
    defaultValues: { campo: "", ...defaultValues },
  });

  function submit(data: EntidadFormValues) {
    startTransition(async () => { await onSubmit(data); });
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.campo}>
          <FieldLabel htmlFor="campo">Etiqueta</FieldLabel>
          <Input id="campo" placeholder="..." {...register("campo")} />
          <FieldError errors={[errors.campo]} />
        </Field>
        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner />}
            {submitLabel}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
```

Componentes de shadcn usados en forms:
- `Field` — wrapper de cada campo, acepta `data-invalid` para estado de error.
- `FieldLabel` — label accesible vinculado al `id` del input.
- `FieldError` — muestra mensajes de error de Zod; recibe array de `FieldErrors`.
- `FieldGroup` — contenedor vertical de todos los `Field`.
- `Input` — input base de shadcn.
- `Button` con `disabled={isPending}` + `<Spinner />` para feedback de carga.

---

## 5. Tabla CRUD — `<entidades>-table.tsx`

Componente principal de la pantalla. Maneja: fetch de datos, estado de dialogs, TanStack Table y todos los handlers.

### 5a. Tipo local

Definir un tipo local para los datos que devuelve el API (no importar desde la base de datos):

```ts
type Entidad = {
  id_entidad: number;
  campo1: string;
  campo2: string;
  activo: boolean;
};
```

### 5b. Estado

```ts
const [data, setData] = useState<Entidad[]>([]);
const [globalFilter, setGlobalFilter] = useState("");
const [addOpen, setAddOpen] = useState(false);
const [editOpen, setEditOpen] = useState(false);
const [deleteOpen, setDeleteOpen] = useState(false);
const [selected, setSelected] = useState<Entidad | null>(null);
```

### 5c. Fetch con `useEffect`

```ts
async function fetchEntidades() {
  const res = await fetch("/api/entidades");
  const json = await res.json();
  setData(json);
}

useEffect(() => { fetchEntidades(); }, []);
```

### 5d. Handlers de CRUD

```ts
async function handleAdd(data: EntidadFormValues) {
  await fetch("/api/entidades", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  setAddOpen(false);
  fetchEntidades();
}

async function handleEdit(data: EntidadFormValues) {
  if (!selected) return;
  await fetch(`/api/entidades/${selected.id_entidad}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, activo: selected.activo }),
  });
  setEditOpen(false);
  fetchEntidades();
}

async function handleDelete() {
  if (!selected) return;
  await fetch(`/api/entidades/${selected.id_entidad}`, { method: "DELETE" });
  setDeleteOpen(false);
  fetchEntidades();
}

function openEdit(entidad: Entidad) { setSelected(entidad); setEditOpen(true); }
function openDelete(entidad: Entidad) { setSelected(entidad); setDeleteOpen(true); }
```

### 5e. TanStack Table

```ts
import {
  ColumnDef, flexRender,
  getCoreRowModel, getFilteredRowModel, useReactTable,
} from "@tanstack/react-table";

const columns: ColumnDef<Entidad>[] = [
  { accessorKey: "campo1", header: "Etiqueta 1" },
  { accessorKey: "campo2", header: "Etiqueta 2" },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(row.original)}>
          <PencilIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => openDelete(row.original)}>
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
```

- `accessorKey` para columnas de datos simples.
- `id` + `cell` para columnas personalizadas (acciones, badges, etc.).
- `globalFilter` activa búsqueda sobre todas las columnas simultáneamente.

### 5f. Render de la tabla con shadcn

```tsx
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
          <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
            No se encontraron registros.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</div>
```

### 5g. Toolbar (filtro + botón agregar)

```tsx
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
      <Button><PlusIcon /> Agregar entidad</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader><DialogTitle>Nueva entidad</DialogTitle></DialogHeader>
      <EntidadForm key={String(addOpen)} onSubmit={handleAdd} />
    </DialogContent>
  </Dialog>
</div>
```

> `key={String(addOpen)}` en el form de "Agregar" resetea el formulario al cerrarse el dialog.  
> `key={selected?.id_entidad}` en el form de "Editar" recarga el form cuando cambia la entidad seleccionada.

### 5h. Dialog de editar y AlertDialog de eliminar

El Dialog de editar **no** usa `DialogTrigger`; se abre programáticamente con `open={editOpen}`:

```tsx
<Dialog open={editOpen} onOpenChange={setEditOpen}>
  <DialogContent>
    <DialogHeader><DialogTitle>Editar entidad</DialogTitle></DialogHeader>
    <EntidadForm
      key={selected?.id_entidad}
      defaultValues={selected ?? undefined}
      onSubmit={handleEdit}
      submitLabel="Guardar cambios"
    />
  </DialogContent>
</Dialog>
```

AlertDialog de confirmación de eliminación:

```tsx
<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
  <AlertDialogContent size="sm">
    <AlertDialogHeader>
      <AlertDialogTitle>¿Eliminar entidad?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta acción no se puede deshacer. Se eliminará <strong>{selected?.campo}</strong>.
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
```

---

## 6. Page — `page.tsx`

Thin wrapper que sólo pone el breadcrumb y llama a la tabla:

```tsx
"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { EntidadesTable } from "./entidades-table";

export default function EntidadesPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Nombre de la sección</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <EntidadesTable />
      </div>
    </>
  );
}
```

---

## 7. Íconos

Usar `@phosphor-icons/react`. Íconos comunes:
- `PencilIcon` — editar
- `TrashIcon` — eliminar
- `PlusIcon` — agregar
- `MagnifyingGlassIcon` — buscar

---

## 8. Resumen del flujo de datos

```
page.tsx
  └── <EntidadesTable />          "use client"
        ├── useEffect → GET /api/entidades → setData()
        ├── handleAdd  → POST /api/entidades → fetchEntidades()
        ├── handleEdit → PUT  /api/entidades/:id → fetchEntidades()
        ├── handleDelete → DELETE /api/entidades/:id → fetchEntidades()
        └── <EntidadForm onSubmit={handleAdd|handleEdit} />

app/api/entidades/route.ts        GET + POST  → sql`` → NextResponse.json()
app/api/entidades/[id]/route.ts   PUT + DELETE → sql`` → NextResponse.json()

lib/db/index.ts                   postgres client (template literal SQL)
lib/schemas/entidad.ts            Zod schema + inferred type
```
