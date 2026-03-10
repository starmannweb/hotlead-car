import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const body = await request.json();
    const { leadId, field } = body;

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";

    const log = await prisma.viewLog.create({
      data: {
        leadId,
        userId: user?.id || null,
        field,
        creditsUsed: 0,
        ip: typeof ip === "string" ? ip : "",
      },
    });

    console.log(`[VIEW LOG] Lead ${leadId} | Campo: ${field} | User: ${user?.name || "anon"} | IP: ${ip}`);

    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    console.error("[VIEW LOG ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Erro ao registrar visualizacao" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Nao autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");

    const where: Record<string, unknown> = {};
    if (leadId) where.leadId = leadId;

    // Admin sees all, others only own
    if (user.role !== "admin") {
      where.userId = user.id;
    }

    const logs = await prisma.viewLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
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
