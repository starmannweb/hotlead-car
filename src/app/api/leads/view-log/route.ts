import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, field } = body;

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";

    const log = await prisma.viewLog.create({
      data: {
        leadId,
        field,
        ip: typeof ip === "string" ? ip : "",
      },
    });

    console.log(`[VIEW LOG] Lead ${leadId} | Campo: ${field} | IP: ${ip}`);

    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    console.error("[VIEW LOG ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Erro ao registrar visualização" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");

    const where = leadId ? { leadId } : {};

    const logs = await prisma.viewLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("[VIEW LOG LIST ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar logs" },
      { status: 500 }
    );
  }
}
