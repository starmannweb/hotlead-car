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

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-black/10 backdrop-blur-md text-white px-5 py-2 rounded-full text-[13px] font-bold uppercase tracking-wider mb-10 border border-white/10 shadow-xl">
          <Sparkles className="w-4 h-4 text-white" />
          Oportunidade única — 100% Grátis
        </div>

        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight">
          Não perca tempo. <br />
          Venda por um <span className="italic opacity-90">preço justo</span>.
        </h2>
        
        <p className="mt-8 text-xl sm:text-2xl text-white/80 max-w-2xl mx-auto leading-snug font-medium">
          Junte-se a milhares de proprietários que negociaram seus carros com lojistas verificados em tempo recorde.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          <button
            onClick={onCtaClick}
            className="group relative inline-flex items-center gap-3 bg-white text-slate-900 font-black py-5 px-12 rounded-[22px] text-xl transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_30px_60px_-15px_rgba(255,255,255,0.3)] active:scale-95 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white via-slate-50 to-white group-hover:bg-slate-50 transition-colors" />
            <span className="relative z-10 flex items-center gap-2">
              QUERO RECEBER PROPOSTAS
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-300" />
            </span>
          </button>
          <a
            href="#como-funciona"
            className="text-white/80 hover:text-white font-bold text-lg transition-colors border-b-2 border-white/20 hover:border-white"
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
