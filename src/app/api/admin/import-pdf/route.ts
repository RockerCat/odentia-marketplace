import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { getSession } from "@/lib/session";
import { parseProductLines } from "@/lib/pdf-import";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("pdf");

  if (!(file instanceof File) || file.type !== "application/pdf") {
    return NextResponse.json({ error: "Selecciona un archivo PDF válido." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parser = new PDFParse({ data: buffer });

  try {
    const { text } = await parser.getText();
    const categories = await prisma.category.findMany({ select: { id: true, name: true } });
    const rows = parseProductLines(text, categories);

    return NextResponse.json({ rows });
  } catch (err) {
    console.error("import-pdf parse error:", err);
    return NextResponse.json(
      { error: "No se pudo leer el PDF. Puede estar protegido o corrupto." },
      { status: 422 }
    );
  } finally {
    await parser.destroy();
  }
}
