const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/leads";

export interface SubmitLeadPayload {
  name: string;
  phone: string;
  city: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: string;
  km: string;
  urgency: string;
  discount_acceptance: string;
  docs_status: string;
  finance_status: string;
  photos: string[];
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  gclid: string;
  lgpd_consent: boolean;
}

export interface SubmitLeadResponse {
  success: boolean;
  message: string;
  leadId?: string;
  score?: number;
  tier?: string;
}

export async function submitLead(data: SubmitLeadPayload): Promise<SubmitLeadResponse> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Erro ao enviar dados");
    }

    return result;
  } catch (error) {
    console.error("Erro ao enviar lead:", error);
    return { success: false, message: "Erro ao enviar. Tente novamente." };
  }
}
