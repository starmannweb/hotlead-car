import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    const updateData: { status?: string; notes?: string } = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error("Erro ao atualizar lead:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao atualizar lead" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, message: "Lead não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error("Erro ao buscar lead:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Sem permissao para deletar" }, { status: 403 });
    }

    const { id } = await params;

    // Deletar os viewLogs associados primeiro?
    // O prisma já fará cascata se configurado ou então precisaremos deletar manualmente.
    // Vamos usar em transação para apagar logs antes ou prisma fará com ondelete cascade.
    // Na dúvida, vamos deletar logs do lead.
    await prisma.$transaction([
      prisma.viewLog.deleteMany({ where: { leadId: id } }),
      prisma.lead.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true, message: "Lead removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover lead:", error);
    return NextResponse.json({ success: false, message: "Erro ao remover lead" }, { status: 500 });
  }
}
