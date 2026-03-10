"use client";

import { useState } from "react";
import { ArrowRight, Star, ShieldCheck, Clock, Users } from "lucide-react";
import { formatPhone, validatePhone } from "@/lib/validators";
import { trackEvent } from "@/lib/tracking";
import Image from "next/image";

interface HeroSectionProps {
  onQuickSubmit: (data: {
    name: string;
    phone: string;
  }) => void;
}

export default function HeroSection({ onQuickSubmit }: HeroSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focused, setFocused] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
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
    if (!formData.name.trim()) newErrors.name = "Informe seu nome";
    if (!validatePhone(formData.phone)) newErrors.phone = "WhatsApp invalido";
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
      <div className="absolute inset-0 z-0 scale-105 animate-[slowZoom_20s_ease-in-out_infinite_alternate]">
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

      {/* Floating decorative elements with more complex animations */}
      <div className="absolute inset-0 overflow-hidden z-[1]">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-[pulse_6s_ease-in-out_infinite_alternate]" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-secondary/10 rounded-full blur-[80px] animate-[pulse_5s_ease-in-out_infinite]" />
      </div>

      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-20 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,109,0,0.4)] group-hover:scale-110 transition-transform duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="2" />
                <path d="M14 17h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Auto<span className="text-accent group-hover:text-white transition-colors">Oportunidade</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Como funciona
            </a>
            <a href="#beneficios" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Beneficios
            </a>
            <a href="#faq" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              FAQ
            </a>
            <a
              href="/login"
              className="text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              Area do Lojista
            </a>
            <a
              href="#como-funciona"
              className="relative overflow-hidden group bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_0_20px_rgba(255,109,0,0.6)]"
            >
              <span className="relative z-10">Vender meu carro</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1s_ease-in-out_infinite]" />
            </a>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-36">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Left - Copy */}
          <div className="text-center md:text-left animate-[fadeInUp_0.8s_ease-out]">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-white/20 transition-colors cursor-default">
              <Star className="w-4 h-4 text-accent animate-[spin_4s_linear_infinite]" fill="#ff6d00" />
              Marketplace #1 de oportunidades automotivas
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
              Venda seu carro{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light animate-pulse">rapido</span> e receba{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-blue-300">propostas reais</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/80 leading-relaxed max-w-lg mx-auto md:mx-0">
              Cadastro simplificado. Mais de 500 lojistas verificados para garantir as melhores ofertas no seu veiculo em ate <strong className="text-white">24 horas</strong>.
            </p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md mx-auto md:mx-0">
              <div className="text-center md:text-left group cursor-default">
                <div className="flex items-center gap-1.5 justify-center md:justify-start">
                  <Users className="w-4 h-4 text-accent group-hover:scale-125 transition-transform" />
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">500+</span>
                </div>
                <p className="text-xs sm:text-sm text-white/60 mt-1">Lojistas cadastrados</p>
              </div>
              <div className="text-center md:text-left group cursor-default">
                <div className="flex items-center gap-1.5 justify-center md:justify-start">
                  <Clock className="w-4 h-4 text-secondary group-hover:scale-125 -rotate-90 group-hover:rotate-0 transition-all duration-300" />
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">24h</span>
                </div>
                <p className="text-xs sm:text-sm text-white/60 mt-1">Para propostas</p>
              </div>
              <div className="text-center md:text-left group cursor-default">
                <div className="flex items-center gap-1.5 justify-center md:justify-start">
                  <ShieldCheck className="w-4 h-4 text-primary-light group-hover:scale-125 transition-transform" />
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">100%</span>
                </div>
                <p className="text-xs sm:text-sm text-white/60 mt-1">Gratuito e Seguro</p>
              </div>
            </div>
          </div>

          {/* Right - Form (Simplified and with nice effects) */}
          <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto animate-[fadeInLeft_1s_ease-out]">
            <form
              onSubmit={handleSubmit}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-7 sm:p-8 space-y-4 relative overflow-hidden group/form hover:shadow-[0_20px_60px_rgba(255,109,0,0.2)] transition-shadow duration-500"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-accent-light to-secondary" />

              <div className="text-center mb-6 pt-2">
                <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
                  Inicie seu cadastro
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Apenas 2 minutos • <span className="text-secondary font-semibold">100% gratuito</span>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 ${errors.name ? "!border-red-400 !bg-red-50" : "hover:border-gray-300"}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 animate-[shake_0.5s_ease-in-out]">{errors.name}</p>
                )}
              </div>

              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="WhatsApp (ex: 11 99999-9999)"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={16}
                  className={`w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 ${errors.phone ? "!border-red-400 !bg-red-50" : "hover:border-gray-300"}`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 animate-[shake_0.5s_ease-in-out]">{errors.phone}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full relative overflow-hidden bg-primary text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_10px_20px_rgba(10,55,160,0.3)] group-hover/btn"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Continuar agora
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-primary opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>

              <p className="text-[11px] text-gray-400 text-center leading-snug mt-4">
                Ao continuar, voce concorda com nossa{" "}
                <a href="#" className="underline hover:text-gray-600 transition-colors">
                  Politica de Privacidade
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slowZoom { from { transform: scale(1); } to { transform: scale(1.1); } }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </section>
  );
}
