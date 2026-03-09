"use client";

import { useState, useRef } from "react";
import { ArrowRight, ArrowLeft, Upload, X, Check, Camera } from "lucide-react";
import {
  VEHICLE_BRANDS,
  URGENCY_OPTIONS,
  DISCOUNT_OPTIONS,
  DOCS_OPTIONS,
  FINANCE_OPTIONS,
  PHOTO_LABELS,
} from "@/lib/constants";
import { formatPhone, validatePhone, formatKm } from "@/lib/validators";
import { trackEvent, getUTMParams } from "@/lib/tracking";
import { submitLead } from "@/lib/api";
import type { LeadData } from "@/lib/types";

interface MultiStepFormProps {
  initialData?: {
    vehicle_brand?: string;
    vehicle_model?: string;
    vehicle_year?: string;
    city?: string;
    phone?: string;
  };
}

export default function MultiStepForm({ initialData }: MultiStepFormProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    phone: initialData?.phone || "",
    city: initialData?.city || "",
    vehicle_brand: initialData?.vehicle_brand || "",
    vehicle_model: initialData?.vehicle_model || "",
    vehicle_year: initialData?.vehicle_year || "",
    km: "",
    urgency: "",
    discount_acceptance: "",
    docs_status: "",
    finance_status: "",
  });

  const [photos, setPhotos] = useState<(File | null)[]>(
    Array(PHOTO_LABELS.length).fill(null)
  );
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<(string | null)[]>(
    Array(PHOTO_LABELS.length).fill(null)
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setFormData((prev) => ({ ...prev, phone: formatPhone(value) }));
    } else if (name === "km") {
      setFormData((prev) => ({ ...prev, km: formatKm(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleOptionSelect = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePhotoUpload = (index: number, file: File | null) => {
    if (!file) return;
    const newPhotos = [...photos];
    newPhotos[index] = file;
    setPhotos(newPhotos);

    const newUrls = [...photoPreviewUrls];
    if (newUrls[index]) URL.revokeObjectURL(newUrls[index]!);
    newUrls[index] = URL.createObjectURL(file);
    setPhotoPreviewUrls(newUrls);
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);

    const newUrls = [...photoPreviewUrls];
    if (newUrls[index]) URL.revokeObjectURL(newUrls[index]!);
    newUrls[index] = null;
    setPhotoPreviewUrls(newUrls);
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Informe seu nome";
    if (!validatePhone(formData.phone)) newErrors.phone = "WhatsApp inválido";
    if (!formData.city.trim()) newErrors.city = "Informe a cidade";
    if (!formData.vehicle_brand) newErrors.vehicle_brand = "Selecione a marca";
    if (!formData.vehicle_model.trim()) newErrors.vehicle_model = "Informe o modelo";
    if (!formData.vehicle_year.trim()) newErrors.vehicle_year = "Informe o ano";
    if (!formData.km.trim()) newErrors.km = "Informe a km";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.urgency) newErrors.urgency = "Selecione a urgência";
    if (!formData.discount_acceptance) newErrors.discount_acceptance = "Selecione uma opção";
    if (!formData.docs_status) newErrors.docs_status = "Selecione uma opção";
    if (!formData.finance_status) newErrors.finance_status = "Selecione uma opção";
    if (!lgpdConsent) newErrors.lgpd = "Você precisa aceitar para continuar";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToStep2 = () => {
    if (validateStep1()) {
      trackEvent({ event: "form_step_1" });
      setStep(2);
      window.scrollTo({ top: document.getElementById("formulario-completo")?.offsetTop || 0, behavior: "smooth" });
    }
  };

  const goBackToStep1 = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    trackEvent({ event: "form_step_2" });
    setSubmitting(true);

    const utm = getUTMParams();
    const leadData: LeadData = {
      ...formData,
      photos: photoPreviewUrls.filter(Boolean) as string[],
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      gclid: utm.gclid,
      created_at: new Date().toISOString(),
      lgpd_consent: lgpdConsent,
    };

    const result = await submitLead(leadData);

    if (result.success) {
      trackEvent({ event: "form_submit" });
      setSubmitted(true);
    } else {
      setErrors({ submit: result.message });
    }

    setSubmitting(false);
  };

  if (submitted) {
    return (
      <section id="formulario-completo" className="py-16 md:py-24 bg-white">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Cadastro realizado!
          </h2>
          <p className="text-gray-500 text-lg">
            Recebemos seus dados. Nossa equipe vai validar as informações e
            lojistas da sua região poderão enviar propostas em breve.
          </p>
          <p className="text-gray-400 text-sm mt-4">
            Fique atento ao seu WhatsApp.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="formulario-completo" className="py-16 md:py-24 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h2 className="section-title">Cadastre seu veículo</h2>
        <p className="section-subtitle">
          Preencha os dados abaixo para receber propostas de lojistas
        </p>

        {/* Progress Bar */}
        <div className="mt-8 mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-semibold ${step >= 1 ? "text-primary" : "text-gray-400"}`}>
              Etapa 1 — Dados do veículo
            </span>
            <span className={`text-sm font-semibold ${step >= 2 ? "text-primary" : "text-gray-400"}`}>
              Etapa 2 — Qualificação
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome</label>
              <input
                type="text"
                name="name"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${errors.name ? "!border-red-400" : ""}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={16}
                  className={`input-field ${errors.phone ? "!border-red-400" : ""}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cidade</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Sua cidade"
                  value={formData.city}
                  onChange={handleChange}
                  className={`input-field ${errors.city ? "!border-red-400" : ""}`}
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Marca</label>
              <select
                name="vehicle_brand"
                value={formData.vehicle_brand}
                onChange={handleChange}
                className={`input-field ${errors.vehicle_brand ? "!border-red-400" : ""}`}
              >
                <option value="">Selecione a marca</option>
                {VEHICLE_BRANDS.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              {errors.vehicle_brand && <p className="text-red-500 text-xs mt-1">{errors.vehicle_brand}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Modelo</label>
                <input
                  type="text"
                  name="vehicle_model"
                  placeholder="Ex: Civic"
                  value={formData.vehicle_model}
                  onChange={handleChange}
                  className={`input-field ${errors.vehicle_model ? "!border-red-400" : ""}`}
                />
                {errors.vehicle_model && <p className="text-red-500 text-xs mt-1">{errors.vehicle_model}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ano</label>
                <input
                  type="text"
                  name="vehicle_year"
                  placeholder="2020"
                  maxLength={4}
                  value={formData.vehicle_year}
                  onChange={handleChange}
                  className={`input-field ${errors.vehicle_year ? "!border-red-400" : ""}`}
                />
                {errors.vehicle_year && <p className="text-red-500 text-xs mt-1">{errors.vehicle_year}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Km</label>
                <input
                  type="text"
                  name="km"
                  placeholder="45.000"
                  value={formData.km}
                  onChange={handleChange}
                  className={`input-field ${errors.km ? "!border-red-400" : ""}`}
                />
                {errors.km && <p className="text-red-500 text-xs mt-1">{errors.km}</p>}
              </div>
            </div>

            <button onClick={goToStep2} className="btn-primary w-full flex items-center justify-center gap-2 mt-6">
              Próxima etapa
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in">
            {/* Urgência */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Quando você precisa vender?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {URGENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleOptionSelect("urgency", opt.value)}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                      formData.urgency === opt.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors.urgency && <p className="text-red-500 text-xs mt-1">{errors.urgency}</p>}
            </div>

            {/* Desconto FIPE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Aceita proposta abaixo da FIPE?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {DISCOUNT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleOptionSelect("discount_acceptance", opt.value)}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                      formData.discount_acceptance === opt.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors.discount_acceptance && <p className="text-red-500 text-xs mt-1">{errors.discount_acceptance}</p>}
            </div>

            {/* Documentação */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Documentação
              </label>
              <div className="grid grid-cols-3 gap-3">
                {DOCS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleOptionSelect("docs_status", opt.value)}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                      formData.docs_status === opt.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors.docs_status && <p className="text-red-500 text-xs mt-1">{errors.docs_status}</p>}
            </div>

            {/* Financiamento */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Financiamento ativo?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {FINANCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleOptionSelect("finance_status", opt.value)}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                      formData.finance_status === opt.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors.finance_status && <p className="text-red-500 text-xs mt-1">{errors.finance_status}</p>}
            </div>

            {/* Upload de Fotos */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Fotos do veículo <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {PHOTO_LABELS.map((label, index) => (
                  <div key={label} className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => { fileInputRefs.current[index] = el; }}
                      onChange={(e) => handlePhotoUpload(index, e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {photoPreviewUrls[index] ? (
                      <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-primary">
                        <img
                          src={photoPreviewUrls[index]!}
                          alt={label}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[index]?.click()}
                        className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                      >
                        <Camera className="w-5 h-5 text-gray-400" />
                        <span className="text-[10px] text-gray-400 font-medium">
                          {label}
                        </span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* LGPD */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="lgpd"
                checked={lgpdConsent}
                onChange={(e) => {
                  setLgpdConsent(e.target.checked);
                  if (errors.lgpd) setErrors((prev) => ({ ...prev, lgpd: "" }));
                }}
                className="mt-1 w-4 h-4 accent-primary cursor-pointer"
              />
              <label htmlFor="lgpd" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                Autorizo o uso dos meus dados para receber propostas de lojistas
                e contato via WhatsApp, conforme a Lei Geral de Proteção de
                Dados (LGPD). Posso revogar esta autorização a qualquer momento.
              </label>
            </div>
            {errors.lgpd && <p className="text-red-500 text-xs -mt-4">{errors.lgpd}</p>}

            {errors.submit && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl">
                {errors.submit}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={goBackToStep1}
                className="flex-1 py-4 px-6 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-[2] btn-secondary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar cadastro
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
