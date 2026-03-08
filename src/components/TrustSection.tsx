"use client";

import { MapPin, Shield, Users } from "lucide-react";
import { REGIONS } from "@/lib/constants";

export default function TrustSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">Confiança e transparência</h2>
        <p className="section-subtitle">
          Conectamos vendedores e lojistas da sua região com processo seguro
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {/* Regiões */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Regiões atendidas
            </h3>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((region) => (
                <span
                  key={region}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg font-medium"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-5">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Processo seguro e transparente
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Seus dados são protegidos conforme a LGPD. Apenas lojistas
              verificados têm acesso às oportunidades. Você tem total controle
              sobre as propostas recebidas.
            </p>
          </div>

          {/* Lojistas */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-5">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Rede de lojistas verificados
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Trabalhamos com lojistas cadastrados e verificados da sua região,
              garantindo propostas sérias e negociações profissionais.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
