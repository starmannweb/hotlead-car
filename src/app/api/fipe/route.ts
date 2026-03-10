import { NextRequest, NextResponse } from "next/server";

const FIPE_BASE = "https://fipe.parallelum.com.br/api/v2/cars";

// Cache em memoria para evitar muitas chamadas
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

async function fetchWithCache(url: string) {
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const res = await fetch(url, {
        headers: { "Accept": "application/json" },
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        throw new Error(`FIPE API error: ${res.status}`);
    }

    const data = await res.json();
    cache.set(url, { data, timestamp: Date.now() });
    return data;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type"); // brands, models, years
        const brandCode = searchParams.get("brandCode");
        const modelCode = searchParams.get("modelCode");

        if (type === "brands") {
            const data = await fetchWithCache(`${FIPE_BASE}/brands`);
            return NextResponse.json({ success: true, data });
        }

        if (type === "models" && brandCode) {
            const data = await fetchWithCache(`${FIPE_BASE}/brands/${brandCode}/models`);
            return NextResponse.json({ success: true, data });
        }

        if (type === "years" && brandCode && modelCode) {
            const data = await fetchWithCache(`${FIPE_BASE}/brands/${brandCode}/models/${modelCode}/years`);
            return NextResponse.json({ success: true, data });
        }

        return NextResponse.json(
            { success: false, message: "Parametros invalidos" },
            { status: 400 }
        );
    } catch (error) {
        console.error("[FIPE API ERROR]", error);
        return NextResponse.json(
            { success: false, message: "Erro ao consultar tabela FIPE" },
            { status: 500 }
        );
    }
}
