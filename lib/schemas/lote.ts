import { z } from "zod";

export const loteSchema = z.object({
  codigo_lote: z
    .string()
    .min(2, "El código del lote debe tener al menos 2 caracteres")
    .max(100, "El código del lote no puede exceder 100 caracteres"),
  id_producto: z
    .number()
    .min(1, "Debe seleccionar un producto"),
  cantidad_inicial: z
    .number()
    .min(1, "La cantidad inicial debe ser mayor a 0"),
  cantidad_actual: z
    .number()
    .min(0, "La cantidad actual no puede ser negativa"),
  fecha_entrada: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Fecha de entrada inválida"),
  fecha_vencimiento: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Fecha de vencimiento inválida"),
}).refine(
  (data) => new Date(data.fecha_vencimiento) > new Date(data.fecha_entrada),
  {
    message: "La fecha de vencimiento debe ser posterior a la fecha de entrada",
    path: ["fecha_vencimiento"],
  }
).refine(
  (data) => data.cantidad_actual <= data.cantidad_inicial,
  {
    message: "La cantidad actual no puede exceder la cantidad inicial",
    path: ["cantidad_actual"],
  }
);

export type LoteFormValues = z.infer<typeof loteSchema>;
