import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
