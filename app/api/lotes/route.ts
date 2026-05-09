import sql from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await sql`
    SELECT
      l.id_lote,
      l.codigo_lote,
      l.id_producto,
      p.nombre_producto,
      l.cantidad_inicial,
      l.cantidad_actual,
      l.fecha_entrada,
      l.fecha_vencimiento
    FROM
      public.lotes l
    JOIN
      public.productos p ON l.id_producto = p.id_producto
    ORDER BY
      l.fecha_entrada DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    codigo_lote,
    id_producto,
    cantidad_inicial,
    cantidad_actual,
    fecha_entrada,
    fecha_vencimiento,
  } = body;

  const [row] = await sql`
    INSERT INTO
      public.lotes (
        codigo_lote,
        id_producto,
        cantidad_inicial,
        cantidad_actual,
        fecha_entrada,
        fecha_vencimiento
      )
    VALUES
      (
        ${codigo_lote},
        ${id_producto},
        ${cantidad_inicial},
        ${cantidad_actual},
        ${fecha_entrada},
        ${fecha_vencimiento}
      )
    RETURNING
      id_lote,
      codigo_lote,
      id_producto,
      cantidad_inicial,
      cantidad_actual,
      fecha_entrada,
      fecha_vencimiento
  `;

  return NextResponse.json(row, { status: 201 });
}
