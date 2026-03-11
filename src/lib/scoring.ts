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
 */

interface ScoringInput {
  urgency: string;
  discountAcceptance: string;
  docsStatus: string;
  financeStatus: string;
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

export function calculateLeadScore(input: ScoringInput): ScoringResult {
  const breakdown = {
    urgency: URGENCY_SCORES[input.urgency] || 0,
    discount: DISCOUNT_SCORES[input.discountAcceptance] || 0,
    docs: DOCS_SCORES[input.docsStatus] || 0,
    finance: FINANCE_SCORES[input.financeStatus] || 0,
  };

  const score = breakdown.urgency + breakdown.discount + breakdown.docs + breakdown.finance;

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
