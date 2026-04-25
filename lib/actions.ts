'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(formData: FormData) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Correo o contraseña incorrectos.';
        default:
          return 'Algo salió mal.';
      }
    }
    throw error;
  }
}
