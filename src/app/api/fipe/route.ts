import { NextRequest, NextResponse } from "next/server";

const FIPE_BASE = "https://fipe.parallelum.com.br/api/v2/cars";
const FIPE_TOKEN = process.env.FIPE_API_TOKEN;

// In-memory cache to reduce API traffic.
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

type FipeModel = { code: string; name: string };
type FipeYear = { code: string; name: string };

function normalizeText(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function getModelFamily(modelName: string): string {
    const stopWords = new Set([
        "flex", "turbo", "diesel", "gasolina", "alcool", "etanol",
        "hibrido", "hibrida", "automatico", "automatica", "manual",
        "cvt", "aut", "at", "mt", "tsi", "tdi", "mpi", "fsi",
        "gdi", "4x4", "4wd", "2wd", "v6", "v8",
    ]);

    const tokens = modelName.split(/\s+/);
    const family: string[] = [];

    for (const token of tokens) {
        const cleaned = token.replace(/[^a-zA-Z0-9\u00C0-\u00FF-]/g, "");
        if (!cleaned) continue;

        const normalized = normalizeText(cleaned);
        const isNumeric = /^\d+([.,]\d+)?$/.test(normalized);

        if (family.length > 0 && (stopWords.has(normalized) || isNumeric)) {
            break;
        }

        family.push(cleaned);
        if (family.length >= 3) break;
    }

    return family.join(" ").trim();
}

async function fetchWithCache(url: string) {
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const headers: Record<string, string> = { Accept: "application/json" };
    if (FIPE_TOKEN) {
        headers["X-Subscription-Token"] = FIPE_TOKEN;
    }

    const res = await fetch(url, {
        headers,
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        throw new Error(`FIPE API error: ${res.status}`);
    }

    const data = await res.json();
    cache.set(url, { data, timestamp: Date.now() });
    return data;
}

async function fetchBrandYears(brandCode: string): Promise<FipeYear[]> {
    return (await fetchWithCache(`${FIPE_BASE}/brands/${brandCode}/years`)) as FipeYear[];
}

async function fetchModelsByBrandYear(brandCode: string, year: string): Promise<FipeModel[]> {
    const years = await fetchBrandYears(brandCode);
    const yearPrefix = `${year.trim()}-`;

    const yearCodes = Array.from(
        new Set(
            years
                .map((y) => y.code)
                .filter((code) => typeof code === "string" && code.startsWith(yearPrefix))
        )
    );

    if (yearCodes.length === 0) return [];

    const modelLists = await Promise.all(
        yearCodes.map(async (yearCode) => {
            try {
                return (await fetchWithCache(`${FIPE_BASE}/brands/${brandCode}/years/${yearCode}/models`)) as FipeModel[];
            } catch {
                return [] as FipeModel[];
            }
        })
    );

    const byName = new Map<string, FipeModel>();
    modelLists.flat().forEach((model) => {
        if (!model?.name || !model?.code) return;
        if (!byName.has(model.name)) byName.set(model.name, model);
    });

    return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");
        const brandCode = searchParams.get("brandCode");
        const modelCode = searchParams.get("modelCode");
        const modelName = searchParams.get("modelName");
        const year = searchParams.get("year");

        if (type === "brands") {
            const data = await fetchWithCache(`${FIPE_BASE}/brands`);
            return NextResponse.json({ success: true, data });
        }

        if (type === "models" && brandCode) {
            const data = year
                ? await fetchModelsByBrandYear(brandCode, year)
                : await fetchWithCache(`${FIPE_BASE}/brands/${brandCode}/models`);
            return NextResponse.json({ success: true, data });
        }

        if (type === "years" && brandCode) {
            if (modelCode) {
                const data = await fetchWithCache(`${FIPE_BASE}/brands/${brandCode}/models/${modelCode}/years`);
                return NextResponse.json({ success: true, data });
            }

            const years = await fetchBrandYears(brandCode);
            const dedupedYears = Array.from(
                new Set(
                    years
                        .map((y) => String(y.code || "").split("-")[0])
                        .filter((y) => /^\d{4}$/.test(y))
                )
            )
                .sort((a, b) => Number(b) - Number(a))
                .map((y) => ({ code: y, name: y }));

            return NextResponse.json({ success: true, data: dedupedYears });
        }

        if (type === "versions" && brandCode && modelName && year) {
            const models = await fetchModelsByBrandYear(brandCode, year);
            const targetFamily = normalizeText(modelName);

            const data = models
                .filter((m) => normalizeText(getModelFamily(m.name)) === targetFamily)
                .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

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
