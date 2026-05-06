import sql from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const proveedores = await sql`
    SELECT id_proveedor, nombre_proveedor, nit_proveedor, telefono, email, direccion, nombre_representante, activo
    FROM proveedores
    ORDER BY nombre_proveedor ASC
  `;
  return NextResponse.json(proveedores);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { nombre_proveedor, nit_proveedor, telefono, email, direccion, nombre_representante } = body;

  const [proveedor] = await sql`
    INSERT INTO proveedores (nombre_proveedor, nit_proveedor, telefono, email, direccion, nombre_representante, activo)
    VALUES (${nombre_proveedor}, ${nit_proveedor}, ${telefono}, ${email}, ${direccion}, ${nombre_representante}, true)
    RETURNING *
  `;
  return NextResponse.json(proveedor, { status: 201 });
}
