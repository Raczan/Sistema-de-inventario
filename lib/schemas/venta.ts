import { z } from "zod";

export const ventaDetalleSchema = z.object({
  id_lote: z.coerce.number().min(1, "Selecciona un lote"),
  cantidad_vendida: z.coerce
    .number()
    .int("Debe ser entero")
    .min(1, "Cantidad mínima: 1"),
  precio_unitario: z.coerce.number().min(0, "No puede ser negativo"),
});

export const ventaSchema = z.object({
  fecha_venta: z.string().min(1, "La fecha es requerida"),
  observacion: z.string().optional().default(""),
  detalles: z
    .array(ventaDetalleSchema)
    .min(1, "Agrega al menos un producto al detalle"),
});

export type VentaDetalleFormValues = z.infer<typeof ventaDetalleSchema>;
export type VentaFormValues = z.infer<typeof ventaSchema>;
