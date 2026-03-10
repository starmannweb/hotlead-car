"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowRight, ArrowLeft, Check, Car, User, Phone, MapPin,
  Gauge, Clock, TrendingDown, FileText, Banknote, Camera,
  X, ChevronDown, Search, Loader2,
} from "lucide-react";
import {
  URGENCY_OPTIONS, DISCOUNT_OPTIONS, DOCS_OPTIONS,
  FINANCE_OPTIONS, PHOTO_LABELS, BRAZILIAN_STATES,
} from "@/lib/constants";
import { POPULAR_BRANDS, getDisplayName } from "@/lib/fipe";
import type { FipeBrand } from "@/lib/fipe";
import { formatPhone, validatePhone, formatKm } from "@/lib/validators";
import { trackEvent, getUTMParams } from "@/lib/tracking";
import { submitLead } from "@/lib/api";
import type { SubmitLeadPayload } from "@/lib/api";

/* --------------------------------------------------------- */
/* Step definitions                                          */
/* --------------------------------------------------------- */
interface StepDef {
  id: string; field: string; title: string; subtitle?: string;
  icon: React.ElementType;
  type: "text" | "tel" | "select" | "options" | "photos" | "consent" | "brand_picker" | "model_picker" | "year_picker" | "state_city";
  placeholder?: string;
  options?: { value: string; label: string }[];
  selectOptions?: string[];
  required?: boolean; maxLength?: number;
  validate?: (v: string, extra?: Record<string, string>) => string | null;
  format?: (v: string) => string;
}

const STEPS: StepDef[] = [
  { id: "name", field: "name", title: "Qual é o seu nome?", subtitle: "Precisamos saber quem está vendendo", icon: User, type: "text", placeholder: "Digite seu nome completo", required: true, validate: (v) => (!v.trim() ? "Informe seu nome" : null) },
  { id: "phone", field: "phone", title: "Qual seu WhatsApp?", subtitle: "Os lojistas entrarão em contato por aqui", icon: Phone, type: "tel", placeholder: "(11) 99999-9999", required: true, maxLength: 16, validate: (v) => (!validatePhone(v) ? "Número inválido. Use DDD + número" : null), format: formatPhone },
  { id: "state_city", field: "state", title: "Onde você está?", subtitle: "Selecione o estado e depois a cidade", icon: MapPin, type: "state_city", required: true, validate: (_v, extra) => { if (!extra?.state) return "Selecione o estado"; if (!extra?.city) return "Selecione a cidade"; return null; } },
  { id: "vehicle_brand", field: "vehicle_brand", title: "Qual a marca do seu carro?", subtitle: "Selecione a marca do veículo", icon: Car, type: "brand_picker", required: true, validate: (v) => (!v ? "Selecione a marca" : null) },
  { id: "vehicle_model", field: "vehicle_model", title: "Qual o modelo?", subtitle: "Comece a digitar para buscar modelos", icon: Car, type: "model_picker", placeholder: "Buscar modelo...", required: true, validate: (v) => (!v.trim() ? "Informe o modelo" : null) },
  { id: "vehicle_year", field: "vehicle_year", title: "Qual o ano do veículo?", subtitle: "Selecione o ano de fabricação", icon: Car, type: "year_picker", required: true, validate: (v) => (!v.trim() ? "Selecione o ano" : null) },
  { id: "km", field: "km", title: "Qual a quilometragem?", subtitle: "Valor aproximado em km", icon: Gauge, type: "text", placeholder: "Ex: 45.000", required: true, validate: (v) => (!v.trim() ? "Informe a quilometragem" : null), format: formatKm },
  { id: "urgency", field: "urgency", title: "Quando você precisa vender?", subtitle: "Quanto mais urgente, mais rápido conectamos", icon: Clock, type: "options", options: URGENCY_OPTIONS, required: true, validate: (v) => (!v ? "Selecione a urgência" : null) },
  { id: "discount_acceptance", field: "discount_acceptance", title: "Aceita propostas abaixo da FIPE?", subtitle: "Lojistas compram para revender - propostas abaixo da tabela são comuns", icon: TrendingDown, type: "options", options: DISCOUNT_OPTIONS, required: true, validate: (v) => (!v ? "Selecione uma opção" : null) },
  { id: "docs_status", field: "docs_status", title: "Como está a documentação?", subtitle: "Documentação em dia facilita propostas melhores", icon: FileText, type: "options", options: DOCS_OPTIONS, required: true, validate: (v) => (!v ? "Selecione uma opção" : null) },
  { id: "finance_status", field: "finance_status", title: "O veículo tem financiamento ativo?", subtitle: "Isso não impede a venda, apenas precisamos saber", icon: Banknote, type: "options", options: FINANCE_OPTIONS, required: true, validate: (v) => (!v ? "Selecione uma opção" : null) },
  { id: "photos", field: "photos", title: "Tem fotos do veículo?", subtitle: "Opcional - fotos aumentam as chances de propostas melhores", icon: Camera, type: "photos" },
  { id: "consent", field: "lgpd_consent", title: "Quase lá! Confirme para receber propostas", subtitle: "Seus dados são protegidos conforme a LGPD", icon: Check, type: "consent", required: true },
];

/* --------------------------------------------------------- */
/* Helpers                                                   */
/* --------------------------------------------------------- */
const fileToBase64 = (file: File, maxWidth = 800): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale; canvas.height = img.height * scale;
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

interface FipeModel { code: string; name: string }
interface FipeYear { code: string; name: string }

interface TypeformFlowProps {
  initialData?: { name?: string; phone?: string; };
  onComplete?: () => void;
}

/* ========================================================= */
/* Component                                                 */
/* ========================================================= */
export default function TypeformFlow({ initialData, onComplete }: TypeformFlowProps) {
  const [currentStep, setCurrentStep] = useState(() => {
    if (initialData?.name && initialData?.phone && validatePhone(initialData.phone)) {
      return 2; // Jump to state_city if name and phone are already valid
    }
    return 0;
  });
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [formValues, setFormValues] = useState<Record<string, string>>({
    name: initialData?.name || "", phone: initialData?.phone || "", state: "", city: "",
    vehicle_brand: "", vehicle_model: "",
    vehicle_year: "", km: "", urgency: "",
    discount_acceptance: "", docs_status: "", finance_status: "", lgpd_consent: "",
  });
  const [photos, setPhotos] = useState<(File | null)[]>(Array(PHOTO_LABELS.length).fill(null));
  const [photoUrls, setPhotoUrls] = useState<(string | null)[]>(Array(PHOTO_LABELS.length).fill(null));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ score?: number; tier?: string } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // FIPE
  const [brandSearch, setBrandSearch] = useState("");
  const [selectedBrandCode, setSelectedBrandCode] = useState("");
  const [fipeModels, setFipeModels] = useState<FipeModel[]>([]);
  const [modelSearch, setModelSearch] = useState("");
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedModelCode, setSelectedModelCode] = useState("");
  const [fipeYears, setFipeYears] = useState<FipeYear[]>([]);
  const [loadingYears, setLoadingYears] = useState(false);
  const [allBrands, setAllBrands] = useState<FipeBrand[]>([]);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Cities
  const [cities, setCities] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState("");
  const [loadingCities, setLoadingCities] = useState(false);
  const [geoDetected, setGeoDetected] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hasTrackedStart = useRef(false);

  const step = STEPS[currentStep];
  const totalSteps = STEPS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Focus input
  useEffect(() => { const t = setTimeout(() => inputRef.current?.focus(), 350); return () => clearTimeout(t); }, [currentStep]);

  // Track start
  useEffect(() => { if (!hasTrackedStart.current) { trackEvent({ event: "form_start" }); hasTrackedStart.current = true; } }, []);

  // GeoIP on mount
  useEffect(() => {
    fetch("/api/cities?action=geoip").then(r => r.json()).then(data => {
      if (data.success && data.data?.state) {
        setFormValues(prev => ({ ...prev, state: data.data.state }));
        setGeoDetected(true);
        fetchCities(data.data.state);
      }
    }).catch(() => { });
  }, []);

  // Load brands
  useEffect(() => {
    fetch("/api/fipe?type=brands").then(r => r.json()).then(data => {
      if (data.success) setAllBrands(data.data.map((b: { code: string; name: string }) => ({ code: b.code, name: b.name, logo: "" })));
    }).catch(() => { });
  }, []);

  // Fetch models
  useEffect(() => {
    if (!selectedBrandCode) { setFipeModels([]); return; }
    setLoadingModels(true);
    fetch(`/api/fipe?type=models&brandCode=${selectedBrandCode}`).then(r => r.json()).then(d => { if (d.success) setFipeModels(d.data); }).catch(() => { }).finally(() => setLoadingModels(false));
  }, [selectedBrandCode]);

  // Fetch years
  useEffect(() => {
    if (!selectedBrandCode || !selectedModelCode) { setFipeYears([]); return; }
    setLoadingYears(true);
    fetch(`/api/fipe?type=years&brandCode=${selectedBrandCode}&modelCode=${selectedModelCode}`).then(r => r.json()).then(d => { if (d.success) setFipeYears(d.data); }).catch(() => { }).finally(() => setLoadingYears(false));
  }, [selectedBrandCode, selectedModelCode]);

  const fetchCities = (uf: string) => {
    setLoadingCities(true);
    fetch(`/api/cities?uf=${uf}`).then(r => r.json()).then(d => { if (d.success) setCities(d.data); }).catch(() => { }).finally(() => setLoadingCities(false));
  };

  const setValue = (field: string, value: string) => {
    const s = STEPS.find(x => x.field === field);
    const formatted = s?.format ? s.format(value) : value;
    setFormValues(prev => ({ ...prev, [field]: formatted }));
    setError(null);
  };

  const autoAdvance = useCallback(() => {
    setTimeout(() => {
      if (!isAnimating && currentStep < totalSteps - 1) {
        setIsAnimating(true); setDirection("next"); setError(null);
        setTimeout(() => { setCurrentStep(p => p + 1); setIsAnimating(false); }, 300);
      }
    }, 300);
  }, [isAnimating, currentStep, totalSteps]);

  const validateCurrent = (): boolean => {
    if (step.type === "photos") return true;
    if (step.type === "consent") { if (formValues.lgpd_consent !== "true") { setError("Você precisa aceitar para continuar"); return false; } return true; }
    if (step.type === "state_city") { const err = step.validate?.("", { state: formValues.state, city: formValues.city }); if (err) { setError(err); return false; } return true; }
    if (step.validate) { const err = step.validate(formValues[step.field]); if (err) { setError(err); return false; } }
    return true;
  };

  const goNext = useCallback(() => {
    if (isAnimating) return;
    if (!validateCurrent()) return;
    if (currentStep < totalSteps - 1) {
      setIsAnimating(true); setDirection("next"); setError(null);
      setTimeout(() => { setCurrentStep(p => p + 1); setIsAnimating(false); }, 300);
    } else handleSubmit();
  }, [currentStep, formValues, isAnimating]);

  const goPrev = useCallback(() => {
    if (isAnimating || currentStep === 0) return;
    setIsAnimating(true); setDirection("prev"); setError(null);
    setTimeout(() => { setCurrentStep(p => p - 1); setIsAnimating(false); }, 300);
  }, [currentStep, isAnimating]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Enter" && !["photos", "brand_picker", "model_picker", "year_picker", "state_city"].includes(step.type)) { e.preventDefault(); goNext(); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [goNext, step.type]);

  const handlePhotoUpload = (i: number, file: File | null) => {
    if (!file) return;
    const next = [...photos]; next[i] = file; setPhotos(next);
    const urls = [...photoUrls]; if (urls[i]) URL.revokeObjectURL(urls[i]!); urls[i] = URL.createObjectURL(file); setPhotoUrls(urls);
  };
  const removePhoto = (i: number) => {
    const next = [...photos]; next[i] = null; setPhotos(next);
    const urls = [...photoUrls]; if (urls[i]) URL.revokeObjectURL(urls[i]!); urls[i] = null; setPhotoUrls(urls);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const utm = getUTMParams();
    const validPhotos = photos.filter(Boolean) as File[];
    const photoBase64 = await Promise.all(validPhotos.map(f => fileToBase64(f)));
    const payload: SubmitLeadPayload = {
      name: formValues.name, phone: formValues.phone, state: formValues.state, city: formValues.city,
      vehicle_brand: formValues.vehicle_brand, vehicle_model: formValues.vehicle_model,
      vehicle_year: formValues.vehicle_year, km: formValues.km, urgency: formValues.urgency,
      discount_acceptance: formValues.discount_acceptance, docs_status: formValues.docs_status,
      finance_status: formValues.finance_status, photos: photoBase64,
      utm_source: utm.utm_source, utm_medium: utm.utm_medium, utm_campaign: utm.utm_campaign, gclid: utm.gclid,
      lgpd_consent: formValues.lgpd_consent === "true",
    };
    const result = await submitLead(payload);
    setSubmitting(false);
    if (result.success) { trackEvent({ event: "form_submit" }); setSubmitResult({ score: result.score, tier: result.tier }); setSubmitted(true); onComplete?.(); }
    else setError(result.message);
  };

  /* ---------- SUCCESS ---------- */
  if (submitted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4">
        <div className="max-w-md w-full text-center animate-[fadeInUp_0.6s_ease-out]">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"><Check className="w-12 h-12 text-green-600" /></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Cadastro realizado!</h1>
          <p className="text-gray-500 text-lg mb-6">Recebemos seus dados. Lojistas da sua regiao poderao enviar propostas em breve.</p>
          {submitResult?.tier && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${submitResult.tier === "hot" ? "bg-red-50 text-red-700 border-red-200" : submitResult.tier === "warm" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
              {submitResult.tier === "hot" ? "Prioridade alta!" : submitResult.tier === "warm" ? "Boas chances de propostas" : "Recebido - analisaremos"}
            </div>
          )}
          <p className="text-gray-400 text-sm mt-6">Fique atento ao seu WhatsApp.</p>
        </div>
      </div>
    );
  }

  /* ---------- STATE + CITY PICKER ---------- */
  const renderStateCity = () => {
    const filteredCities = cities.filter(c => citySearch ? c.toLowerCase().includes(citySearch.toLowerCase()) : true).slice(0, 30);

    return (
      <div className="space-y-5">
        {/* State selector */}
        <div>
          <label className="text-sm font-medium text-gray-500 mb-2 block">Estado (UF)</label>
          <div className="relative">
            <select
              value={formValues.state}
              onChange={(e) => {
                setValue("state", e.target.value);
                setValue("city", ""); setCitySearch("");
                if (e.target.value) fetchCities(e.target.value);
              }}
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="">Selecione o estado...</option>
              {BRAZILIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* City search */}
        {formValues.state && (
          <div>
            <label className="text-sm font-medium text-gray-500 mb-2 block">Cidade</label>
            {formValues.city && !citySearch && (
              <div className="mb-2 flex items-center gap-2">
                <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">{formValues.city}</span>
                <button type="button" onClick={() => { setValue("city", ""); setCitySearch(""); }} className="text-xs text-gray-400 hover:text-red-500 cursor-pointer">trocar</button>
              </div>
            )}
            {(!formValues.city || citySearch) && (
              <>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Digite o nome da cidade..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                  {loadingCities && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />}
                </div>

                {citySearch.length >= 1 && filteredCities.length > 0 && (
                  <div className="mt-2 max-h-[250px] overflow-y-auto space-y-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                    {filteredCities.map(c => (
                      <button
                        key={c} type="button"
                        onClick={() => { setValue("city", c); setCitySearch(""); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 cursor-pointer transition-colors flex items-center gap-2 ${formValues.city === c ? "text-primary font-bold bg-primary/5" : "text-gray-700"}`}
                      >
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {c}
                      </button>
                    ))}
                  </div>
                )}
                {citySearch.length >= 2 && filteredCities.length === 0 && !loadingCities && (
                  <p className="mt-2 text-sm text-gray-400">Nenhuma cidade encontrada para &quot;{citySearch}&quot;</p>
                )}
              </>
            )}
          </div>
        )}

        {/* GeoIP badge */}
        {geoDetected && formValues.city && !citySearch && (
          <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" />Detectado automaticamente pela sua localizacao</p>
        )}
      </div>
    );
  };

  /* ---------- BRAND PICKER (LIST with logos) ---------- */
  const renderBrandPicker = () => {
    const pool = showAllBrands ? allBrands : POPULAR_BRANDS;
    const filtered = pool.filter(b => brandSearch ? b.name.toLowerCase().includes(brandSearch.toLowerCase()) : true);

    return (
      <div>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input ref={inputRef} type="text" placeholder="Buscar marca..." value={brandSearch} onChange={e => setBrandSearch(e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" autoFocus />
        </div>
        <div className="max-h-[380px] overflow-y-auto space-y-1 pr-1">
          {filtered.map(brand => {
            const isSelected = formValues.vehicle_brand === brand.name;
            const displayName = getDisplayName(brand.name);
            const pop = POPULAR_BRANDS.find(b => b.code === brand.code);
            const logo = pop?.logo || brand.logo;
            return (
              <button key={brand.code} type="button"
                onClick={() => { setValue("vehicle_brand", brand.name); setSelectedBrandCode(brand.code); setModelSearch(""); setValue("vehicle_model", ""); setSelectedModelCode(""); setValue("vehicle_year", ""); autoAdvance(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-transparent hover:border-gray-200 hover:bg-gray-50"}`}
              >
                {logo ? (
                  <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                    <img src={logo} alt={displayName} className="w-8 h-8 object-contain"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-sm font-bold text-gray-400">${displayName.charAt(0)}</span>`; }} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><span className="text-sm font-bold text-gray-400">{displayName.charAt(0)}</span></div>
                )}
                <span className={`font-medium ${isSelected ? "text-primary" : "text-gray-900"}`}>{displayName}</span>
                {isSelected && <Check className="w-5 h-5 text-primary ml-auto shrink-0" />}
              </button>
            );
          })}
          {filtered.length === 0 && <p className="text-center text-gray-400 py-6">Marca nao encontrada</p>}
        </div>
        {!showAllBrands && <button type="button" onClick={() => setShowAllBrands(true)} className="mt-3 text-sm text-primary hover:underline cursor-pointer flex items-center gap-1 mx-auto"><ChevronDown className="w-4 h-4" />Ver todas as marcas ({allBrands.length})</button>}
        {showAllBrands && <button type="button" onClick={() => setShowAllBrands(false)} className="mt-3 text-sm text-gray-500 hover:underline cursor-pointer mx-auto block">Mostrar apenas populares</button>}
      </div>
    );
  };

  /* ---------- MODEL PICKER ---------- */
  const renderModelPicker = () => {
    const filtered = fipeModels.filter(m => modelSearch ? m.name.toLowerCase().includes(modelSearch.toLowerCase()) : true);
    return (
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-500">Marca:</span>
          <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{getDisplayName(formValues.vehicle_brand)}</span>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input ref={inputRef} type="text" placeholder="Buscar modelo..." value={modelSearch} onChange={e => setModelSearch(e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" autoFocus />
        </div>
        {loadingModels ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /><span className="ml-3 text-gray-500">Carregando modelos...</span></div>
        ) : (
          <div className="max-h-[320px] overflow-y-auto space-y-1 pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-400"><Car className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>Nenhum modelo encontrado</p></div>
            ) : filtered.map(model => {
              const isSelected = formValues.vehicle_model === model.name;
              const shortName = model.name.split(/\s+/).slice(0, 3).join(" ");
              return (
                <button key={model.code} type="button"
                  onClick={() => { setValue("vehicle_model", model.name); setSelectedModelCode(model.code); setValue("vehicle_year", ""); autoAdvance(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-gray-200 hover:bg-gray-50"}`}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? "bg-primary" : "bg-gray-300"}`} />
                  <div className="flex-1 min-w-0"><p className={`font-medium truncate ${isSelected ? "text-primary" : "text-gray-900"}`}>{shortName}</p>{model.name !== shortName && <p className="text-xs text-gray-400 truncate">{model.name}</p>}</div>
                  {isSelected && <Check className="w-5 h-5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ---------- YEAR PICKER ---------- */
  const renderYearPicker = () => (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500">Veiculo:</span>
        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{getDisplayName(formValues.vehicle_brand)}</span>
        <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full truncate max-w-[250px]">{formValues.vehicle_model.split(/\s+/).slice(0, 3).join(" ")}</span>
      </div>
      {loadingYears ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /><span className="ml-3 text-gray-500">Carregando anos...</span></div>
      ) : fipeYears.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto pr-1">
          {fipeYears.map(y => {
            const isSelected = formValues.vehicle_year === y.name;
            return (
              <button key={y.code} type="button" onClick={() => { setValue("vehicle_year", y.name); autoAdvance(); }}
                className={`py-4 px-4 rounded-xl border-2 text-center font-medium transition-all cursor-pointer ${isSelected ? "border-primary bg-primary/5 text-primary scale-[1.02]" : "border-gray-200 text-gray-700 hover:border-primary/40 hover:bg-gray-50"}`}
              >{y.name}</button>
            );
          })}
        </div>
      ) : (
        <div>
          <p className="text-gray-500 text-sm mb-4">Nao encontramos anos na FIPE. Digite manualmente:</p>
          <input ref={inputRef} type="text" placeholder="Ex: 2020" value={formValues.vehicle_year} onChange={e => setValue("vehicle_year", e.target.value)} maxLength={9}
            className="w-full bg-transparent border-b-3 border-gray-300 focus:border-primary text-2xl font-medium py-3 outline-none transition-colors placeholder:text-gray-300" autoFocus />
        </div>
      )}
    </div>
  );

  /* ---------- RENDER STEP CONTENT ---------- */
  const renderStepContent = () => {
    switch (step.type) {
      case "state_city": return renderStateCity();
      case "brand_picker": return renderBrandPicker();
      case "model_picker": return renderModelPicker();
      case "year_picker": return renderYearPicker();
      case "text": case "tel":
        return <input ref={inputRef} type={step.type} value={formValues[step.field]} onChange={e => setValue(step.field, e.target.value)} placeholder={step.placeholder} maxLength={step.maxLength}
          className="w-full bg-transparent border-b-3 border-gray-300 focus:border-primary text-2xl md:text-3xl font-medium py-3 outline-none transition-colors placeholder:text-gray-300" autoFocus />;
      case "select":
        return (
          <div className="relative">
            <select value={formValues[step.field]} onChange={e => { setValue(step.field, e.target.value); if (e.target.value) setTimeout(() => goNext(), 400); }}
              className="w-full bg-transparent border-b-3 border-gray-300 focus:border-primary text-2xl font-medium py-3 outline-none appearance-none cursor-pointer">
              <option value="">Selecione...</option>
              {step.selectOptions?.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" />
          </div>
        );
      case "options":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {step.options?.map(opt => (
              <button key={opt.value} type="button" onClick={() => { setValue(step.field, opt.value); autoAdvance(); }}
                className={`group relative py-4 px-6 rounded-2xl border-2 text-left text-lg font-medium transition-all cursor-pointer ${formValues[step.field] === opt.value ? "border-primary bg-primary/5 text-primary shadow-md scale-[1.02]" : "border-gray-200 text-gray-700 hover:border-primary/40 hover:bg-gray-50"}`}>
                <span className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${formValues[step.field] === opt.value ? "border-primary bg-primary" : "border-gray-300 group-hover:border-primary/40"}`}>
                    {formValues[step.field] === opt.value && <Check className="w-3.5 h-3.5 text-white" />}
                  </span>{opt.label}
                </span>
              </button>
            ))}
          </div>
        );
      case "photos":
        return (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {PHOTO_LABELS.map((label, i) => (
              <div key={label}>
                <input type="file" accept="image/*" ref={el => { fileRefs.current[i] = el; }} onChange={e => handlePhotoUpload(i, e.target.files?.[0] || null)} className="hidden" />
                {photoUrls[i] ? (
                  <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-primary">
                    <img src={photoUrls[i]!} alt={label} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRefs.current[i]?.click()} className="w-full aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1.5 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                    <Camera className="w-6 h-6 text-gray-400" /><span className="text-xs text-gray-400 font-medium">{label}</span>
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
              {[["Nome", formValues.name], ["WhatsApp", formValues.phone], ["Veiculo", `${getDisplayName(formValues.vehicle_brand)} ${formValues.vehicle_model.split(/\s+/).slice(0, 2).join(" ")} ${formValues.vehicle_year}`], ["Local", `${formValues.city} - ${formValues.state}`], ["Km", formValues.km]].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm"><span className="text-gray-500">{l}</span><span className="font-medium text-gray-900 truncate max-w-[200px]">{v}</span></div>
              ))}
            </div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" checked={formValues.lgpd_consent === "true"} onChange={e => setValue("lgpd_consent", e.target.checked ? "true" : "")} className="mt-1 w-5 h-5 accent-primary cursor-pointer" />
              <span className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-700">Autorizo o uso dos meus dados para receber propostas de lojistas e contato via WhatsApp, conforme a LGPD.</span>
            </label>
          </div>
        );
      default: return null;
    }
  };

  /* ---------- MAIN RENDER ---------- */
  return (
    <div className="min-h-[100dvh] flex flex-col bg-white dark:bg-gray-900">
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-gray-100"><div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} /></div>
      <div className="fixed top-1.5 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center"><Car className="w-4 h-4 text-white" /></div><span className="font-bold text-gray-900 text-sm">AutoOportunidade</span></div>
          <span className="text-xs text-gray-400 font-medium">{currentStep + 1} de {totalSteps}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-32">
        <div className="w-full max-w-xl">
          <div key={currentStep} className={`transition-all duration-300 ${isAnimating ? (direction === "next" ? "opacity-0 translate-y-8" : "opacity-0 -translate-y-8") : "opacity-100 translate-y-0"}`}>
            <div className="mb-6"><div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center"><step.icon className="w-7 h-7 text-primary" /></div></div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">{step.title}</h2>
            {step.subtitle && <p className="text-base md:text-lg text-gray-400 mb-8">{step.subtitle}</p>}
            <div className="mt-6">{renderStepContent()}</div>
            {error && <p className="mt-4 text-red-500 text-sm font-medium animate-[shake_0.3s_ease-in-out]">{error}</p>}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-100 z-40">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={goPrev} disabled={currentStep === 0} className={`flex items-center gap-2 py-2.5 px-5 rounded-xl font-medium transition-all cursor-pointer ${currentStep === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}><ArrowLeft className="w-4 h-4" />Voltar</button>
          <button onClick={goNext} disabled={submitting} className="flex items-center gap-2 bg-primary text-white py-3 px-8 rounded-xl font-bold text-base transition-all hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer disabled:opacity-60">
            {submitting ? (<><Loader2 className="w-5 h-5 animate-spin" />Enviando...</>) : currentStep === totalSteps - 1 ? (<>Enviar cadastro<Check className="w-5 h-5" /></>) : (<>Continuar<ArrowRight className="w-5 h-5" /></>)}
          </button>
        </div>
        <div className="hidden md:block text-center pb-3"><span className="text-xs text-gray-300">Pressione <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-400 font-mono text-[10px]">Enter</kbd> para continuar</span></div>
      </div>
    </div>
  );
}
