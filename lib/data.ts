import sql from './db';
import { Usuario } from './definitions';

export async function fetchUsuarioByEmail(email: string) {
  try {
    const data = await sql<Usuario[]>`SELECT * FROM usuarios WHERE email = ${email} LIMIT 1`;
    return data[0] ?? null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch usuario.');
  }
}
