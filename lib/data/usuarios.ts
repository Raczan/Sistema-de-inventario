import sql from '@/lib/db';
import { Usuario } from '@/lib/types';

export async function fetchUsuarioByEmail(email: string) {
  try {
    const data = await sql<Usuario[]>`SELECT * FROM usuarios WHERE email = ${email} LIMIT 1`;
    return data[0] ?? null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch usuario.');
  }
}
