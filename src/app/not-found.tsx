import Link from "next/link";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-dvh grid place-items-center p-8 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">La página que buscas no existe.</p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">Ir al inicio</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Ir al panel</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
