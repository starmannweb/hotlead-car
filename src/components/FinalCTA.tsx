"use client";

import { ArrowRight, Sparkles } from "lucide-react";

interface FinalCTAProps {
  onCtaClick: () => void;
}

export default function FinalCTA({ onCtaClick }: FinalCTAProps) {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-[#e55d00] to-[#cc4e00]" />

      {/* Decorative patterns */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        {/* Diagonal lines */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.5) 35px, rgba(255,255,255,0.5) 36px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-8 border border-white/20">
          <Sparkles className="w-3.5 h-3.5 text-white/80" />
          Oportunidade única — 100% Grátis
        </div>

        <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] tracking-tight mb-6 max-w-3xl">
          Não perca tempo. Venda por um <span className="text-white/80">preço justo</span>.
        </h2>
        
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-10 text-pretty">
          Junte-se a milhares de proprietários que já negociaram seus carros com lojistas verificados de forma segura e em tempo recorde.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            onClick={onCtaClick}
            className="group inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-bold py-4 px-8 rounded-xl text-lg transition-all hover:bg-slate-50 hover:shadow-xl active:scale-[0.98] w-full sm:w-auto cursor-pointer"
          >
            Quero receber propostas
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="#como-funciona"
            className="group inline-flex items-center justify-center px-6 py-4 text-white font-medium hover:bg-white/10 rounded-xl transition-colors w-full sm:w-auto"
          >
            Ver como funciona
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-white/50 text-sm">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
            Gratuito
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
            Sem compromisso
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
            Propostas em até 24h
          </span>
        </div>
      </div>
    </section>
  );
}
