"use client";

import { useState } from "react";
import { ArrowRight, Star, ShieldCheck, Clock, Users } from "lucide-react";
import { formatPhone, validatePhone } from "@/lib/validators";
import { trackEvent } from "@/lib/tracking";
import Image from "next/image";

interface HeroSectionProps {
  onQuickSubmit: (data: {
    name: string;
    email: string;
    phone: string;
  }) => void;
}

export default function HeroSection({ onQuickSubmit }: HeroSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "E-mail inválido";
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
          <div className="w-full text-left z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-8 shadow-2xl animate-[fadeInDown_1s_ease-out] text-white/90 text-[13px] font-medium transition-all cursor-default hover:bg-white/15 hover:border-white/20">
              <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,109,0,0.5)]">
                <Star className="w-3 h-3 text-white" fill="currentColor" />
              </div>
              <span className="tracking-wide">Marketplace #1 de oportunidades automotivas</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-8">
              Venda seu carro <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent-light to-secondary italic">rápido</span> e receba <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-blue-400 to-blue-200">propostas</span>
            </h1>
            
            <p className="mt-8 text-lg sm:text-xl text-white/70 leading-relaxed max-w-lg animate-[fadeInUp_1s_ease-out_0.2s_both] font-medium">
              Simplificamos a sua venda direta para lojistas verificados. 
              Consiga as melhores ofertas em até <strong className="text-accent">24 horas</strong>.
            </p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md mx-auto md:mx-0">
              <div className="text-center md:text-left group cursor-default animate-[fadeInUp_1s_ease-out_0.4s_both]">
                <div className="flex items-center gap-1.5 justify-center md:justify-start">
                  <Users className="w-4 h-4 text-accent group-hover:scale-125 transition-transform" />
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">500+</span>
                </div>
                <p className="text-xs sm:text-sm text-white/60 mt-1">Lojistas cadastrados</p>
              </div>
              <div className="text-center md:text-left group cursor-default animate-[fadeInUp_1s_ease-out_0.6s_both]">
                <div className="flex items-center gap-1.5 justify-center md:justify-start">
                  <Clock className="w-4 h-4 text-secondary group-hover:scale-125 -rotate-90 group-hover:rotate-0 transition-all duration-300" />
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">24h</span>
                </div>
                <p className="text-xs sm:text-sm text-white/60 mt-1">Para propostas</p>
              </div>
              <div className="text-center md:text-left group cursor-default animate-[fadeInUp_1s_ease-out_0.8s_both]">
                <div className="flex items-center gap-1.5 justify-center md:justify-start">
                  <ShieldCheck className="w-4 h-4 text-primary-light group-hover:scale-125 transition-transform" />
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">100%</span>
                </div>
                <p className="text-xs sm:text-sm text-white/60 mt-1">Gratuito e Seguro</p>
              </div>
            </div>
          </div>

          {/* Right - Form (Simplified and with nice effects) */}
          <div className="w-full max-w-[440px] mx-auto md:mr-0 animate-[fadeInLeft_1s_ease-out]">
            <div className="relative group/card">
              {/* Outer glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-accent to-secondary rounded-[40px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              
              <form
                onSubmit={handleSubmit}
                className="relative bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-2xl p-8 sm:p-10 space-y-5 overflow-hidden border border-white/20"
              >
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-accent/10 transition-colors" />

                <div className="relative z-10 text-center mb-8">
                  <div className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-widest mb-3">
                    Acesso Gratuito
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight">
                    Inicie seu <span className="text-primary italic">cadastro</span>
                  </h2>
                  <p className="text-sm text-slate-500 mt-2 font-medium">
                    Apenas 2 minutos para receber propostas
                  </p>
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="group/input">
                    <div className={`relative flex items-center bg-slate-50 border-2 rounded-2xl transition-all duration-300 ${errors.name ? "border-red-400 bg-red-50/30" : "border-slate-100 focus-within:border-primary focus-within:bg-white group-hover/input:border-slate-200"}`}>
                      <div className="pl-4 text-slate-400 group-focus-within/input:text-primary transition-colors">
                        <Users className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        placeholder="Nome completo"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-transparent px-4 py-4 text-base focus:outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-[11px] font-bold mt-1.5 ml-2 animate-[shake_0.5s_ease-in-out]">{errors.name}</p>
                    )}
                  </div>

                  <div className="group/input">
                    <div className={`relative flex items-center bg-slate-50 border-2 rounded-2xl transition-all duration-300 ${errors.email ? "border-red-400 bg-red-50/30" : "border-slate-100 focus-within:border-primary focus-within:bg-white group-hover/input:border-slate-200"}`}>
                      <div className="pl-4 text-slate-400 group-focus-within/input:text-primary transition-colors">
                        <Star className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Seu melhor e-mail"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-transparent px-4 py-4 text-base focus:outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-[11px] font-bold mt-1.5 ml-2 animate-[shake_0.5s_ease-in-out]">{errors.email}</p>
                    )}
                  </div>

                  <div className="group/input">
                    <div className={`relative flex items-center bg-slate-50 border-2 rounded-2xl transition-all duration-300 ${errors.phone ? "border-red-400 bg-red-50/30" : "border-slate-100 focus-within:border-primary focus-within:bg-white group-hover/input:border-slate-200"}`}>
                      <div className="pl-4 text-slate-400 group-focus-within/input:text-primary transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="WhatsApp / Telefone"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={16}
                        className="w-full bg-transparent px-4 py-4 text-base focus:outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-[11px] font-bold mt-1.5 ml-2 animate-[shake_0.5s_ease-in-out]">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 relative z-10">
                  <button
                    type="submit"
                    className="w-full group/btn relative bg-primary text-white font-bold text-lg py-5 rounded-[20px] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_-10px_rgba(10,55,160,0.5)] active:scale-95 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-primary group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      RECEBER PROPOSTAS
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </span>
                  </button>
                </div>

                <div className="relative z-10 pt-4 text-center">
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Seus dados estão protegidos. Ao clicar você concorda com os <br />
                    <a href="#" className="text-primary hover:underline underline-offset-2">Termos de Uso</a> e <a href="#" className="text-primary hover:underline underline-offset-2">Privacidade</a>.
                  </p>
                </div>
              </form>
            </div>
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
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </section>
  );
}
