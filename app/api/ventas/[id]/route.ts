import sql from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [venta] = await sql`
    SELECT * FROM ventas WHERE id_venta = ${id}
  `;
  if (!venta) return new NextResponse(null, { status: 404 });

  const detalles = await sql`
    SELECT id_detalle, id_lote, cantidad_vendida, precio_unitario
    FROM venta_detalle
    WHERE id_venta = ${id}
    ORDER BY id_detalle ASC
  `;

  return NextResponse.json({ ...venta, detalles });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { fecha_venta, observacion, detalles } = body as {
    fecha_venta: string;
    observacion?: string;
    detalles: { id_lote: number; cantidad_vendida: number; precio_unitario: number }[];
  };

  const total = detalles.reduce(
    (sum, d) => sum + d.cantidad_vendida * d.precio_unitario,
    0,
  );

  const [venta] = await sql`
    UPDATE ventas
    SET
      fecha_venta  = ${fecha_venta},
      total        = ${total},
      observacion  = ${observacion || null}
    WHERE id_venta = ${id}
    RETURNING *
  `;

  // Reemplazar todos los detalles (CASCADE permite el DELETE)
  await sql`DELETE FROM venta_detalle WHERE id_venta = ${id}`;

  for (const detalle of detalles) {
    await sql`
      INSERT INTO venta_detalle (id_venta, id_lote, cantidad_vendida, precio_unitario)
      VALUES (
        ${id},
        ${detalle.id_lote},
        ${detalle.cantidad_vendida},
        ${detalle.precio_unitario}
      )
    `;
  }

  return NextResponse.json(venta);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // venta_detalle se borra por ON DELETE CASCADE
  await sql`DELETE FROM ventas WHERE id_venta = ${id}`;
  return new NextResponse(null, { status: 204 });
}
