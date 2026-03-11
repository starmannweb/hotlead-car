import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/scoring";
import { getUnlockCost } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      email = "",
      phone,
      state = "SP",
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

    // Pega IP do usuário
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "0.0.0.0";

    // Mapeia cidade para Região (IBGE)
    let region = city || ""; // Fallback
    if (city && state) {
      try {
        const ibgeRes = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`);
        if (ibgeRes.ok) {
          const municipios = await ibgeRes.json();
          const pCity = city.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          const match = municipios.find((m: any) =>
            m.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === pCity
          );
          if (match && match.microrregiao && match.microrregiao.mesorregiao) {
            region = match.microrregiao.mesorregiao.nome;
          }
        }
      } catch (error) {
        console.error("Erro ao buscar região no IBGE", error);
      }
    }

    // Salvar no banco
    const lead = await (prisma as any).lead.create({
      data: {
        name,
        email,
        phone,
        state,
        city,
        region,
        ip,
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
        unlockCost: getUnlockCost(scoring.score),
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

    if (email) {
      console.log(`[EMAIL DISPATCH] Enviando confirmação de cadastro para: ${email}`);
      // Aqui integraria SendGrid, Resend ou AWS SES
    }

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

    // Calcular as regiões (unique) para enviar para o frontend e mostrar no menu de opções
    const uniqueRegions = Array.from(new Set(leads.map((l: any) => l.region).filter(Boolean))).sort();

    return NextResponse.json({
      success: true,
      data: leads,
      uniqueRegions,
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
