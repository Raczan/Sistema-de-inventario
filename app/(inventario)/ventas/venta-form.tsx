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


type LoteOption = {
  id_lote: number;
  nombre: string;
  precio_venta: number;
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

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
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
      {}
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.fecha_venta}>
            <FieldLabel htmlFor="fecha_venta">Fecha</FieldLabel>
            <Input id="fecha_venta" type="date" readOnly {...register("fecha_venta")} />
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

      {}
      <div className="space-y-2">
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
            Agregar Producto
          </Button>
        </div>

        {}
        {typeof errors.detalles?.message === "string" && (
          <p className="text-destructive text-xs">{errors.detalles.message}</p>
        )}

        {}
        <div className="flex gap-2 px-1">
          <span className="flex-1 text-muted-foreground text-xs font-medium min-w-0">
            Lote
          </span>
          <span className="w-20 shrink-0 text-muted-foreground text-xs font-medium">
            Cant.
          </span>
          <span className="w-24 shrink-0 text-muted-foreground text-xs font-medium">
            Precio Venta
          </span>
          <span className="w-9 shrink-0" />
        </div>

        {}
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-start">
            {}
            <div className="flex-1 min-w-0">
              <Controller
                control={control}
                name={`detalles.${index}.id_lote`}
                render={({ field: f }) => (
                  <Select
                    value={f.value ? String(f.value) : ""}
                      onValueChange={(val) => {
                        f.onChange(Number(val));
                        const lote = lotes.find((l) => l.id_lote === Number(val));
                        if (lote) {
                          setValue(`detalles.${index}.precio_unitario`, lote.precio_venta);
                        }
                      }}
                  >
                    <SelectTrigger
                      data-invalid={!!errors.detalles?.[index]?.id_lote}
                      className="w-full"
                    >
                      <SelectValue placeholder="Seleccionar lote…" />
                    </SelectTrigger>
                    <SelectContent>
                      {lotes.map((l) => (
                        <SelectItem key={l.id_lote} value={String(l.id_lote)}>
                          #{l.id_lote} — {l.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.detalles?.[index]?.id_lote && (
                <p className="text-destructive text-xs mt-0.5">
                  {errors.detalles[index].id_lote?.message}
                </p>
              )}
            </div>

            {}
            <div className="w-20 shrink-0">
              <Input
                type="number"
                min={1}
                placeholder="1"
                data-invalid={!!errors.detalles?.[index]?.cantidad_vendida}
                {...register(`detalles.${index}.cantidad_vendida`)}
              />
              {errors.detalles?.[index]?.cantidad_vendida && (
                <p className="text-destructive text-xs mt-0.5">
                  {errors.detalles[index].cantidad_vendida?.message}
                </p>
              )}
            </div>

            {}
            <div className="w-24 shrink-0">
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                data-invalid={!!errors.detalles?.[index]?.precio_unitario}
                {...register(`detalles.${index}.precio_unitario`)}
              />
              {errors.detalles?.[index]?.precio_unitario && (
                <p className="text-destructive text-xs mt-0.5">
                  {errors.detalles[index].precio_unitario?.message}
                </p>
              )}
            </div>

            {}
            <div className="w-9 shrink-0 pt-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
              >
                <TrashIcon className="text-destructive size-4" />
              </Button>
            </div>
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