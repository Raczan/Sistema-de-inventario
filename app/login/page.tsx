"use client";

import Image from "next/image";
import { LoginForm } from "@/components/login-form";
import { StackIcon } from "@phosphor-icons/react";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <StackIcon className="size-4" />
            </div>
            Sistema inventario
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-emerald-600 lg:block">
        <Image
          src="/inventory.svg"
          alt="Sistema de inventario"
          width={640}
          height={450}
          className="absolute inset-0 m-auto"
        />
      </div>
    </div>
  );
}
