import sql from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { nombre_proveedor, nit_proveedor, telefono, email, direccion, nombre_representante, activo } = body;

  const [proveedor] = await sql`
    UPDATE proveedores
    SET nombre_proveedor = ${nombre_proveedor},
        nit_proveedor    = ${nit_proveedor},
        telefono         = ${telefono},
        email            = ${email},
        direccion        = ${direccion},
        nombre_representante = ${nombre_representante},
        activo           = ${activo}
    WHERE id_proveedor = ${id}
    RETURNING *
  `;
  return NextResponse.json(proveedor);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM proveedores WHERE id_proveedor = ${id}`;
  return new NextResponse(null, { status: 204 });
}
