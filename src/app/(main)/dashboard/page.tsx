import Link from "next/link";

export default function MainHome() {
  const modules = [
    { name: "Elementos", href: "/elementos" },
    { name: "Movimientos", href: "/movimientos" },
    { name: "Observaciones", href: "/observaciones" },
    { name: "Reportes", href: "/reportes" },
    { name: "Usuarios", href: "/usuarios" },
    { name: "Logs", href: "/logs" },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Panel principal</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map(({ name, href }) => (
          <Link
            key={name}
            href={href}
            className="rounded border p-4 hover:bg-accent"
          >
            {name}
          </Link>
        ))}
      </div>
    </div>
  );
}
