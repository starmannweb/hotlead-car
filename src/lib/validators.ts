export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10 || cleaned.length === 11;
}

export function formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 11)
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
}

export function validateYear(year: string): boolean {
  const y = parseInt(year);
  const currentYear = new Date().getFullYear();
  return y >= 2000 && y <= currentYear + 1;
}

export function validateKm(km: string): boolean {
  const k = parseInt(km.replace(/\D/g, ""));
  return !isNaN(k) && k >= 0 && k <= 500000;
}

export function formatKm(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  if (!cleaned) return "";
  return parseInt(cleaned).toLocaleString("pt-BR");
}
