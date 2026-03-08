"use client";

import { Clock, TrendingDown, FileText } from "lucide-react";

const questions = [
  {
    icon: Clock,
    question: "Quando você precisa vender?",
    hint: "Quanto mais urgente, mais rápido conectamos com lojistas",
  },
  {
    icon: TrendingDown,
    question: "Você aceita propostas abaixo da FIPE?",
    hint: "Lojistas compram para revender — propostas abaixo da tabela são comuns",
  },
  {
    icon: FileText,
    question: "Seu carro está com documentação regular?",
    hint: "Documentação em dia facilita propostas melhores",
  },
];

interface QualificationSectionProps {
  onStartForm: () => void;
}

export default function QualificationSection({ onStartForm }: QualificationSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">
          Para te enviar propostas reais, precisamos entender:
        </h2>
        <p className="section-subtitle">
          Essas perguntas ajudam a encontrar os melhores lojistas para o seu caso
        </p>

        <div className="mt-12 space-y-6">
          {questions.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-5 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {item.question}
                </h3>
                <p className="text-gray-500 text-sm mt-1">{item.hint}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button onClick={onStartForm} className="btn-primary">
            Responder e receber propostas
          </button>
        </div>
      </div>
    </section>
  );
}
