"use client";

import { ClipboardList, ShieldCheck, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "1",
    title: "Cadastre seu veículo",
    description: "Preencha o formulário em menos de 2 minutos com os dados do seu carro.",
  },
  {
    icon: ShieldCheck,
    step: "2",
    title: "Validamos a oportunidade",
    description: "Nossa equipe analisa e organiza as informações para os lojistas.",
  },
  {
    icon: MessageSquare,
    step: "3",
    title: "Receba propostas",
    description: "Lojistas da sua região enviam propostas diretamente para você.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">Como funciona</h2>
        <p className="section-subtitle">
          Um processo simples e rápido para conectar você com lojistas
        </p>

        <div className="mt-12 md:mt-16 grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((item, index) => (
            <div key={index} className="relative text-center group">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gray-200" />
              )}

              <div className="relative inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300 mb-6">
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                <item.icon className="w-10 h-10 text-primary" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
