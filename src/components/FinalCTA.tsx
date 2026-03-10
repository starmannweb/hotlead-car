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
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/10">
          <Sparkles className="w-4 h-4" />
          Comece agora — é gratuito
        </div>

        <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
          Precisa vender seu carro{" "}
          <span className="underline decoration-white/30 decoration-4 underline-offset-8">
            rápido?
          </span>
        </h2>
        <p className="mt-6 text-xl sm:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
          Receba propostas de lojistas verificados. Sem compromisso, sem
          burocracia.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onCtaClick}
            className="inline-flex items-center gap-2 bg-white text-accent font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98] shadow-2xl cursor-pointer animate-pulse-glow"
          >
            Cadastrar meu carro
            <ArrowRight className="w-5 h-5" />
          </button>
          <a
            href="#como-funciona"
            className="text-white/70 hover:text-white font-medium text-base transition-colors underline underline-offset-4"
          >
            Veja como funciona
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
