import { z } from "zod";

export const productoSchema = z.object({
  // productos
  sku: z
    .string()
    .length(13, "El SKU debe tener exactamente 13 caracteres"),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(150, "El nombre no puede superar 150 caracteres"),
  precio_venta: z
    .coerce.number()
    .min(0, "El precio de venta no puede ser negativo"),
  disponible: z.boolean().default(true),

  // detalle_producto
  descripcion: z.string().optional(),
  ingredientes: z.string().min(1, "Los ingredientes son obligatorios"),
  tipo_producto: z
    .string()
    .min(1, "El tipo de producto es obligatorio")
    .max(100),
  presentacion: z
    .string()
    .min(1, "La presentación es obligatoria")
    .max(50),
  unidades_por_empaque: z
    .coerce.number()
    .int()
    .min(1, "Debe haber al menos 1 unidad por empaque"),
  precio_compra: z
    .coerce.number()
    .min(0, "El precio de compra no puede ser negativo"),
});

export type ProductoFormValues = z.infer<typeof productoSchema>;
