"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import bcrypt from "bcrypt";
import { fetchUsuarioByEmail, createUsuario } from "@/lib/data/usuarios";

export async function register(
  nombre: string,
  email: string,
  password: string,
) {
  const existing = await fetchUsuarioByEmail(email);
  if (existing) return "Ya existe una cuenta con ese correo electrónico.";

  const hashedPassword = await bcrypt.hash(password, 10);
  await createUsuario(nombre, email, hashedPassword);
}

export async function logout() {
  await signOut({ redirect: false });
}

export async function authenticate(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Correo o contraseña incorrectos.";
        default:
          return "Algo salió mal.";
      }
    }
    throw error;
  }
}
