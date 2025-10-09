"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "authenticated") {
    router.replace("/dashboard");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
      callbackUrl,
    });

    if (result?.ok) {
      router.replace(result.url || callbackUrl);
    } else {
      setError("Usuario o contraseña inválidos");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-fuchsia-500/10 via-sky-500/10 to-emerald-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(75rem_30rem_at_50%_-10%,hsl(var(--muted))/40,transparent)]" />
      </div>

      <div className="mx-auto grid max-w-md place-items-center px-6 py-16 text-center sm:py-24">
        <div className="relative w-full rounded-2xl border bg-card/60 p-8 backdrop-blur supports-[backdrop-filter]:bg-card/50 shadow-xl sm:p-10">
          <div className="absolute inset-x-0 -top-px mx-auto h-px w-3/4 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-inset ring-primary/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6 text-primary"
              aria-hidden
            >
              <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>

          <h1 className="bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
            Iniciar sesión
          </h1>

          <p className="mx-auto mt-2 max-w-prose text-balance text-muted-foreground">
            Accede a tu cuenta para administrar el inventario.
          </p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-5 text-left">
            <div className="grid gap-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="/"
                  className="text-xs text-muted-foreground hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Accediendo..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link
              href="/"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Regresa al inicio
            </Link>
          </div>

          <div className="absolute inset-x-8 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>
      </div>
    </div>
  );
}
