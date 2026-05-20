import sql from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    UPDATE
      public.lotes
    SET
      codigo_lote = ${codigo_lote},
      id_producto = ${id_producto},
      cantidad_inicial = ${cantidad_inicial},
      cantidad_actual = ${cantidad_actual},
      fecha_entrada = ${fecha_entrada},
      fecha_vencimiento = ${fecha_vencimiento}
    WHERE
      id_lote = ${parseInt(id, 10)}
    RETURNING
      id_lote,
      codigo_lote,
      id_producto,
      cantidad_inicial,
      cantidad_actual,
      fecha_entrada,
      fecha_vencimiento
  `;

  return NextResponse.json(row);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const loteId = parseInt(id, 10);

    await sql`
      DELETE FROM
        public.lotes
      WHERE
        id_lote = ${loteId}
    `;

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting lote:", error);

    // Si tiene ventas asociadas, mostrar mensaje amigable
    if (error.code === "23503" && error.constraint_name === "venta_detalle_id_lote_fkey") {
      return NextResponse.json(
        { error: "No se puede eliminar este lote porque tiene ventas registradas" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error al eliminar el lote" },
      { status: 500 }
    );
  }
}
