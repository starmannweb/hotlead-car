export const PRIORITY_REGIONS = ["Baixada Santista", "Regiao Metropolitana de SP"] as const;

const BAIXADA_SANTISTA_CITIES = new Set([
  "santos",
  "sao vicente",
  "guaruja",
  "praia grande",
  "cubatao",
  "bertioga",
  "mongagua",
  "itanhaem",
  "peruibe",
]);

export function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function canonicalRegionLabel(region: string, city: string, state: string): string {
  const normalizedRegion = normalizeText(region || "");
  const normalizedCity = normalizeText(city || "");
  const normalizedState = normalizeText(state || "");

  const cityIsBaixada = state.toUpperCase() === "SP" && BAIXADA_SANTISTA_CITIES.has(normalizedCity);

  const regionLooksLikeState =
    !normalizedRegion ||
    normalizedRegion === normalizedState ||
    normalizedRegion === "sp" ||
    normalizedRegion === "sao paulo" ||
    normalizedRegion === "estado de sao paulo";

  const regionSuggestsMetroSp =
    normalizedRegion.includes("metropolitana") &&
    normalizedRegion.includes("sao paulo");

  const regionSuggestsBaixada =
    normalizedRegion.includes("baixada santista") ||
    normalizedRegion === "santos" ||
    (regionSuggestsMetroSp && cityIsBaixada);

  if (cityIsBaixada && (regionLooksLikeState || regionSuggestsBaixada || regionSuggestsMetroSp)) {
    return PRIORITY_REGIONS[0];
  }

  if (regionSuggestsMetroSp) {
    return PRIORITY_REGIONS[1];
  }

  if (regionLooksLikeState) {
    return "";
  }

  return region.trim();
}

export function buildRegionOptions(values: string[]): string[] {
  const uniqueDetected = Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  );

  const rest = uniqueDetected
    .filter((region) => !PRIORITY_REGIONS.includes(region as (typeof PRIORITY_REGIONS)[number]))
    .sort((a, b) => a.localeCompare(b, "pt-BR"));

  return [...PRIORITY_REGIONS, ...rest];
}
