import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const lead: Record<string, string | string[]> = {};
    const photos: string[] = [];

    formData.forEach((value, key) => {
      if (key === "photos[]" && value instanceof File) {
        photos.push(value.name);
      } else {
        lead[key] = value as string;
      }
    });

    lead.photos = photos;

    console.log("[NEW LEAD]", JSON.stringify(lead, null, 2));

    // TODO: Integrar com banco de dados ou CRM externo
    // Exemplo: await db.leads.create({ data: lead });

    return NextResponse.json(
      { success: true, message: "Lead recebido com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[LEAD ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Erro ao processar lead" },
      { status: 500 }
    );
  }
}
