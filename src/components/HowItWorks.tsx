"use client";

import { ClipboardList, ShieldCheck, MessageSquare, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Cadastre seu veículo",
    description:
      "Preencha o formulário em menos de 2 minutos com os dados do seu carro. Rápido e sem burocracia.",
    color: "bg-primary/10 text-primary",
    accent: "border-primary/20",
  },
  {
    icon: ShieldCheck,
    step: "02",
    title: "Validamos a oportunidade",
    description:
      "Nossa equipe analisa e organiza as informações para garantir que os melhores lojistas recebam sua oferta.",
    color: "bg-secondary/10 text-secondary",
    accent: "border-secondary/20",
  },
  {
    icon: MessageSquare,
    step: "03",
    title: "Receba propostas",
    description:
      "Lojistas verificados da sua região enviam propostas diretamente para você via WhatsApp.",
    color: "bg-accent/10 text-accent",
    accent: "border-accent/20",
  },
];

export default function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="como-funciona"
      ref={sectionRef}
      className="py-20 md:py-32 bg-gray-50 dark:bg-gray-800 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/3 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Processo simples
          </span>
          <h2 className="section-title">
            Como <span className="gradient-text">funciona</span>
          </h2>
          <p className="section-subtitle">
            Um processo simples, rápido e transparente para conectar você com
            lojistas verificados da sua região
          </p>
        </div>

        <div className="mt-16 md:mt-20 grid md:grid-cols-3 gap-8 lg:gap-10">
          {steps.map((item, index) => (
            <div
              key={index}
              className={`relative text-center group ${isVisible ? "animate-fade-in-up" : "opacity-0"
                }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-14 left-[60%] w-[80%] items-center">
                  <div className="w-full h-[2px] bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
                  <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 -ml-1 shrink-0" />
                </div>
              )}

              <div
                className={`relative inline-flex items-center justify-center w-28 h-28 rounded-3xl border-2 ${item.accent} bg-white dark:bg-gray-700 shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 mb-8`}
              >
                <div className="absolute -top-3 -right-3 w-9 h-9 bg-gradient-to-br from-accent to-accent-light text-white rounded-xl flex items-center justify-center text-xs font-bold shadow-lg shadow-accent/30">
                  {item.step}
                </div>
                <item.icon className={`w-12 h-12 ${item.color}`} />
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {item.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto text-[15px]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
