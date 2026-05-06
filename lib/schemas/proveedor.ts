import { z } from "zod";

export const proveedorSchema = z.object({
  nombre_proveedor: z.string().min(2, "Ingresa el nombre del proveedor"),
  nit_proveedor: z.string().min(1, "Ingresa el NIT"),
  nombre_representante: z.string(),
  telefono: z.string(),
  email: z.string(),
  direccion: z.string(),
});

export type ProveedorFormValues = z.infer<typeof proveedorSchema>;
