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
      d.precio_compra,
      p.id_proveedor,
      proveedores.nombre_proveedor
    FROM productos p
    LEFT JOIN detalle_producto d ON d.id_producto = p.id_producto
    LEFT JOIN proveedores ON proveedores.id_proveedor = p.id_proveedor
    ORDER BY p.fechaEdicion ASC
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
    id_proveedor
  } = body;

  const [producto] = await sql`
    INSERT INTO productos (sku, nombre, precio_venta, disponible, id_proveedor, fechaEdicion)
      VALUES (${sku}, ${nombre}, ${precio_venta}, ${disponible}, ${id_proveedor}, NOW())
    RETURNING *
  `;

  const [detalle] = await sql`
    INSERT INTO detalle_producto (
      id_producto,
      descripcion,
      ingredientes,
      tipo_producto,
      presentacion,
      unidades_por_empaque,
      precio_compra,
      fechaEdicion
    )
    VALUES (
      ${producto.id_producto},
      ${descripcion ?? null},
      ${ingredientes},
      ${tipo_producto},
      ${presentacion},
      ${unidades_por_empaque},
      ${precio_compra},
      NOW()
    )
    RETURNING *
  `;

  return NextResponse.json({ ...producto, ...detalle }, { status: 201 });
}
