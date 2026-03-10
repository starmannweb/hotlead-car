"use client";

import { useState } from "react";
import { ArrowRight, Star, ShieldCheck, Clock, Users } from "lucide-react";
import { VEHICLE_BRANDS } from "@/lib/constants";
import { formatPhone, validatePhone } from "@/lib/validators";
import { trackEvent } from "@/lib/tracking";
import Image from "next/image";

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
    if (!formData.vehicle_model.trim())
      newErrors.vehicle_model = "Informe o modelo";
    if (!formData.vehicle_year.trim())
      newErrors.vehicle_year = "Informe o ano";
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
    <section className="relative min-h-[100dvh] md:min-h-0 md:py-0 flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.png"
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/85 to-dark/60" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden z-[1]">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-secondary/8 rounded-full blur-[80px]" />
      </div>

      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-20 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="2" />
                <path d="M14 17h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Auto<span className="text-accent">Oportunidade</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Como funciona
            </a>
            <a href="#beneficios" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Benefícios
            </a>
            <a href="#faq" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              FAQ
            </a>
            <a
              href="#como-funciona"
              className="bg-accent hover:bg-accent-light text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02]"
            >
              Vender meu carro
            </a>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-36">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Left - Copy */}
          <div className="text-center md:text-left animate-fade-in-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/10">
              <Star className="w-4 h-4 text-accent" fill="#ff6d00" />
              Marketplace #1 de oportunidades automotivas
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
              Venda seu carro{" "}
              <span className="gradient-text">rápido</span> e receba{" "}
              <span className="text-accent">propostas reais</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/70 leading-relaxed max-w-lg mx-auto md:mx-0">
              Cadastro gratuito. Lojistas verificados fazem ofertas pelo seu
              veículo em até <strong className="text-white">24 horas</strong>.
            </p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md mx-auto md:mx-0">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-1.5 justify-center md:justify-start">
                  <Users className="w-4 h-4 text-accent" />
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">500+</span>
                </div>
                <p className="text-xs sm:text-sm text-white/50 mt-1">Lojistas cadastrados</p>
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center gap-1.5 justify-center md:justify-start">
                  <Clock className="w-4 h-4 text-secondary" />
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">24h</span>
                </div>
                <p className="text-xs sm:text-sm text-white/50 mt-1">Para propostas</p>
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center gap-1.5 justify-center md:justify-start">
                  <ShieldCheck className="w-4 h-4 text-primary-light" />
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">100%</span>
                </div>
                <p className="text-xs sm:text-sm text-white/50 mt-1">Gratuito</p>
              </div>
            </div>

            {/* Car image - mobile hidden, visible on larger screens below text */}
            <div className="hidden lg:block mt-10 relative">
              <Image
                src="/images/hero-car.png"
                alt="Carro em destaque"
                width={520}
                height={300}
                className="rounded-2xl object-cover animate-float"
                priority
              />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3 flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">Lojistas online buscando veículos agora</span>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto animate-fade-in-right delay-200">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl shadow-2xl shadow-black/20 p-7 sm:p-8 space-y-4 relative overflow-hidden"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-accent-light to-secondary" />

              <div className="text-center mb-4 pt-2">
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Receba propostas agora
                </h2>
                <p className="text-sm text-gray-500 mt-1.5">
                  Preencha em 2 minutos • <span className="text-secondary font-semibold">100% gratuito</span>
                </p>
              </div>

              <div>
                <select
                  name="vehicle_brand"
                  value={formData.vehicle_brand}
                  onChange={handleChange}
                  className={`input-field ${errors.vehicle_brand ? "!border-red-400 !ring-red-100" : ""}`}
                >
                  <option value="">🚗 Marca do veículo</option>
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
                  placeholder="📋 Modelo (ex: Civic, Onix, HB20)"
                  value={formData.vehicle_model}
                  onChange={handleChange}
                  className={`input-field ${errors.vehicle_model ? "!border-red-400 !ring-red-100" : ""}`}
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
                    placeholder="📅 Ano"
                    maxLength={4}
                    value={formData.vehicle_year}
                    onChange={handleChange}
                    className={`input-field ${errors.vehicle_year ? "!border-red-400 !ring-red-100" : ""}`}
                  />
                  {errors.vehicle_year && (
                    <p className="text-red-500 text-xs mt-1">{errors.vehicle_year}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="city"
                    placeholder="📍 Cidade"
                    value={formData.city}
                    onChange={handleChange}
                    className={`input-field ${errors.city ? "!border-red-400 !ring-red-100" : ""}`}
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
                  placeholder="📱 WhatsApp (DDD + número)"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={16}
                  className={`input-field ${errors.phone ? "!border-red-400 !ring-red-100" : ""}`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 animate-pulse-glow"
              >
                Receber propostas agora
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-[11px] text-gray-400 text-center leading-snug">
                Ao continuar, você concorda com nossa{" "}
                <a href="#" className="underline hover:text-gray-600 transition-colors">
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
