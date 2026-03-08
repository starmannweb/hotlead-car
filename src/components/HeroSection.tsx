"use client";

import { useState } from "react";
import { Car, ArrowRight } from "lucide-react";
import { VEHICLE_BRANDS } from "@/lib/constants";
import { formatPhone, validatePhone } from "@/lib/validators";
import { trackEvent } from "@/lib/tracking";

interface HeroSectionProps {
  onQuickSubmit: (data: {
    vehicle_brand: string;
    vehicle_model: string;
    vehicle_year: string;
    city: string;
    phone: string;
  }) => void;
}

export default function HeroSection({ onQuickSubmit }: HeroSectionProps) {
  const [formData, setFormData] = useState({
    vehicle_brand: "",
    vehicle_model: "",
    vehicle_year: "",
    city: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focused, setFocused] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (!focused) {
      trackEvent({ event: "form_start" });
      setFocused(true);
    }

    if (name === "phone") {
      setFormData((prev) => ({ ...prev, phone: formatPhone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.vehicle_brand) newErrors.vehicle_brand = "Selecione a marca";
    if (!formData.vehicle_model.trim()) newErrors.vehicle_model = "Informe o modelo";
    if (!formData.vehicle_year.trim()) newErrors.vehicle_year = "Informe o ano";
    if (!formData.city.trim()) newErrors.city = "Informe a cidade";
    if (!validatePhone(formData.phone)) newErrors.phone = "WhatsApp inválido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onQuickSubmit(formData);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-primary via-primary-dark to-[#0f2a6e] min-h-[100dvh] md:min-h-0 md:py-20 flex items-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-0">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left - Copy */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Car className="w-4 h-4" />
              Marketplace de oportunidades automotivas
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight">
              Venda seu carro rápido e receba{" "}
              <span className="text-amber-400">propostas de lojistas</span> da
              sua região.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/80 leading-relaxed max-w-lg mx-auto md:mx-0">
              Cadastro gratuito. Se você precisa vender rápido, lojistas podem
              fazer ofertas ainda hoje.
            </p>
            <div className="mt-8 flex flex-wrap gap-6 justify-center md:justify-start text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                +500 lojistas cadastrados
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                Propostas em até 24h
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-4"
            >
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  Receba propostas agora
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Leva menos de 2 minutos • Sem compromisso
                </p>
              </div>

              <div>
                <select
                  name="vehicle_brand"
                  value={formData.vehicle_brand}
                  onChange={handleChange}
                  className={`input-field ${errors.vehicle_brand ? "!border-red-400" : ""}`}
                >
                  <option value="">Marca do veículo</option>
                  {VEHICLE_BRANDS.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
                {errors.vehicle_brand && (
                  <p className="text-red-500 text-xs mt-1">{errors.vehicle_brand}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  name="vehicle_model"
                  placeholder="Modelo (ex: Civic, Onix, HB20)"
                  value={formData.vehicle_model}
                  onChange={handleChange}
                  className={`input-field ${errors.vehicle_model ? "!border-red-400" : ""}`}
                />
                {errors.vehicle_model && (
                  <p className="text-red-500 text-xs mt-1">{errors.vehicle_model}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    name="vehicle_year"
                    placeholder="Ano"
                    maxLength={4}
                    value={formData.vehicle_year}
                    onChange={handleChange}
                    className={`input-field ${errors.vehicle_year ? "!border-red-400" : ""}`}
                  />
                  {errors.vehicle_year && (
                    <p className="text-red-500 text-xs mt-1">{errors.vehicle_year}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="city"
                    placeholder="Cidade"
                    value={formData.city}
                    onChange={handleChange}
                    className={`input-field ${errors.city ? "!border-red-400" : ""}`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>
              </div>

              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="WhatsApp (DDD + número)"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={16}
                  className={`input-field ${errors.phone ? "!border-red-400" : ""}`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                Receber propostas agora
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-[11px] text-gray-400 text-center leading-snug">
                Ao continuar, você concorda com nossa{" "}
                <a href="#" className="underline">
                  Política de Privacidade
                </a>{" "}
                e autoriza o contato via WhatsApp conforme a LGPD.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
