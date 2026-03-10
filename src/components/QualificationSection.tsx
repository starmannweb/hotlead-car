"use client";

import { Clock, TrendingDown, FileText, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const questions = [
  {
    icon: Clock,
    question: "Quando você precisa vender?",
    hint: "Quanto mais urgente, mais rápido conectamos com lojistas",
    tag: "Urgência",
    color: "bg-red-50 dark:bg-red-900/20 text-red-500",
  },
  {
    icon: TrendingDown,
    question: "Você aceita propostas abaixo da FIPE?",
    hint: "Lojistas compram para revender — propostas abaixo da tabela são comuns",
    tag: "Negociação",
    color: "bg-blue-50 dark:bg-blue-900/20 text-blue-500",
  },
  {
    icon: FileText,
    question: "Seu carro está com documentação regular?",
    hint: "Documentação em dia facilita propostas melhores e mais rápidas",
    tag: "Documentação",
    color: "bg-green-50 dark:bg-green-900/20 text-green-500",
  },
];

interface QualificationSectionProps {
  onStartForm: () => void;
}

export default function QualificationSection({
  onStartForm,
}: QualificationSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/3 rounded-full blur-[150px]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-3">
            Qualificação rápida
          </span>
          <h2 className="section-title">
            Para te enviar propostas reais,{" "}
            <span className="gradient-text">precisamos entender:</span>
          </h2>
          <p className="section-subtitle">
            Essas perguntas ajudam a encontrar os melhores lojistas para o seu
            caso
          </p>
        </div>

        <div className="mt-14 space-y-5">
          {questions.map((item, index) => (
            <div
              key={index}
              className={`flex items-start gap-5 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group ${isVisible ? "animate-fade-in-up" : "opacity-0"
                }`}
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div
                className={`shrink-0 w-14 h-14 ${item.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                <item.icon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {item.question}
                  </h3>
                  <span className="hidden sm:inline-block text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full">
                    {item.tag}
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {item.hint}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onStartForm}
            className="btn-primary inline-flex items-center gap-2"
          >
            Responder e receber propostas
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="mt-3 text-sm text-gray-400">
            Leva menos de 2 minutos • Sem compromisso
          </p>
        </div>
      </div>
    </section>
  );
}
