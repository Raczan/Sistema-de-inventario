import sql from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const {
    sku,
    nombre,
    precio_venta,
    disponible,
    descripcion,
    ingredientes,
    tipo_producto,
    presentacion,
    unidades_por_empaque,
    precio_compra,
  } = body;

  const [producto] = await sql`
    UPDATE productos
    SET
      sku          = ${sku},
      nombre       = ${nombre},
      precio_venta = ${precio_venta},
      disponible   = ${disponible}
    WHERE id_producto = ${id}
    RETURNING *
  `;

  const [detalle] = await sql`
    UPDATE detalle_producto
    SET
      descripcion          = ${descripcion ?? null},
      ingredientes         = ${ingredientes},
      tipo_producto        = ${tipo_producto},
      presentacion         = ${presentacion},
      unidades_por_empaque = ${unidades_por_empaque},
      precio_compra        = ${precio_compra}
    WHERE id_producto = ${id}
    RETURNING *
  `;

  return NextResponse.json({ ...producto, ...detalle });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // CASCADE en detalle_producto elimina el detalle automáticamente
  await sql`DELETE FROM productos WHERE id_producto = ${id}`;
  return new NextResponse(null, { status: 204 });
}
