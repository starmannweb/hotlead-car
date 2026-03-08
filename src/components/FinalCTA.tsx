"use client";

import { ArrowRight } from "lucide-react";

interface FinalCTAProps {
  onCtaClick: () => void;
}

export default function FinalCTA({ onCtaClick }: FinalCTAProps) {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary-dark to-[#0f2a6e] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
          Precisa vender seu carro rápido?
        </h2>
        <p className="mt-6 text-lg sm:text-xl text-white/80">
          Receba propostas de lojistas agora.
        </p>
        <button
          onClick={onCtaClick}
          className="mt-8 inline-flex items-center gap-2 bg-white text-primary font-bold py-4 px-10 rounded-xl text-lg transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] shadow-xl cursor-pointer"
        >
          Cadastrar meu carro
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="mt-4 text-white/50 text-sm">
          Gratuito • Sem compromisso • Propostas em até 24h
        </p>
      </div>
    </section>
  );
}
