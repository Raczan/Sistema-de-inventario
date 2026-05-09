"use client";

import { useTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loteSchema, type LoteFormValues } from "@/lib/schemas/lote";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Producto = {
  id_producto: number;
  nombre_producto: string;
};

type Props = {
  defaultValues?: Partial<LoteFormValues>;
  onSubmit: (data: LoteFormValues) => Promise<void>;
  submitLabel?: string;
};

export function LoteForm({ defaultValues, onSubmit, submitLabel = "Guardar" }: Props) {
  const [isPending, startTransition] = useTransition();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedProducto, setSelectedProducto] = useState<string>(
    defaultValues?.id_producto?.toString() ?? ""
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoteFormValues>({
    resolver: zodResolver(loteSchema),
    defaultValues: {
      codigo_lote: "",
      id_producto: 0,
      cantidad_inicial: 1,
      cantidad_actual: 1,
      fecha_entrada: new Date().toISOString().split("T")[0],
      fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      ...defaultValues,
    },
  });

  // Fetch productos
  useEffect(() => {
    async function fetchProductos() {
      const res = await fetch("/api/productos");
      const json = await res.json();
      setProductos(json);
    }
    fetchProductos();
  }, []);

  // Sync selected producto con form
  useEffect(() => {
    if (selectedProducto) {
      setValue("id_producto", parseInt(selectedProducto, 10));
    }
  }, [selectedProducto, setValue]);

  function submit(data: LoteFormValues) {
    startTransition(async () => {
      await onSubmit(data);
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <FieldGroup>
        {/* Código Lote */}
        <Field data-invalid={!!errors.codigo_lote}>
          <FieldLabel htmlFor="codigo_lote">Código del Lote</FieldLabel>
          <Input
            id="codigo_lote"
            placeholder="Ej: LOT-2024-001"
            {...register("codigo_lote")}
          />
          <FieldError errors={[errors.codigo_lote]} />
        </Field>

        {/* Producto */}
        <Field data-invalid={!!errors.id_producto}>
          <FieldLabel htmlFor="id_producto">Producto</FieldLabel>
          <Select value={selectedProducto} onValueChange={setSelectedProducto}>
            <SelectTrigger id="id_producto">
              <SelectValue placeholder="Seleccionar producto" />
            </SelectTrigger>
            <SelectContent>
              {productos.map((p) => (
                <SelectItem key={p.id_producto} value={p.id_producto.toString()}>
                  {p.nombre_producto}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.id_producto]} />
        </Field>

        {/* Cantidad Inicial */}
        <Field data-invalid={!!errors.cantidad_inicial}>
          <FieldLabel htmlFor="cantidad_inicial">Cantidad Inicial</FieldLabel>
          <Input
            id="cantidad_inicial"
            type="number"
            placeholder="Ej: 100"
            {...register("cantidad_inicial", { valueAsNumber: true })}
          />
          <FieldError errors={[errors.cantidad_inicial]} />
        </Field>

        {/* Cantidad Actual */}
        <Field data-invalid={!!errors.cantidad_actual}>
          <FieldLabel htmlFor="cantidad_actual">Cantidad Actual</FieldLabel>
          <Input
            id="cantidad_actual"
            type="number"
            placeholder="Ej: 95"
            {...register("cantidad_actual", { valueAsNumber: true })}
          />
          <FieldError errors={[errors.cantidad_actual]} />
        </Field>

        {/* Fecha Entrada */}
        <Field data-invalid={!!errors.fecha_entrada}>
          <FieldLabel htmlFor="fecha_entrada">Fecha de Entrada</FieldLabel>
          <Input
            id="fecha_entrada"
            type="date"
            {...register("fecha_entrada")}
          />
          <FieldError errors={[errors.fecha_entrada]} />
        </Field>

        {/* Fecha Vencimiento */}
        <Field data-invalid={!!errors.fecha_vencimiento}>
          <FieldLabel htmlFor="fecha_vencimiento">Fecha de Vencimiento</FieldLabel>
          <Input
            id="fecha_vencimiento"
            type="date"
            {...register("fecha_vencimiento")}
          />
          <FieldError errors={[errors.fecha_vencimiento]} />
        </Field>

        {/* Submit */}
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
