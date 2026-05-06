import sql from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await sql`
    SELECT
      v.id_venta,
      v.fecha_venta,
      v.total,
      v.observacion,
      COUNT(d.id_detalle)::int AS num_productos
    FROM ventas v
    LEFT JOIN venta_detalle d ON d.id_venta = v.id_venta
    GROUP BY v.id_venta
    ORDER BY v.fecha_venta DESC, v.id_venta DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
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
    INSERT INTO ventas (fecha_venta, total, observacion)
    VALUES (${fecha_venta}, ${total}, ${observacion || null})
    RETURNING *
  `;

  for (const detalle of detalles) {
    await sql`
      INSERT INTO venta_detalle (id_venta, id_lote, cantidad_vendida, precio_unitario)
      VALUES (
        ${venta.id_venta},
        ${detalle.id_lote},
        ${detalle.cantidad_vendida},
        ${detalle.precio_unitario}
      )
    `;
  }

  return NextResponse.json(venta, { status: 201 });
}
