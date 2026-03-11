"use client";

import { useState } from "react";
import { ArrowRight, Star, ShieldCheck, Clock, Users, Car } from "lucide-react";
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
    <section className="relative min-h-[100dvh] md:min-h-[85vh] flex items-center bg-slate-900 overflow-hidden">
      {/* Background with reduced intensity */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/hero-bg.png"
          alt="Background"
          fill
          className="object-cover opacity-30 mix-blend-overlay"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/50" />
      </div>

      {/* Navbar - Cleaner look */}
      <nav className="absolute top-0 left-0 right-0 z-20 py-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <Car className="text-white w-6 h-6" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Auto<span className="text-accent">Oportunidade</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Como funciona</a>
            <a href="#beneficios" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Benefícios</a>
            <a href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Área do Lojista</a>
            <a href="#como-funciona" className="bg-accent hover:bg-accent-light text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors">
              Vender meu carro
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 md:py-36">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Text */}
          <div className="w-full text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 mb-6 text-slate-300 text-xs font-semibold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 text-accent" fill="currentColor" />
              <span>Conexão direta com lojistas</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-white leading-[1.15] tracking-tight mb-6">
              Venda seu carro mais rápido, por um valor <span className="text-primary-light">justo</span>.
            </h1>
            
            <p className="text-lg text-slate-400 leading-relaxed mb-10 text-pretty">
              Não perca tempo em agências ou sites de classificados. Receba ofertas reais de centenas de lojistas verificados em até <strong className="text-white font-semibold">24 horas</strong>.
            </p>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="w-5 h-5 text-accent" />
                  <div className="text-2xl font-bold text-white">500+</div>
                </div>
                <div className="text-sm font-medium text-slate-500">Lojistas Ativos</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-5 h-5 text-secondary" />
                  <div className="text-2xl font-bold text-white">24h</div>
                </div>
                <div className="text-sm font-medium text-slate-500">Propostas Rápidas</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-5 h-5 text-primary-light" />
                  <div className="text-2xl font-bold text-white">100%</div>
                </div>
                <div className="text-sm font-medium text-slate-500">Seguro e Grátis</div>
              </div>
            </div>
          </div>

          {/* Right Form - Clean Interface */}
          <div className="w-full max-w-[420px] mx-auto md:ml-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Avalie seu veículo</h2>
                <p className="text-sm font-medium text-slate-500">Leve 2 minutos para se cadastrar</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 ml-1">Nome Completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${errors.name ? "border-red-400" : "border-slate-200"}`}
                    placeholder="Ex: João da Silva"
                  />
                  {errors.name && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 ml-1">Seu E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${errors.email ? "border-red-400" : "border-slate-200"}`}
                    placeholder="joao@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 ml-1">Telefone (WhatsApp)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={16}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${errors.phone ? "border-red-400" : "border-slate-200"}`}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.phone && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-primary/20"
                >
                  Continuar
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <p className="mt-5 text-center text-xs text-slate-500 font-medium">
                Seus dados estão 100% seguros conosco.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
