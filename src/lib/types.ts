export interface LeadData {
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
  photos: File[];
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  gclid: string;
  created_at: string;
  lgpd_consent: boolean;
}

export interface QuickFormData {
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: string;
  city: string;
  phone: string;
}

export type FormStep = 1 | 2;

export interface TrackingEvent {
  event: "form_start" | "form_step_1" | "form_step_2" | "form_submit";
  data?: Record<string, string>;
}
