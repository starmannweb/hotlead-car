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
  Clock,
  TrendingDown,
  FileText,
  Banknote,
  Camera,
  X,
  ChevronDown,
  Search,
} from "lucide-react";
import {
  URGENCY_OPTIONS,
  DISCOUNT_OPTIONS,
  DOCS_OPTIONS,
  FINANCE_OPTIONS,
  PHOTO_LABELS,
  BRAZILIAN_STATES,
} from "@/lib/constants";
import { POPULAR_BRANDS, getDisplayName } from "@/lib/fipe";
import type { FipeBrand } from "@/lib/fipe";
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
  type: "text" | "tel" | "select" | "options" | "photos" | "consent" | "brand_picker" | "model_picker" | "year_picker";
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
    title: "Qual e o seu nome?",
    subtitle: "Precisamos saber quem esta vendendo",
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
    subtitle: "Os lojistas entrarao em contato por aqui",
    icon: Phone,
    type: "tel",
    placeholder: "(11) 99999-9999",
    required: true,
    maxLength: 16,
    validate: (v) => (!validatePhone(v) ? "Numero invalido. Use DDD + numero" : null),
    format: formatPhone,
  },
  {
    id: "state",
    field: "state",
    title: "Qual o seu estado?",
    subtitle: "Selecione a UF",
    icon: MapPin,
    type: "select",
    selectOptions: BRAZILIAN_STATES,
    required: true,
    validate: (v) => (!v ? "Selecione o estado" : null),
  },
  {
    id: "city",
    field: "city",
    title: "Em qual cidade voce esta?",
    subtitle: "Vamos conectar com lojistas da sua regiao",
    icon: MapPin,
    type: "text",
    placeholder: "Ex: Sao Paulo",
    required: true,
    validate: (v) => (!v.trim() ? "Informe sua cidade" : null),
  },
  {
    id: "vehicle_brand",
    field: "vehicle_brand",
    title: "Qual a marca do seu carro?",
    subtitle: "Selecione a marca do veiculo",
    icon: Car,
    type: "brand_picker",
    required: true,
    validate: (v) => (!v ? "Selecione a marca" : null),
  },
  {
    id: "vehicle_model",
    field: "vehicle_model",
    title: "Qual o modelo?",
    subtitle: "Comece a digitar para buscar modelos da marca selecionada",
    icon: Car,
    type: "model_picker",
    placeholder: "Buscar modelo...",
    required: true,
    validate: (v) => (!v.trim() ? "Informe o modelo" : null),
  },
  {
    id: "vehicle_year",
    field: "vehicle_year",
    title: "Qual o ano do veiculo?",
    subtitle: "Selecione o ano de fabricacao",
    icon: Car,
    type: "year_picker",
    required: true,
    validate: (v) => {
      if (!v.trim()) return "Selecione o ano";
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
    title: "Quando voce precisa vender?",
    subtitle: "Quanto mais urgente, mais rapido conectamos com lojistas",
    icon: Clock,
    type: "options",
    options: URGENCY_OPTIONS,
    required: true,
    validate: (v) => (!v ? "Selecione a urgencia" : null),
  },
  {
    id: "discount_acceptance",
    field: "discount_acceptance",
    title: "Aceita propostas abaixo da FIPE?",
    subtitle: "Lojistas compram para revender - propostas abaixo da tabela sao comuns no mercado",
    icon: TrendingDown,
    type: "options",
    options: DISCOUNT_OPTIONS,
    required: true,
    validate: (v) => (!v ? "Selecione uma opcao" : null),
  },
  {
    id: "docs_status",
    field: "docs_status",
    title: "Como esta a documentacao?",
    subtitle: "Documentacao em dia facilita propostas melhores",
    icon: FileText,
    type: "options",
    options: DOCS_OPTIONS,
    required: true,
    validate: (v) => (!v ? "Selecione uma opcao" : null),
  },
  {
    id: "finance_status",
    field: "finance_status",
    title: "O veiculo tem financiamento ativo?",
    subtitle: "Isso nao impede a venda, apenas precisamos saber",
    icon: Banknote,
    type: "options",
    options: FINANCE_OPTIONS,
    required: true,
    validate: (v) => (!v ? "Selecione uma opcao" : null),
  },
  {
    id: "photos",
    field: "photos",
    title: "Tem fotos do veiculo?",
    subtitle: "Opcional - mas fotos aumentam as chances de propostas melhores",
    icon: Camera,
    type: "photos",
  },
  {
    id: "consent",
    field: "lgpd_consent",
    title: "Quase la! Confirme para receber propostas",
    subtitle: "Seus dados sao protegidos conforme a LGPD",
    icon: Check,
    type: "consent",
    required: true,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const fileToBase64 = (file: File, maxWidth = 800): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

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

interface FipeModel {
  code: string;
  name: string;
}

interface FipeYear {
  code: string;
  name: string;
}

export default function TypeformFlow({ initialData, onComplete }: TypeformFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [formValues, setFormValues] = useState<Record<string, string>>({
    name: "",
    phone: initialData?.phone || "",
    state: "",
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

  // FIPE state
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

  // Load all brands on mount (for "other" brands)
  useEffect(() => {
    fetch("/api/fipe?type=brands")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAllBrands(data.data.map((b: { code: string; name: string }) => ({
            code: b.code,
            name: b.name,
            logo: "",
          })));
        }
      })
      .catch(() => { });
  }, []);

  // Fetch models when brand changes
  useEffect(() => {
    if (!selectedBrandCode) {
      setFipeModels([]);
      return;
    }
    setLoadingModels(true);
    fetch(`/api/fipe?type=models&brandCode=${selectedBrandCode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setFipeModels(data.data);
      })
      .catch(() => { })
      .finally(() => setLoadingModels(false));
  }, [selectedBrandCode]);

  // Fetch years when model changes
  useEffect(() => {
    if (!selectedBrandCode || !selectedModelCode) {
      setFipeYears([]);
      return;
    }
    setLoadingYears(true);
    fetch(`/api/fipe?type=years&brandCode=${selectedBrandCode}&modelCode=${selectedModelCode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setFipeYears(data.data);
      })
      .catch(() => { })
      .finally(() => setLoadingYears(false));
  }, [selectedBrandCode, selectedModelCode]);

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
        setError("Voce precisa aceitar para continuar");
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && step.type !== "photos" && step.type !== "brand_picker" && step.type !== "model_picker" && step.type !== "year_picker") {
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

    const validPhotos = photos.filter(Boolean) as File[];
    const photoBase64 = await Promise.all(validPhotos.map((f) => fileToBase64(f)));

    const payload: SubmitLeadPayload = {
      name: formValues.name,
      phone: formValues.phone,
      state: formValues.state,
      city: formValues.city,
      vehicle_brand: formValues.vehicle_brand,
      vehicle_model: formValues.vehicle_model,
      vehicle_year: formValues.vehicle_year,
      km: formValues.km,
      urgency: formValues.urgency,
      discount_acceptance: formValues.discount_acceptance,
      docs_status: formValues.docs_status,
      finance_status: formValues.finance_status,
      photos: photoBase64,
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
            regiao poderao enviar propostas em breve.
          </p>
          {submitResult?.tier && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${submitResult.tier === "hot"
                ? "bg-red-50 text-red-700 border-red-200"
                : submitResult.tier === "warm"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}>
              {submitResult.tier === "hot"
                ? "Prioridade alta - retornaremos rapido!"
                : submitResult.tier === "warm"
                  ? "Boas chances - em breve voce recebera propostas"
                  : "Recebido - analisaremos seu veiculo"}
            </div>
          )}
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-6">
            Fique atento ao seu WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  // ------ Brand picker ------
  const renderBrandPicker = () => {
    const displayBrands = showAllBrands
      ? allBrands.filter((b) =>
        brandSearch ? b.name.toLowerCase().includes(brandSearch.toLowerCase()) : true
      )
      : POPULAR_BRANDS.filter((b) =>
        brandSearch ? b.name.toLowerCase().includes(brandSearch.toLowerCase()) : true
      );

    return (
      <div>
        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar marca..."
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            autoFocus
          />
        </div>

        {/* Brand grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-1">
          {displayBrands.map((brand) => {
            const isSelected = formValues.vehicle_brand === brand.name;
            const displayName = getDisplayName(brand.name);
            const popularBrand = POPULAR_BRANDS.find((b) => b.code === brand.code);
            const logo = popularBrand?.logo || brand.logo;

            return (
              <button
                key={brand.code}
                type="button"
                onClick={() => {
                  setValue("vehicle_brand", brand.name);
                  setSelectedBrandCode(brand.code);
                  setModelSearch("");
                  setValue("vehicle_model", "");
                  setSelectedModelCode("");
                  setValue("vehicle_year", "");
                  // Auto-advance
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
                  }, 250);
                }}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:scale-[1.03] ${isSelected
                    ? "border-primary bg-primary/5 shadow-md scale-[1.03]"
                    : "border-gray-200 hover:border-primary/40 hover:bg-gray-50"
                  }`}
              >
                {logo ? (
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-sm border border-gray-100">
                    <img
                      src={logo}
                      alt={displayName}
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-lg font-bold text-gray-400">${displayName.charAt(0)}</span>`;
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-400">{displayName.charAt(0)}</span>
                  </div>
                )}
                <span className={`text-xs font-medium text-center leading-tight ${isSelected ? "text-primary" : "text-gray-700"}`}>
                  {displayName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Show all toggle */}
        {!showAllBrands && (
          <button
            type="button"
            onClick={() => setShowAllBrands(true)}
            className="mt-4 text-sm text-primary hover:underline cursor-pointer flex items-center gap-1 mx-auto"
          >
            <ChevronDown className="w-4 h-4" />
            Ver todas as marcas ({allBrands.length})
          </button>
        )}
        {showAllBrands && (
          <button
            type="button"
            onClick={() => setShowAllBrands(false)}
            className="mt-4 text-sm text-gray-500 hover:underline cursor-pointer flex items-center gap-1 mx-auto"
          >
            Mostrar apenas populares
          </button>
        )}
      </div>
    );
  };

  // ------ Model picker ------
  const renderModelPicker = () => {
    const filteredModels = fipeModels.filter((m) =>
      modelSearch ? m.name.toLowerCase().includes(modelSearch.toLowerCase()) : true
    );

    return (
      <div>
        {/* Selected brand badge */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-500">Marca:</span>
          <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            {getDisplayName(formValues.vehicle_brand)}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar modelo..."
            value={modelSearch}
            onChange={(e) => setModelSearch(e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            autoFocus
          />
        </div>

        {loadingModels ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-500">Carregando modelos...</span>
          </div>
        ) : (
          <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
            {filteredModels.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Car className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum modelo encontrado</p>
                <p className="text-xs mt-1">Tente outra busca</p>
              </div>
            ) : (
              filteredModels.map((model) => {
                const isSelected = formValues.vehicle_model === model.name;
                // Extract short name (first part before specs)
                const shortName = model.name.split(/\s+/).slice(0, 3).join(" ");

                return (
                  <button
                    key={model.code}
                    type="button"
                    onClick={() => {
                      setValue("vehicle_model", model.name);
                      setSelectedModelCode(model.code);
                      setValue("vehicle_year", "");
                      // Auto-advance
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
                      }, 250);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-gray-200 hover:border-primary/40 hover:bg-gray-50"
                      }`}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? "bg-primary" : "bg-gray-300"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isSelected ? "text-primary" : "text-gray-900"}`}>
                        {shortName}
                      </p>
                      {model.name !== shortName && (
                        <p className="text-xs text-gray-400 truncate">{model.name}</p>
                      )}
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-primary shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  // ------ Year picker ------
  const renderYearPicker = () => {
    return (
      <div>
        {/* Selected brand + model badge */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Veiculo:</span>
          <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            {getDisplayName(formValues.vehicle_brand)}
          </span>
          <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full truncate max-w-[250px]">
            {formValues.vehicle_model.split(/\s+/).slice(0, 3).join(" ")}
          </span>
        </div>

        {loadingYears ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-500">Carregando anos...</span>
          </div>
        ) : fipeYears.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[350px] overflow-y-auto pr-1">
            {fipeYears.map((year) => {
              const isSelected = formValues.vehicle_year === year.name;
              return (
                <button
                  key={year.code}
                  type="button"
                  onClick={() => {
                    setValue("vehicle_year", year.name);
                    // Auto-advance
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
                  className={`py-4 px-4 rounded-xl border-2 text-center font-medium transition-all duration-200 cursor-pointer ${isSelected
                      ? "border-primary bg-primary/5 text-primary shadow-sm scale-[1.02]"
                      : "border-gray-200 text-gray-700 hover:border-primary/40 hover:bg-gray-50"
                    }`}
                >
                  {year.name}
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <p className="text-gray-500 text-sm mb-4">
              Nao encontramos anos para este modelo na tabela FIPE. Digite o ano manualmente:
            </p>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ex: 2020"
              value={formValues.vehicle_year}
              onChange={(e) => setValue("vehicle_year", e.target.value)}
              maxLength={9}
              className="w-full bg-transparent border-b-3 border-gray-300 focus:border-primary text-2xl md:text-3xl font-medium py-3 outline-none transition-colors duration-300 placeholder:text-gray-300"
              autoFocus
            />
          </div>
        )}
      </div>
    );
  };

  // ------ Render step content ------
  const renderStepContent = () => {
    switch (step.type) {
      case "brand_picker":
        return renderBrandPicker();

      case "model_picker":
        return renderModelPicker();

      case "year_picker":
        return renderYearPicker();

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
                className={`group relative py-4 px-6 rounded-2xl border-2 text-left text-lg font-medium transition-all duration-200 cursor-pointer ${formValues[step.field] === opt.value
                    ? "border-primary bg-primary/5 text-primary shadow-md scale-[1.02]"
                    : "border-gray-200 text-gray-700 hover:border-primary/40 hover:bg-gray-50"
                  }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${formValues[step.field] === opt.value
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
                <span className="text-gray-500">Veiculo</span>
                <span className="font-medium text-gray-900 truncate max-w-[200px]">
                  {getDisplayName(formValues.vehicle_brand)} {formValues.vehicle_model.split(/\s+/).slice(0, 2).join(" ")} {formValues.vehicle_year}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cidade</span>
                <span className="font-medium text-gray-900">{formValues.city} - {formValues.state}</span>
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
                e contato via WhatsApp, conforme a Lei Geral de Protecao de
                Dados (LGPD). Posso revogar esta autorizacao a qualquer momento.
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
            className={`transition-all duration-300 ${isAnimating
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
            className={`flex items-center gap-2 py-2.5 px-5 rounded-xl font-medium transition-all cursor-pointer ${currentStep === 0
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
            Pressione <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-400 font-mono text-[10px]">Enter</kbd> para continuar
          </span>
        </div>
      </div>
    </div>
  );
}
