import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/scoring";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      phone,
      city,
      vehicle_brand,
      vehicle_model,
      vehicle_year,
      km,
      urgency,
      discount_acceptance,
      docs_status,
      finance_status,
      photos = [],
      utm_source = "",
      utm_medium = "",
      utm_campaign = "",
      gclid = "",
      lgpd_consent = false,
    } = body;

    // Calcular score
    const scoring = calculateLeadScore({
      urgency,
      discountAcceptance: discount_acceptance,
      docsStatus: docs_status,
      financeStatus: finance_status,
    });

    // Salvar no banco
    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        city,
        vehicleBrand: vehicle_brand,
        vehicleModel: vehicle_model,
        vehicleYear: vehicle_year,
        km,
        urgency,
        discountAcceptance: discount_acceptance,
        docsStatus: docs_status,
        financeStatus: finance_status,
        score: scoring.score,
        tier: scoring.tier,
        qualified: scoring.qualified,
        photos: JSON.stringify(photos),
        utmSource: utm_source,
        utmMedium: utm_medium,
        utmCampaign: utm_campaign,
        gclid,
        lgpdConsent: lgpd_consent,
        lgpdConsentAt: lgpd_consent ? new Date() : null,
      },
    });

    console.log(
      `[NEW LEAD] ${lead.id} | ${lead.name} | Score: ${scoring.score} | Tier: ${scoring.tier}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Lead recebido com sucesso",
        leadId: lead.id,
        score: scoring.score,
        tier: scoring.tier,
      },
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get("tier");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, string> = {};
    if (tier) where.tier = tier;
    if (status) where.status = status;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: [{ score: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[LEADS LIST ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar leads" },
      { status: 500 }
    );
  }
}
