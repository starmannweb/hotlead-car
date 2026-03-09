"use client";

import { useState, useEffect } from "react";
import { Lead } from "@prisma/client";
import { Star, Flame, Snowflake, TrendingUp, Phone, MapPin, Car, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "hot" | "warm" | "cold">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "contacted" | "negotiating" | "converted" | "lost">("all");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch("/api/leads");
      const data = await response.json();
      if (data.success) {
        setLeads(data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        fetchLeads();
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const filteredLeads = leads
    .filter((lead) => (filter === "all" ? true : lead.tier === filter))
    .filter((lead) => (statusFilter === "all" ? true : lead.status === statusFilter))
    .sort((a, b) => b.score - a.score);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "hot":
        return <Flame className="w-5 h-5 text-red-500" />;
      case "warm":
        return <TrendingUp className="w-5 h-5 text-yellow-500" />;
      case "cold":
        return <Snowflake className="w-5 h-5 text-blue-400" />;
      default:
        return <Star className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "hot":
        return "bg-red-50 text-red-700 border-red-200";
      case "warm":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "cold":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <Clock className="w-4 h-4" />;
      case "contacted":
        return <Phone className="w-4 h-4" />;
      case "converted":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "lost":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel de Leads</h1>
              <p className="text-sm text-gray-500 mt-1">
                {leads.length} leads capturados • Sistema de Qualificação AutoLead
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{leads.filter((l) => l.tier === "hot").length}</div>
                <div className="text-xs text-gray-500">Leads HOT</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">{leads.filter((l) => l.tier === "warm").length}</div>
                <div className="text-xs text-gray-500">Leads WARM</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{leads.filter((l) => l.tier === "cold").length}</div>
                <div className="text-xs text-gray-500">Leads COLD</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Qualificação</label>
              <div className="flex gap-2">
                {["all", "hot", "warm", "cold"].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setFilter(tier as typeof filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === tier
                        ? tier === "hot"
                          ? "bg-red-100 text-red-700"
                          : tier === "warm"
                          ? "bg-yellow-100 text-yellow-700"
                          : tier === "cold"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-900"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tier === "all" ? "Todos" : tier.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">Todos</option>
                <option value="new">Novo</option>
                <option value="contacted">Contactado</option>
                <option value="negotiating">Negociando</option>
                <option value="converted">Convertido</option>
                <option value="lost">Perdido</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Leads */}
        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</h3>
              <p className="text-gray-500">Os leads aparecerão aqui quando forem capturados pelo formulário.</p>
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header do Lead */}
                    <div className="flex items-center gap-3 mb-3">
                      {getTierIcon(lead.tier)}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getTierColor(
                          lead.tier
                        )}`}
                      >
                        {lead.tier} • Score {lead.score}/100
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        {getStatusIcon(lead.status)}
                        {lead.status}
                      </span>
                    </div>

                    {/* Informações do Lead */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Nome</p>
                        <p className="font-semibold text-gray-900">{lead.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Contato</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {lead.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Cidade</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {lead.city}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Data</p>
                        <p className="font-medium text-gray-900">
                          {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    {/* Veículo */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Veículo</p>
                      <p className="font-semibold text-gray-900">
                        {lead.vehicleBrand} {lead.vehicleModel} {lead.vehicleYear} • {lead.km} km
                      </p>
                    </div>

                    {/* Critérios de Qualificação */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Urgência</p>
                        <p className="font-medium">
                          {lead.urgency === "hoje" && "🔥 Hoje"}
                          {lead.urgency === "3dias" && "⚡ 3 dias"}
                          {lead.urgency === "7dias" && "📅 7 dias"}
                          {lead.urgency === "sem_pressa" && "😌 Sem pressa"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Desconto FIPE</p>
                        <p className="font-medium">
                          {lead.discountAcceptance === "20" && "💰 20% abaixo"}
                          {lead.discountAcceptance === "15" && "💰 15% abaixo"}
                          {lead.discountAcceptance === "10" && "💰 10% abaixo"}
                          {lead.discountAcceptance === "fipe" && "📊 Tabela FIPE"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Documentação</p>
                        <p className="font-medium">
                          {lead.docsStatus === "regular" && "✅ Regular"}
                          {lead.docsStatus === "pendencias" && "⚠️ Pendências"}
                          {lead.docsStatus === "nao_sei" && "❓ Não sei"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Financiamento</p>
                        <p className="font-medium">
                          {lead.financeStatus === "nao" ? "✅ Quitado" : "🏦 Com financiamento"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="ml-4 flex flex-col gap-2">
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="new">Novo</option>
                      <option value="contacted">Contactado</option>
                      <option value="negotiating">Negociando</option>
                      <option value="converted">Convertido</option>
                      <option value="lost">Perdido</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
