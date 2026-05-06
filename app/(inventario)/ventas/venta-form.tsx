"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";

import { ventaSchema, type VentaFormValues } from "@/lib/schemas/venta";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Ajusta los campos al nombre real de tu tabla `lotes`
type LoteOption = {
  id_lote: number;
  descripcion: string;
};

type Props = {
  defaultValues?: Partial<VentaFormValues>;
  onSubmit: (data: VentaFormValues) => Promise<void>;
  submitLabel?: string;
};

export function VentaForm({
  defaultValues,
  onSubmit,
  submitLabel = "Guardar",
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [lotes, setLotes] = useState<LoteOption[]>([]);

const { register, control, handleSubmit, formState: { errors } } =
  useForm({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      fecha_venta: new Date().toISOString().split("T")[0],
      observacion: "",
      detalles: [{ id_lote: 0, cantidad_vendida: 1, precio_unitario: 0 }],
      ...defaultValues,
    },
});

  const { fields, append, remove } = useFieldArray({
    control,
    name: "detalles",
  });

  useEffect(() => {
    fetch("/api/lotes")
      .then((r) => r.json())
      .then(setLotes)
      .catch(() => setLotes([]));
  }, []);

  // Total calculado en tiempo real
  const detallesWatch = useWatch({ control, name: "detalles" });
  const totalCalculado = (detallesWatch ?? []).reduce((sum, d) => {
    const cant = Number(d?.cantidad_vendida) || 0;
    const precio = Number(d?.precio_unitario) || 0;
    return sum + cant * precio;
  }, 0);

  function submit(data: VentaFormValues) {
    startTransition(async () => {
      await onSubmit(data);
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      {/* ── Cabecera ── */}
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.fecha_venta}>
            <FieldLabel htmlFor="fecha_venta">Fecha</FieldLabel>
            <Input id="fecha_venta" type="date" {...register("fecha_venta")} />
            <FieldError errors={[errors.fecha_venta]} />
          </Field>

          <Field>
            <FieldLabel>Total calculado</FieldLabel>
            <Input
              readOnly
              value={`Q ${totalCalculado.toFixed(2)}`}
              className="bg-muted text-muted-foreground cursor-default"
            />
          </Field>
        </div>

        <Field data-invalid={!!errors.observacion}>
          <FieldLabel htmlFor="observacion">Observación</FieldLabel>
          <Textarea
            id="observacion"
            placeholder="Opcional…"
            rows={2}
            {...register("observacion")}
          />
          <FieldError errors={[errors.observacion]} />
        </Field>
      </FieldGroup>

      <Separator />

      {/* ── Líneas de detalle ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Detalle de productos</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ id_lote: 0, cantidad_vendida: 1, precio_unitario: 0 })
            }
          >
            <PlusIcon className="size-4" />
            Agregar línea
          </Button>
        </div>

        {/* Error a nivel del array */}
        {typeof errors.detalles?.message === "string" && (
          <p className="text-destructive text-xs">{errors.detalles.message}</p>
        )}

        {/* Encabezados de columna */}
        <div className="grid grid-cols-[1fr_80px_110px_36px] gap-2 px-1">
          <span className="text-muted-foreground text-xs font-medium">Lote</span>
          <span className="text-muted-foreground text-xs font-medium">Cant.</span>
          <span className="text-muted-foreground text-xs font-medium">
            Precio unit.
          </span>
          <span />
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-[1fr_80px_110px_36px] gap-2 items-start"
          >
            {/* Select de lote */}
            <Field
              data-invalid={!!errors.detalles?.[index]?.id_lote}
              className="m-0"
            >
              <Controller
                control={control}
                name={`detalles.${index}.id_lote`}
                render={({ field: f }) => (
                  <Select
                    value={f.value ? String(f.value) : ""}
                    onValueChange={(val) => f.onChange(Number(val))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar lote…" />
                    </SelectTrigger>
                    <SelectContent>
                      {lotes.map((l) => (
                        <SelectItem key={l.id_lote} value={String(l.id_lote)}>
                          #{l.id_lote} — {l.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.detalles?.[index]?.id_lote]} />
            </Field>

            {/* Cantidad */}
            <Field
              data-invalid={!!errors.detalles?.[index]?.cantidad_vendida}
              className="m-0"
            >
              <Input
                type="number"
                min={1}
                placeholder="1"
                {...register(`detalles.${index}.cantidad_vendida`)}
              />
              <FieldError
                errors={[errors.detalles?.[index]?.cantidad_vendida]}
              />
            </Field>

            {/* Precio unitario */}
            <Field
              data-invalid={!!errors.detalles?.[index]?.precio_unitario}
              className="m-0"
            >
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                {...register(`detalles.${index}.precio_unitario`)}
              />
              <FieldError
                errors={[errors.detalles?.[index]?.precio_unitario]}
              />
            </Field>

            {/* Eliminar fila — deshabilitado si es la única */}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="mt-0.5"
              disabled={fields.length === 1}
              onClick={() => remove(index)}
            >
              <TrashIcon className="text-destructive size-4" />
            </Button>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
