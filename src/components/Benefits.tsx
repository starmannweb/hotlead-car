"use client";

import { Zap, Users, ShieldOff, ThumbsUp, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const benefits = [
  {
    icon: Zap,
    title: "Venda rápida",
    description:
      "Sem esperar semanas. Lojistas buscam carros ativamente e fazem ofertas em até 24 horas.",
    highlight: "24 horas",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    iconColor: "text-amber-500",
  },
  {
    icon: Users,
    title: "Propostas de lojistas verificados",
    description:
      "Conectamos você com lojistas verificados da sua região, prontos para negociar.",
    highlight: "lojistas verificados",
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-500",
  },
  {
    icon: ShieldOff,
    title: "Sem perder tempo com curiosos",
    description:
      "Nada de visitas desnecessárias. Apenas lojistas sérios interessados no seu veículo.",
    highlight: "lojistas sérios",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-500",
  },
  {
    icon: ThumbsUp,
    title: "Você decide se aceita ou não",
    description:
      "Sem compromisso. Receba as propostas, compare e decida no seu tempo.",
    highlight: "Sem compromisso",
    gradient: "from-purple-500 to-violet-600",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    iconColor: "text-purple-500",
  },
];

export default function Benefits() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="beneficios"
      ref={sectionRef}
      className="py-24 md:py-40 bg-white dark:bg-black relative overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-100 -mt-100 dark:bg-primary/10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -ml-100 -mb-100 dark:bg-secondary/10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-20 lg:gap-32 items-center">
          {/* Left - Image + Text */}
          <div className={`${isVisible ? "animate-fade-in-left" : "opacity-0"}`}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent font-bold text-[11px] uppercase tracking-[0.2em] mb-6">
              Vantagens exclusivas
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] mb-8">
              Por que vender <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">seu carro</span> aqui?
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-12">
              Simplificamos a sua jornada com tecnologia, segurança e a maior rede de lojistas verificados do Brasil.
            </p>

            {/* Trust badges */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              {["100% Gratuito", "Sem Compromisso", "LGPD Seguro"].map(
                (badge) => (
                  <div
                    key={badge}
                    className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 px-6 py-4 rounded-2xl border border-slate-100 dark:border-white/5"
                  >
                    <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-secondary" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {badge}
                    </span>
                  </div>
                )
              )}
            </div>

            {/* Image below text on lg+ */}
            <div className="relative group rounded-[40px] overflow-hidden shadow-2xl hidden lg:block border-8 border-white dark:border-white/5">
              <Image
                src="/images/deal-handshake.png"
                alt="Negociação de veículo"
                width={700}
                height={450}
                className="object-cover w-full h-[360px] group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4">
                  <p className="text-white text-base font-bold flex items-center gap-3">
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    +2.500 veículos vendidos este mês
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Benefit Cards */}
          <div className="grid gap-6 sm:gap-8">
            {benefits.map((item, index) => (
              <div
                key={index}
                className={`group relative bg-white dark:bg-white/5 rounded-[32px] p-8 sm:p-10 border border-slate-100 dark:border-white/10 hover:border-transparent hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:hover:bg-white/[0.08] transition-all duration-500 ${isVisible ? "animate-fade-in-right" : "opacity-0"
                  }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 text-center sm:text-left">
                  <div
                    className={`shrink-0 w-20 h-20 bg-gradient-to-br ${item.gradient} rounded-[24px] flex items-center justify-center shadow-xl group-hover:rotate-6 group-hover:scale-110 transition-all duration-500`}
                  >
                    <item.icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
