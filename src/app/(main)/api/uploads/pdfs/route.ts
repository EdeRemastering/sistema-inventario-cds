import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../lib/auth";
import { savePdfToR2 } from "../../../../../lib/image-storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Campo "file" requerido (archivo PDF)' },
      { status: 400 }
    );
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Solo se permiten archivos PDF" },
      { status: 400 }
    );
  }

  const maxBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: "El PDF excede el tamaño máximo (10MB)" },
      { status: 400 }
    );
  }

  try {
    const url = await savePdfToR2(file, { folder: "evidencias-baja" });
    return NextResponse.json({ url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error subiendo PDF";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
