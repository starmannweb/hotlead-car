"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Car,
  User,
  Phone,
  MapPin,
  Gauge,
  Calendar,
  Clock,
  TrendingDown,
  FileText,
  Banknote,
  Camera,
  X,
  ChevronDown,
} from "lucide-react";
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
import type { SubmitLeadPayload } from "@/lib/api";

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

interface StepDef {
  id: string;
  field: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  type: "text" | "tel" | "select" | "options" | "photos" | "consent";
  placeholder?: string;
  options?: { value: string; label: string }[];
  selectOptions?: string[];
  required?: boolean;
  maxLength?: number;
  validate?: (value: string) => string | null;
  format?: (value: string) => string;
}

const STEPS: StepDef[] = [
  {
    id: "name",
    field: "name",
    title: "Qual é o seu nome?",
    subtitle: "Precisamos saber quem está vendendo",
    icon: User,
    type: "text",
    placeholder: "Digite seu nome completo",
    required: true,
    validate: (v) => (!v.trim() ? "Informe seu nome" : null),
  },
  {
    id: "phone",
    field: "phone",
    title: "Qual seu WhatsApp?",
    subtitle: "Os lojistas entrarão em contato por aqui",
    icon: Phone,
    type: "tel",
    placeholder: "(11) 99999-9999",
    required: true,
    maxLength: 16,
    validate: (v) => (!validatePhone(v) ? "Número inválido. Use DDD + número" : null),
    format: formatPhone,
  },
  {
    id: "city",
    field: "city",
    title: "Em qual cidade você está?",
    subtitle: "Vamos conectar com lojistas da sua região",
    icon: MapPin,
    type: "text",
    placeholder: "Ex: São Paulo",
    required: true,
    validate: (v) => (!v.trim() ? "Informe sua cidade" : null),
  },
  {
    id: "vehicle_brand",
    field: "vehicle_brand",
    title: "Qual a marca do seu carro?",
    subtitle: "Selecione a marca do veículo",
    icon: Car,
    type: "select",
    selectOptions: VEHICLE_BRANDS,
    required: true,
    validate: (v) => (!v ? "Selecione a marca" : null),
  },
  {
    id: "vehicle_model",
    field: "vehicle_model",
    title: "Qual o modelo?",
    subtitle: "Ex: Civic, Onix, HB20, Corolla",
    icon: Car,
    type: "text",
    placeholder: "Digite o modelo do veículo",
    required: true,
    validate: (v) => (!v.trim() ? "Informe o modelo" : null),
  },
  {
    id: "vehicle_year",
    field: "vehicle_year",
    title: "Qual o ano do veículo?",
    subtitle: "Ano de fabricação",
    icon: Calendar,
    type: "text",
    placeholder: "Ex: 2020",
    maxLength: 4,
    required: true,
    validate: (v) => {
      const y = parseInt(v);
      if (!v.trim() || isNaN(y)) return "Informe o ano";
      if (y < 2000 || y > new Date().getFullYear() + 1) return "Ano inválido";
      return null;
    },
  },
  {
    id: "km",
    field: "km",
    title: "Qual a quilometragem?",
    subtitle: "Valor aproximado em km",
    icon: Gauge,
    type: "text",
    placeholder: "Ex: 45.000",
    required: true,
    validate: (v) => (!v.trim() ? "Informe a quilometragem" : null),
    format: formatKm,
  },
  {
    id: "urgency",
    field: "urgency",
    title: "Quando você precisa vender?",
    subtitle: "Quanto mais urgente, mais rápido conectamos com lojistas",
    icon: Clock,
    type: "options",
    options: URGENCY_OPTIONS,
    required: true,
    validate: (v) => (!v ? "Selecione a urgência" : null),
  },
  {
    id: "discount_acceptance",
    field: "discount_acceptance",
    title: "Aceita propostas abaixo da FIPE?",
    subtitle: "Lojistas compram para revender — propostas abaixo da tabela são comuns no mercado",
    icon: TrendingDown,
    type: "options",
    options: DISCOUNT_OPTIONS,
    required: true,
    validate: (v) => (!v ? "Selecione uma opção" : null),
  },
  {
    id: "docs_status",
    field: "docs_status",
    title: "Como está a documentação?",
    subtitle: "Documentação em dia facilita propostas melhores",
    icon: FileText,
    type: "options",
    options: DOCS_OPTIONS,
    required: true,
    validate: (v) => (!v ? "Selecione uma opção" : null),
  },
  {
    id: "finance_status",
    field: "finance_status",
    title: "O veículo tem financiamento ativo?",
    subtitle: "Isso não impede a venda, apenas precisamos saber",
    icon: Banknote,
    type: "options",
    options: FINANCE_OPTIONS,
    required: true,
    validate: (v) => (!v ? "Selecione uma opção" : null),
  },
  {
    id: "photos",
    field: "photos",
    title: "Tem fotos do veículo?",
    subtitle: "Opcional — mas fotos aumentam as chances de propostas melhores",
    icon: Camera,
    type: "photos",
  },
  {
    id: "consent",
    field: "lgpd_consent",
    title: "Quase lá! Confirme para receber propostas",
    subtitle: "Seus dados são protegidos conforme a LGPD",
    icon: Check,
    type: "consent",
    required: true,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TypeformFlowProps {
  initialData?: {
    vehicle_brand?: string;
    vehicle_model?: string;
    vehicle_year?: string;
    city?: string;
    phone?: string;
  };
  onComplete?: () => void;
}

export default function TypeformFlow({ initialData, onComplete }: TypeformFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [formValues, setFormValues] = useState<Record<string, string>>({
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
    lgpd_consent: "",
  });
  const [photos, setPhotos] = useState<(File | null)[]>(Array(PHOTO_LABELS.length).fill(null));
  const [photoUrls, setPhotoUrls] = useState<(string | null)[]>(Array(PHOTO_LABELS.length).fill(null));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ score?: number; tier?: string } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hasTrackedStart = useRef(false);

  const step = STEPS[currentStep];
  const totalSteps = STEPS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Focus input on step change
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 350);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Track form start
  useEffect(() => {
    if (!hasTrackedStart.current) {
      trackEvent({ event: "form_start" });
      hasTrackedStart.current = true;
    }
  }, []);

  const setValue = (field: string, value: string) => {
    const stepDef = STEPS.find((s) => s.field === field);
    const formatted = stepDef?.format ? stepDef.format(value) : value;
    setFormValues((prev) => ({ ...prev, [field]: formatted }));
    setError(null);
  };

  const validateCurrent = (): boolean => {
    if (step.type === "photos") return true;
    if (step.type === "consent") {
      if (formValues.lgpd_consent !== "true") {
        setError("Você precisa aceitar para continuar");
        return false;
      }
      return true;
    }
    if (step.validate) {
      const err = step.validate(formValues[step.field]);
      if (err) {
        setError(err);
        return false;
      }
    }
    return true;
  };

  const goNext = useCallback(() => {
    if (isAnimating) return;
    if (!validateCurrent()) return;

    // Track step milestones
    if (currentStep === 6) trackEvent({ event: "form_step_1" });
    if (currentStep === 11) trackEvent({ event: "form_step_2" });

    if (currentStep < totalSteps - 1) {
      setIsAnimating(true);
      setDirection("next");
      setError(null);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      handleSubmit();
    }
  }, [currentStep, formValues, isAnimating]);

  const goPrev = useCallback(() => {
    if (isAnimating || currentStep === 0) return;
    setIsAnimating(true);
    setDirection("prev");
    setError(null);
    setTimeout(() => {
      setCurrentStep((prev) => prev - 1);
      setIsAnimating(false);
    }, 300);
  }, [currentStep, isAnimating]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && step.type !== "photos") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, step.type]);

  const handlePhotoUpload = (index: number, file: File | null) => {
    if (!file) return;
    const next = [...photos];
    next[index] = file;
    setPhotos(next);
    const urls = [...photoUrls];
    if (urls[index]) URL.revokeObjectURL(urls[index]!);
    urls[index] = URL.createObjectURL(file);
    setPhotoUrls(urls);
  };

  const removePhoto = (index: number) => {
    const next = [...photos];
    next[index] = null;
    setPhotos(next);
    const urls = [...photoUrls];
    if (urls[index]) URL.revokeObjectURL(urls[index]!);
    urls[index] = null;
    setPhotoUrls(urls);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const utm = getUTMParams();

    const payload: SubmitLeadPayload = {
      name: formValues.name,
      phone: formValues.phone,
      city: formValues.city,
      vehicle_brand: formValues.vehicle_brand,
      vehicle_model: formValues.vehicle_model,
      vehicle_year: formValues.vehicle_year,
      km: formValues.km,
      urgency: formValues.urgency,
      discount_acceptance: formValues.discount_acceptance,
      docs_status: formValues.docs_status,
      finance_status: formValues.finance_status,
      photos: photos.filter(Boolean).map((f) => f!.name),
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      gclid: utm.gclid,
      lgpd_consent: formValues.lgpd_consent === "true",
    };

    const result = await submitLead(payload);
    setSubmitting(false);

    if (result.success) {
      trackEvent({ event: "form_submit" });
      setSubmitResult({ score: result.score, tier: result.tier });
      setSubmitted(true);
      onComplete?.();
    } else {
      setError(result.message);
    }
  };

  // ------ Success screen ------
  if (submitted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="max-w-md w-full text-center animate-[fadeInUp_0.6s_ease-out]">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-8 animate-[scaleIn_0.5s_ease-out]">
            <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            Cadastro realizado!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
            Recebemos seus dados. Nossa equipe vai validar e lojistas da sua
            região poderão enviar propostas em breve.
          </p>
          {submitResult?.tier && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
              submitResult.tier === "hot"
                ? "bg-red-50 text-red-700 border-red-200"
                : submitResult.tier === "warm"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}>
              {submitResult.tier === "hot"
                ? "Prioridade alta — retornaremos rápido!"
                : submitResult.tier === "warm"
                ? "Boas chances — em breve você receberá propostas"
                : "Recebido — analisaremos seu veículo"}
            </div>
          )}
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-6">
            Fique atento ao seu WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  // ------ Render step content ------
  const renderStepContent = () => {
    switch (step.type) {
      case "text":
      case "tel":
        return (
          <input
            ref={inputRef}
            type={step.type}
            value={formValues[step.field]}
            onChange={(e) => setValue(step.field, e.target.value)}
            placeholder={step.placeholder}
            maxLength={step.maxLength}
            className="w-full bg-transparent border-b-3 border-gray-300 focus:border-primary text-2xl md:text-3xl font-medium py-3 outline-none transition-colors duration-300 placeholder:text-gray-300"
            autoFocus
          />
        );

      case "select":
        return (
          <div className="relative">
            <select
              value={formValues[step.field]}
              onChange={(e) => {
                setValue(step.field, e.target.value);
                if (e.target.value) {
                  setTimeout(() => goNext(), 400);
                }
              }}
              className="w-full bg-transparent border-b-3 border-gray-300 focus:border-primary text-2xl md:text-3xl font-medium py-3 outline-none transition-colors duration-300 appearance-none cursor-pointer"
            >
              <option value="">Selecione...</option>
              {step.selectOptions?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" />
          </div>
        );

      case "options":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {step.options?.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setValue(step.field, opt.value);
                  setTimeout(() => {
                    if (!isAnimating && currentStep < totalSteps - 1) {
                      setIsAnimating(true);
                      setDirection("next");
                      setError(null);
                      setTimeout(() => {
                        setCurrentStep((prev) => prev + 1);
                        setIsAnimating(false);
                      }, 300);
                    }
                  }, 300);
                }}
                className={`group relative py-4 px-6 rounded-2xl border-2 text-left text-lg font-medium transition-all duration-200 cursor-pointer ${
                  formValues[step.field] === opt.value
                    ? "border-primary bg-primary/5 text-primary shadow-md scale-[1.02]"
                    : "border-gray-200 text-gray-700 hover:border-primary/40 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    formValues[step.field] === opt.value
                      ? "border-primary bg-primary"
                      : "border-gray-300 group-hover:border-primary/40"
                  }`}>
                    {formValues[step.field] === opt.value && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </span>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        );

      case "photos":
        return (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {PHOTO_LABELS.map((label, index) => (
              <div key={label}>
                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => { fileRefs.current[index] = el; }}
                  onChange={(e) => handlePhotoUpload(index, e.target.files?.[0] || null)}
                  className="hidden"
                />
                {photoUrls[index] ? (
                  <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-primary">
                    <img src={photoUrls[index]!} alt={label} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRefs.current[index]?.click()}
                    className="w-full aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1.5 hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-400 font-medium">{label}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        );

      case "consent":
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nome</span>
                <span className="font-medium text-gray-900">{formValues.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">WhatsApp</span>
                <span className="font-medium text-gray-900">{formValues.phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Veículo</span>
                <span className="font-medium text-gray-900">
                  {formValues.vehicle_brand} {formValues.vehicle_model} {formValues.vehicle_year}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cidade</span>
                <span className="font-medium text-gray-900">{formValues.city}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Km</span>
                <span className="font-medium text-gray-900">{formValues.km}</span>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formValues.lgpd_consent === "true"}
                onChange={(e) => {
                  setValue("lgpd_consent", e.target.checked ? "true" : "");
                }}
                className="mt-1 w-5 h-5 accent-primary cursor-pointer"
              />
              <span className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">
                Autorizo o uso dos meus dados para receber propostas de lojistas
                e contato via WhatsApp, conforme a Lei Geral de Proteção de
                Dados (LGPD). Posso revogar esta autorização a qualquer momento.
              </span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white dark:bg-gray-900">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-gray-100 dark:bg-gray-800">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="fixed top-1.5 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">AutoOportunidade</span>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {currentStep + 1} de {totalSteps}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-32">
        <div className="w-full max-w-xl">
          <div
            key={currentStep}
            className={`transition-all duration-300 ${
              isAnimating
                ? direction === "next"
                  ? "opacity-0 translate-y-8"
                  : "opacity-0 -translate-y-8"
                : "opacity-100 translate-y-0"
            }`}
          >
            {/* Step icon */}
            <div className="mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
              {step.title}
            </h2>
            {step.subtitle && (
              <p className="text-base md:text-lg text-gray-400 dark:text-gray-500 mb-8">
                {step.subtitle}
              </p>
            )}

            {/* Input area */}
            <div className="mt-6">
              {renderStepContent()}
            </div>

            {/* Error */}
            {error && (
              <p className="mt-4 text-red-500 text-sm font-medium animate-[shake_0.3s_ease-in-out]">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800 z-40">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 py-2.5 px-5 rounded-xl font-medium transition-all cursor-pointer ${
              currentStep === 0
                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <button
            onClick={goNext}
            disabled={submitting}
            className="flex items-center gap-2 bg-primary text-white py-3 px-8 rounded-xl font-bold text-base transition-all hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer disabled:opacity-60"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enviando...
              </>
            ) : currentStep === totalSteps - 1 ? (
              <>
                Enviar cadastro
                <Check className="w-5 h-5" />
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Enter hint */}
        <div className="hidden md:block text-center pb-3">
          <span className="text-xs text-gray-300">
            Pressione <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-400 font-mono text-[10px]">Enter ↵</kbd> para continuar
          </span>
        </div>
      </div>
    </div>
  );
}
