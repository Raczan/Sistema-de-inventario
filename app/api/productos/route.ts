import sql from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await sql`
    SELECT
      p.id_producto,
      p.sku,
      p.nombre,
      p.precio_venta,
      p.disponible,
      p.creado_en,
      d.descripcion,
      d.ingredientes,
      d.tipo_producto,
      d.presentacion,
      d.unidades_por_empaque,
      d.precio_compra
    FROM productos p
    LEFT JOIN detalle_producto d ON d.id_producto = p.id_producto
    ORDER BY p.nombre ASC
  `;
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    sku,
    nombre,
    precio_venta,
    disponible = true,
    descripcion,
    ingredientes,
    tipo_producto,
    presentacion,
    unidades_por_empaque,
    precio_compra,
  } = body;

  // Insert en productos y obtener el id generado
  const [producto] = await sql`
    INSERT INTO productos (sku, nombre, precio_venta, disponible)
    VALUES (${sku}, ${nombre}, ${precio_venta}, ${disponible})
    RETURNING *
  `;

  // Insert en detalle_producto usando el mismo id
  const [detalle] = await sql`
    INSERT INTO detalle_producto (
      id_producto,
      descripcion,
      ingredientes,
      tipo_producto,
      presentacion,
      unidades_por_empaque,
      precio_compra
    )
    VALUES (
      ${producto.id_producto},
      ${descripcion ?? null},
      ${ingredientes},
      ${tipo_producto},
      ${presentacion},
      ${unidades_por_empaque},
      ${precio_compra}
    )
    RETURNING *
  `;

  return NextResponse.json({ ...producto, ...detalle }, { status: 201 });
}
