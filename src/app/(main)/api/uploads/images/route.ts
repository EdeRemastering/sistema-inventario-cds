import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../lib/auth";
import { saveImageToR2 } from "../../../../../lib/image-storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Content-Type debe ser multipart/form-data" },
      { status: 400 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Campo "file" requerido (archivo de imagen)' },
      { status: 400 }
    );
  }

  // Validación básica
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "El archivo debe ser una imagen" },
      { status: 400 }
    );
  }

  const maxBytes = 8 * 1024 * 1024; // 8MB
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: "La imagen excede el tamaño máximo (8MB)" },
      { status: 400 }
    );
  }

  try {
    const url = await saveImageToR2(file, { folder: "images" });
    return NextResponse.json({ url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error subiendo imagen";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

