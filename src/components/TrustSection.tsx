"use client";

import { MapPin, Shield, Users, CheckCircle2 } from "lucide-react";
import { REGIONS } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";

const trustFeatures = [
  "Dados protegidos conforme LGPD",
  "Lojistas verificados e cadastrados",
  "Controle total sobre propostas",
  "Negociação direta e transparente",
];

export default function TrustSection() {
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
      ref={sectionRef}
      className="py-20 md:py-32 bg-gradient-to-br from-dark via-navy to-navy-light text-white relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Segurança garantida
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
            Confiança e{" "}
            <span className="text-accent">transparência</span>
          </h2>
          <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Conectamos vendedores e lojistas da sua região com um processo
            seguro, verificado e totalmente transparente
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {/* Regiões */}
          <div
            className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group ${isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
            style={{ animationDelay: "0ms" }}
          >
            <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-7 h-7 text-primary-light" />
            </div>
            <h3 className="text-xl font-bold mb-4">
              Regiões atendidas
            </h3>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((region) => (
                <span
                  key={region}
                  className="px-3 py-1.5 bg-white/10 text-white/70 text-sm rounded-lg font-medium border border-white/5 hover:bg-white/20 transition-colors"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>

          {/* Segurança */}
          <div
            className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group ${isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
            style={{ animationDelay: "150ms" }}
          >
            <div className="w-14 h-14 bg-secondary/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-4">
              Processo seguro
            </h3>
            <ul className="space-y-3">
              {trustFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span className="text-white/60 text-sm leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Lojistas */}
          <div
            className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group ${isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
            style={{ animationDelay: "300ms" }}
          >
            <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-4">
              Rede de lojistas verificados
            </h3>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Trabalhamos com lojistas cadastrados e verificados da sua região,
              garantindo propostas sérias e negociações profissionais.
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-white/10">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light border-2 border-navy flex items-center justify-center text-xs font-bold text-white"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-white/50 text-xs">
                +500 lojistas ativos
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
