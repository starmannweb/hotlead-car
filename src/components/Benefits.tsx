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
      className="py-20 md:py-32 bg-white dark:bg-gray-900 relative overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-50/30 to-transparent dark:via-primary/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Image + Text */}
          <div className={`${isVisible ? "animate-fade-in-left" : "opacity-0"}`}>
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
              Vantagens exclusivas
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Por que vender{" "}
              <span className="gradient-text">seu carro</span> aqui?
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
              Simplificamos a venda do seu veículo com segurança, rapidez e
              total transparência. Sem intermediários, sem complicações.
            </p>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap gap-4">
              {["Cadastro gratuito", "Sem compromisso", "LGPD compliant"].map(
                (badge) => (
                  <div
                    key={badge}
                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg"
                  >
                    <Check className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {badge}
                    </span>
                  </div>
                )
              )}
            </div>

            {/* Image below text on lg+ */}
            <div className="mt-10 relative rounded-2xl overflow-hidden shadow-2xl hidden md:block">
              <Image
                src="/images/deal-handshake.png"
                alt="Negociação de veículo"
                width={600}
                height={380}
                className="object-cover w-full h-[300px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3">
                  <p className="text-white text-sm font-medium">
                    ⭐ Mais de 2.000 veículos conectados com lojistas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Benefit Cards */}
          <div className="grid gap-5">
            {benefits.map((item, index) => (
              <div
                key={index}
                className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-transparent hover:shadow-xl transition-all duration-300 ${isVisible ? "animate-fade-in-right" : "opacity-0"
                  }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient border on hover */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm`}
                />

                <div className="flex items-start gap-5">
                  <div
                    className={`shrink-0 w-14 h-14 ${item.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
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
