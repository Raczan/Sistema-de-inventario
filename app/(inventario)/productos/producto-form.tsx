"use client";

//Se agrega el campo de proveedor al formulario de producto, con un select que carga los proveedores desde la API
import { useTransition, useState, useEffect } from "react";
import { useForm, type Resolver, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productoSchema,
  type ProductoFormValues,
} from "@/lib/schemas/producto";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  defaultValues?: Partial<ProductoFormValues>;
  onSubmit: (data: ProductoFormValues) => Promise<void>;
  submitLabel?: string;
};

export function ProductoForm({
  defaultValues,
  onSubmit,
  submitLabel = "Guardar",
}: Props) {
  const [isPending, startTransition] = useTransition();

  // Cargar proveedores para el select
  const [proveedores, setProveedores] = useState<
    {
      id_proveedor: number;
      nombre_proveedor: string;
    }[]
  >([]);
  useEffect(() => {
    fetch("/api/proveedores")
      .then((r) => r.json())
      .then(setProveedores)
      .catch(() => setProveedores([]));
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema) as Resolver<ProductoFormValues>,
    defaultValues: {
      sku: "",
      nombre: "",
      precio_venta: 0,
      disponible: true,
      descripcion: "",
      ingredientes: "",
      tipo_producto: "",
      presentacion: "",
      unidades_por_empaque: 1,
      precio_compra: 0,
      ...defaultValues,
    },
  });

  const disponible = watch("disponible");

  function submit(data: ProductoFormValues) {
    startTransition(async () => {
      await onSubmit(data);
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-2">
      {}
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide pt-1">
        Producto
      </p>

      <FieldGroup>
        <Field data-invalid={!!errors.sku}>
          <FieldLabel htmlFor="sku">SKU (13 dígitos)</FieldLabel>
          <Input
            id="sku"
            placeholder="1234567890123"
            maxLength={13}
            {...register("sku")}
          />
          <FieldError errors={[errors.sku].filter(Boolean)} />
        </Field>

        <Field data-invalid={!!errors.nombre}>
          <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
          <Input
            id="nombre"
            placeholder="Nombre del producto"
            {...register("nombre")}
          />
          <FieldError errors={[errors.nombre].filter(Boolean)} />
        </Field>

        <Field data-invalid={!!errors.id_proveedor}>
          <FieldLabel>Proveedor</FieldLabel>
          <Controller
            control={control}
            name="id_proveedor"
            render={({ field: f }) => (
              <Select
                value={f.value ? String(f.value) : ""}
                onValueChange={(val) => f.onChange(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor…" />
                </SelectTrigger>
                <SelectContent>
                  {proveedores.map((p) => (
                    <SelectItem
                      key={p.id_proveedor}
                      value={String(p.id_proveedor)}
                    >
                      {p.nombre_proveedor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.id_proveedor]} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={!!errors.precio_venta}>
            <FieldLabel htmlFor="precio_venta">Precio de venta</FieldLabel>
            <Input
              id="precio_venta"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("precio_venta", { valueAsNumber: true })}
            />
            <FieldError errors={[errors.precio_venta].filter(Boolean)} />
          </Field>

          <Field>
            <FieldLabel>Disponible</FieldLabel>
            <div className="flex items-center h-9 gap-2">
              <Checkbox
                id="disponible"
                checked={disponible}
                onCheckedChange={(checked) =>
                  setValue("disponible", Boolean(checked))
                }
              />
              <label htmlFor="disponible" className="text-sm cursor-pointer">
                {disponible ? "Sí" : "No"}
              </label>
            </div>
          </Field>
        </div>
      </FieldGroup>

      {}
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide pt-2">
        Detalle
      </p>

      <FieldGroup>
        <Field data-invalid={!!errors.tipo_producto}>
          <FieldLabel htmlFor="tipo_producto">Tipo de producto</FieldLabel>
          <Input
            id="tipo_producto"
            placeholder="Ej. Bebida, Snack, Suplemento…"
            {...register("tipo_producto")}
          />
          <FieldError errors={[errors.tipo_producto].filter(Boolean)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={!!errors.presentacion}>
            <FieldLabel htmlFor="presentacion">Presentación</FieldLabel>
            <Input
              id="presentacion"
              placeholder="Ej. Botella 500ml"
              {...register("presentacion")}
            />
            <FieldError errors={[errors.presentacion].filter(Boolean)} />
          </Field>

          <Field data-invalid={!!errors.unidades_por_empaque}>
            <FieldLabel htmlFor="unidades_por_empaque">
              Unid. por empaque
            </FieldLabel>
            <Input
              id="unidades_por_empaque"
              type="number"
              min="1"
              step="1"
              placeholder="12"
              {...register("unidades_por_empaque", { valueAsNumber: true })}
            />
            <FieldError
              errors={[errors.unidades_por_empaque].filter(Boolean)}
            />
          </Field>
        </div>

        <Field data-invalid={!!errors.precio_compra}>
          <FieldLabel htmlFor="precio_compra">Precio de compra</FieldLabel>
          <Input
            id="precio_compra"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("precio_compra", { valueAsNumber: true })}
          />
          <FieldError errors={[errors.precio_compra].filter(Boolean)} />
        </Field>

        <Field data-invalid={!!errors.ingredientes}>
          <FieldLabel htmlFor="ingredientes">Ingredientes</FieldLabel>
          <Textarea
            id="ingredientes"
            rows={3}
            placeholder="Lista de ingredientes…"
            {...register("ingredientes")}
          />
          <FieldError errors={[errors.ingredientes].filter(Boolean)} />
        </Field>

        <Field>
          <FieldLabel htmlFor="descripcion">Descripción (opcional)</FieldLabel>
          <Textarea
            id="descripcion"
            rows={2}
            placeholder="Descripción adicional…"
            {...register("descripcion")}
          />
        </Field>
      </FieldGroup>

      <Field>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Spinner className="mr-2" />}
          {submitLabel}
        </Button>
      </Field>
    </form>
  );
}
