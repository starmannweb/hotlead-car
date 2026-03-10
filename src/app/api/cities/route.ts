import { NextRequest, NextResponse } from "next/server";

const IBGE_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";

// Cache de cidades por UF
const cityCache = new Map<string, { data: string[]; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const uf = searchParams.get("uf");
        const action = searchParams.get("action");

        // Geolocation by IP
        if (action === "geoip") {
            try {
                const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
                const geoRes = await fetch(`https://ipapi.co/${ip || ""}/json/`, {
                    headers: { "User-Agent": "AutoOportunidade/1.0" },
                    signal: AbortSignal.timeout(3000),
                });
                if (geoRes.ok) {
                    const geo = await geoRes.json();
                    return NextResponse.json({
                        success: true,
                        data: {
                            city: geo.city || "",
                            state: geo.region_code || "",
                            region: geo.region || "",
                        },
                    });
                }
            } catch {
                // Fallback silencioso
            }
            return NextResponse.json({ success: false, data: null });
        }

        // Cities by UF
        if (!uf || uf.length !== 2) {
            return NextResponse.json(
                { success: false, message: "UF invalida" },
                { status: 400 }
            );
        }

        const cacheKey = uf.toUpperCase();
        const cached = cityCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return NextResponse.json({ success: true, data: cached.data });
        }

        const res = await fetch(
            `${IBGE_BASE}/estados/${uf}/municipios?orderBy=nome`,
            { next: { revalidate: 86400 } }
        );

        if (!res.ok) {
            throw new Error(`IBGE API error: ${res.status}`);
        }

        const data = await res.json();
        const cities: string[] = data.map((m: { nome: string }) => m.nome);
        cityCache.set(cacheKey, { data: cities, timestamp: Date.now() });

        return NextResponse.json({ success: true, data: cities });
    } catch (error) {
        console.error("[CITIES API ERROR]", error);
        return NextResponse.json(
            { success: false, message: "Erro ao buscar cidades" },
            { status: 500 }
        );
    }
}
