"use client";

import { Zap, Users, ShieldOff, ThumbsUp } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Venda rápida",
    description:
      "Sem esperar semanas. Lojistas buscam carros ativamente e fazem ofertas em até 24 horas.",
  },
  {
    icon: Users,
    title: "Receba propostas de lojistas",
    description:
      "Conectamos você com lojistas verificados da sua região, prontos para negociar.",
  },
  {
    icon: ShieldOff,
    title: "Sem perder tempo com curiosos",
    description:
      "Nada de visitas desnecessárias. Apenas lojistas sérios interessados no seu veículo.",
  },
  {
    icon: ThumbsUp,
    title: "Você decide se aceita ou não",
    description:
      "Sem compromisso. Receba as propostas, compare e decida no seu tempo.",
  },
];

export default function Benefits() {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">Por que vender seu carro aqui?</h2>
        <p className="section-subtitle">
          Simplificamos a venda do seu veículo com segurança e rapidez
        </p>

        <div className="mt-12 md:mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {benefits.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100 dark:hover:border-gray-600"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
