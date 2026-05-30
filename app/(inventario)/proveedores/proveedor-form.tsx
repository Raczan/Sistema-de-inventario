"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  proveedorSchema,
  type ProveedorFormValues,
} from "@/lib/schemas/proveedor";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  defaultValues?: Partial<ProveedorFormValues>;
  onSubmit: (data: ProveedorFormValues) => Promise<void>;
  submitLabel?: string;
};

export function ProveedorForm({
  defaultValues,
  onSubmit,
  submitLabel = "Guardar",
}: Props) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProveedorFormValues>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      nombre_proveedor: "",
      nit_proveedor: "",
      nombre_representante: "",
      telefono: "",
      email: "",
      direccion: "",
      ...defaultValues,
    },
  });

  function submit(data: ProveedorFormValues) {
    startTransition(async () => {
      await onSubmit(data);
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.nombre_proveedor}>
          <FieldLabel htmlFor="nombre_proveedor">Nombre</FieldLabel>
          <Input
            id="nombre_proveedor"
            placeholder="Nombre del proveedor"
            {...register("nombre_proveedor")}
          />
          <FieldError errors={[errors.nombre_proveedor]} />
        </Field>
        <Field data-invalid={!!errors.nit_proveedor}>
          <FieldLabel htmlFor="nit_proveedor">NIT</FieldLabel>
          <Input
            id="nit_proveedor"
            placeholder="NIT"
            {...register("nit_proveedor")}
          />
          <FieldError errors={[errors.nit_proveedor]} />
        </Field>
        <Field data-invalid={!!errors.nombre_representante}>
          <FieldLabel htmlFor="nombre_representante">Representante</FieldLabel>
          <Input
            id="nombre_representante"
            placeholder="Nombre del representante"
            {...register("nombre_representante")}
          />
          <FieldError errors={[errors.nombre_representante]} />
        </Field>
        <Field data-invalid={!!errors.telefono}>
          <FieldLabel htmlFor="telefono">Teléfono</FieldLabel>
          <Input
            id="telefono"
            placeholder="Teléfono"
            {...register("telefono")}
          />
          <FieldError errors={[errors.telefono]} />
        </Field>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="email@ejemplo.com"
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field data-invalid={!!errors.direccion}>
          <FieldLabel htmlFor="direccion">Dirección</FieldLabel>
          <Input
            id="direccion"
            placeholder="Dirección"
            {...register("direccion")}
          />
          <FieldError errors={[errors.direccion]} />
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
