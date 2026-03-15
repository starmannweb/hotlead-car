/**
 * Sistema de Scoring/Qualificação de Leads
 *
 * Pontuação de 0-100 pontos, dividido em 3 tiers:
 * - HOT (70-100): Lead altamente qualificado, prioridade máxima
 * - WARM (40-69): Lead com potencial, precisa de follow-up
 * - COLD (0-39): Lead frio, baixa probabilidade de conversão
 *
 * Critérios de pontuação:
 * - Urgência: até 35 pontos
 * - Desconto aceito (abaixo da FIPE): até 30 pontos
 * - Documentação: até 20 pontos
 * - Financiamento: até 15 pontos
 * - Liquidez do modelo: até 20 pontos
 * - Quilometragem: até 10 pontos
 *
 * Liquidez baseada no ranking oficial de emplacamentos da FENABRAVE
 * acumulado até dezembro de 2025 (relatório publicado em janeiro de 2026).
 * Fonte oficial:
 * https://www.fenabrave.org.br/portal/files/2025_12_02.pdf
 */

interface ScoringInput {
  urgency: string;
  discountAcceptance: string;
  docsStatus: string;
  financeStatus: string;
  vehicleModel: string;
  vehicleYear: string;
  km: string;
}

interface ScoringResult {
  score: number;
  tier: "hot" | "warm" | "cold";
  qualified: boolean;
  breakdown: {
    urgency: number;
    discount: number;
    docs: number;
    finance: number;
    modelLiquidity: number;
    mileage: number;
  };
}

const URGENCY_SCORES: Record<string, number> = {
  hoje: 35,
  "3dias": 28,
  "7dias": 15,
  sem_pressa: 5,
};

const DISCOUNT_SCORES: Record<string, number> = {
  acima_20: 30,
  "10_20": 20,
  fipe: 5,
};

const DOCS_SCORES: Record<string, number> = {
  regular: 20,
  nao_sei: 8,
  pendencias: 3,
};

const FINANCE_SCORES: Record<string, number> = {
  nao: 15,
  sim: 5,
};

type ModelLiquidityRule = {
  score: number;
  patterns: string[];
};

const MODEL_LIQUIDITY_RULES: ModelLiquidityRule[] = [
  {
    score: 20,
    patterns: [
      "strada",
      "corolla cross",
      "t cross",
      "hr v",
      "hb20",
      "onix",
      "creta",
      "mobi",
      "polo",
      "argo",
    ],
  },
  {
    score: 17,
    patterns: [
      "onix plus",
      "tracker",
      "compass",
      "kwid",
      "kicks",
      "fastback",
      "nivus",
      "renegade",
      "pulse",
      "saveiro",
      "toro",
      "hilux",
    ],
  },
  {
    score: 14,
    patterns: [
      "dolphin mini",
      "tiggo 7",
      "haval h6",
      "hb20s",
      "virtus",
      "cronos",
      "rampage",
      "montana",
      "fiorino",
      "ranger",
      "corolla",
      "song",
      "spin",
      "tera",
      "s10",
    ],
  },
  {
    score: 10,
    patterns: [
      "city hatch",
      "tiggo 5x",
      "tiggo 8",
      "eclipse cross",
      "commander",
      "kardian",
      "basalt",
      "duster",
      "sw4",
      "dolphin",
      "taos",
      "triton",
      "master",
      "oroch",
      "city",
    ],
  },
  {
    score: 7,
    patterns: [
      "c3 aircross",
      "territory",
      "frontier",
      "sentra",
      "amarok",
      "transit",
      "partner",
      "jumper",
      "boxer",
      "expert",
      "scudo",
      "ducato",
      "k2500",
      "2008",
      "208",
      "yuan",
      "versa",
      "c3",
      "x1",
    ],
  },
];

const MAX_RAW_SCORE = 130;

function normalizeModelName(value: string): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getModelLiquidityScore(model: string): number {
  const normalizedModel = normalizeModelName(model);
  if (!normalizedModel) return 0;

  for (const rule of MODEL_LIQUIDITY_RULES) {
    const matched = rule.patterns.some((pattern) =>
      normalizedModel.includes(normalizeModelName(pattern))
    );

    if (matched) return rule.score;
  }

  return 4;
}

function extractYear(value: string): number | null {
  const match = String(value || "").match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

function parseKm(value: string): number | null {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

function getMileageScore(km: string, vehicleYear: string): number {
  const kmValue = parseKm(km);
  if (kmValue === null) return 0;

  const parsedYear = extractYear(vehicleYear);
  if (!parsedYear) {
    if (kmValue <= 30000) return 10;
    if (kmValue <= 60000) return 8;
    if (kmValue <= 100000) return 6;
    if (kmValue <= 150000) return 3;
    return 0;
  }

  const currentYear = new Date().getFullYear();
  const yearsInUse = Math.max(1, currentYear - parsedYear);
  const kmPerYear = kmValue / yearsInUse;

  if (kmPerYear <= 12000) return 10;
  if (kmPerYear <= 18000) return 8;
  if (kmPerYear <= 25000) return 6;
  if (kmPerYear <= 35000) return 3;
  return 0;
}

export function calculateLeadScore(input: ScoringInput): ScoringResult {
  const breakdown = {
    urgency: URGENCY_SCORES[input.urgency] || 0,
    discount: DISCOUNT_SCORES[input.discountAcceptance] || 0,
    docs: DOCS_SCORES[input.docsStatus] || 0,
    finance: FINANCE_SCORES[input.financeStatus] || 0,
    modelLiquidity: getModelLiquidityScore(input.vehicleModel),
    mileage: getMileageScore(input.km, input.vehicleYear),
  };

  const rawScore =
    breakdown.urgency +
    breakdown.discount +
    breakdown.docs +
    breakdown.finance +
    breakdown.modelLiquidity +
    breakdown.mileage;

  const score = Math.round((rawScore / MAX_RAW_SCORE) * 100);

  let tier: "hot" | "warm" | "cold";
  if (score >= 70) {
    tier = "hot";
  } else if (score >= 40) {
    tier = "warm";
  } else {
    tier = "cold";
  }

  const qualified = score >= 40;

  return { score, tier, qualified, breakdown };
}

export function getTierLabel(tier: string): string {
  switch (tier) {
    case "hot":
      return "Quente";
    case "warm":
      return "Morno";
    case "cold":
      return "Frio";
    default:
      return tier;
  }
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case "hot":
      return "text-red-600 bg-red-50 border-red-200";
    case "warm":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "cold":
      return "text-blue-600 bg-blue-50 border-blue-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}
