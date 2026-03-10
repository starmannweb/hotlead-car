"use client";

import { useState, useEffect, useRef } from "react";
import { Lead } from "@prisma/client";
import {
  Flame,
  Snowflake,
  TrendingUp,
  Phone,
  MapPin,
  Car,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  X,
} from "lucide-react";

const TIER_LABELS: Record<string, string> = {
  hot: "Quente",
  warm: "Morno",
  cold: "Frio",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Novo",
  contacted: "Contactado",
  negotiating: "Negociando",
  converted: "Convertido",
  lost: "Perdido",
};

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "hot" | "warm" | "cold">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [revealedFields, setRevealedFields] = useState<Record<string, Set<string>>>({});
  const [expandedLeads, setExpandedLeads] = useState<Set<string>>(new Set());
  const [photoModal, setPhotoModal] = useState<{ photos: string[]; index: number } | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const logView = async (leadId: string, field: string) => {
    try {
      await fetch("/api/leads/view-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, field }),
      });
    } catch (error) {
      console.error("Erro ao registrar log:", error);
    }
  };

  const toggleField = (leadId: string, field: string) => {
    setRevealedFields((prev) => {
      const next = { ...prev };
      if (!next[leadId]) next[leadId] = new Set();
      const fieldSet = new Set(next[leadId]);
      if (fieldSet.has(field)) {
        fieldSet.delete(field);
      } else {
        fieldSet.add(field);
        logView(leadId, field);
      }
      next[leadId] = fieldSet;
      return next;
    });
  };

  const isFieldRevealed = (leadId: string, field: string) => {
    return revealedFields[leadId]?.has(field) || false;
  };

  const toggleExpand = (leadId: string) => {
    setExpandedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }
      return next;
    });
  };

  const filteredLeads = leads
    .filter((lead) => (filter === "all" ? true : lead.tier === filter))
    .filter((lead) => (statusFilter === "all" ? true : lead.status === statusFilter))
    .sort((a, b) => b.score - a.score);

  const getPhotos = (lead: Lead): string[] => {
    try {
      const parsed = JSON.parse(lead.photos || "[]");
      return Array.isArray(parsed) ? parsed.filter((p: string) => p && p.startsWith("data:")) : [];
    } catch {
      return [];
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "hot":
        return <Flame className="w-5 h-5 text-red-500" />;
      case "warm":
        return <TrendingUp className="w-5 h-5 text-yellow-500" />;
      case "cold":
        return <Snowflake className="w-5 h-5 text-blue-400" />;
      default:
        return null;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "hot":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      case "warm":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      case "cold":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
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

  const maskValue = (value: string) => {
    if (!value) return "***";
    if (value.length <= 3) return "***";
    return value.substring(0, 2) + "*".repeat(Math.max(value.length - 2, 3));
  };

  const maskPhone = (phone: string) => {
    if (!phone) return "***";
    return phone.replace(/\d(?=\d{2})/g, "*");
  };

  // ---- Export functions ----
  const exportCSV = () => {
    const headers = [
      "Nome", "Telefone", "Estado", "Cidade", "Marca", "Modelo", "Ano", "KM",
      "Urgencia", "Desconto FIPE", "Documentacao", "Financiamento",
      "Score", "Qualificacao", "Status", "Data",
    ];
    const rows = filteredLeads.map((l) => [
      l.name,
      l.phone,
      (l as Record<string, unknown>).state || "",
      l.city,
      l.vehicleBrand,
      l.vehicleModel,
      l.vehicleYear,
      l.km,
      l.urgency,
      l.discountAcceptance,
      l.docsStatus,
      l.financeStatus,
      l.score,
      TIER_LABELS[l.tier] || l.tier,
      STATUS_LABELS[l.status] || l.status,
      new Date(l.createdAt).toLocaleDateString("pt-BR"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    downloadFile(csv, "leads.csv", "text/csv;charset=utf-8;");
  };

  const exportExcel = () => {
    const headers = [
      "Nome", "Telefone", "Estado", "Cidade", "Marca", "Modelo", "Ano", "KM",
      "Urgencia", "Desconto FIPE", "Documentacao", "Financiamento",
      "Score", "Qualificacao", "Status", "Data",
    ];
    const rows = filteredLeads.map((l) => [
      l.name,
      l.phone,
      (l as Record<string, unknown>).state || "",
      l.city,
      l.vehicleBrand,
      l.vehicleModel,
      l.vehicleYear,
      l.km,
      l.urgency,
      l.discountAcceptance,
      l.docsStatus,
      l.financeStatus,
      l.score,
      TIER_LABELS[l.tier] || l.tier,
      STATUS_LABELS[l.status] || l.status,
      new Date(l.createdAt).toLocaleDateString("pt-BR"),
    ]);
    let table = "<table><thead><tr>";
    headers.forEach((h) => (table += `<th>${h}</th>`));
    table += "</tr></thead><tbody>";
    rows.forEach((r) => {
      table += "<tr>";
      r.forEach((c) => (table += `<td>${c}</td>`));
      table += "</tr>";
    });
    table += "</tbody></table>";
    const blob = new Blob(
      [`<html><head><meta charset="utf-8"></head><body>${table}</body></html>`],
      { type: "application/vnd.ms-excel;charset=utf-8;" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.xls";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const rows = filteredLeads
      .map(
        (l) => `<tr>
          <td>${l.name}</td>
          <td>${l.phone}</td>
          <td>${(l as Record<string, unknown>).state || ""}</td>
          <td>${l.city}</td>
          <td>${l.vehicleBrand} ${l.vehicleModel} ${l.vehicleYear}</td>
          <td>${l.km}</td>
          <td>${l.score}</td>
          <td>${TIER_LABELS[l.tier] || l.tier}</td>
          <td>${STATUS_LABELS[l.status] || l.status}</td>
          <td>${new Date(l.createdAt).toLocaleDateString("pt-BR")}</td>
        </tr>`
      )
      .join("");
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Leads</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: bold; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <h1>Painel de Leads - ${filteredLeads.length} registro(s)</h1>
      <table>
        <thead><tr>
          <th>Nome</th><th>Telefone</th><th>UF</th><th>Cidade</th>
          <th>Veiculo</th><th>KM</th><th>Score</th>
          <th>Qualificacao</th><th>Status</th><th>Data</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Painel de Leads</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {leads.length} leads capturados
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{leads.filter((l) => l.tier === "hot").length}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Quentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">{leads.filter((l) => l.tier === "warm").length}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Mornos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{leads.filter((l) => l.tier === "cold").length}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Frios</div>
                </div>
              </div>

              {/* Export button */}
              <div className="relative" ref={exportRef}>
                <button
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
                {exportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20">
                    <button
                      onClick={() => { exportCSV(); setExportMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer rounded-t-lg"
                    >
                      <FileText className="w-4 h-4 text-green-600" />
                      Exportar CSV
                    </button>
                    <button
                      onClick={() => { exportExcel(); setExportMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                      Exportar Excel
                    </button>
                    <button
                      onClick={() => { exportPDF(); setExportMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer rounded-b-lg"
                    >
                      <FileText className="w-4 h-4 text-red-600" />
                      Exportar PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Qualificacao</label>
              <div className="flex gap-2">
                {(["all", "hot", "warm", "cold"] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setFilter(tier)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      filter === tier
                        ? tier === "hot"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                          : tier === "warm"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                          : tier === "cold"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                          : "bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white"
                        : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    {tier === "all" ? "Todos" : TIER_LABELS[tier]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">Todos</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
              {filteredLeads.length} lead(s) encontrado(s)
            </div>
          </div>
        </div>

        {/* Lista de Leads */}
        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum lead encontrado</h3>
              <p className="text-gray-500 dark:text-gray-400">Os leads aparecerao aqui quando forem capturados pelo formulario.</p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const photos = getPhotos(lead);
              const isExpanded = expandedLeads.has(lead.id);
              const leadState = (lead as Record<string, unknown>).state as string || "";

              return (
                <div
                  key={lead.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Card header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Tier badge + status */}
                        <div className="flex items-center gap-3 mb-4">
                          {getTierIcon(lead.tier)}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getTierColor(lead.tier)}`}
                          >
                            {TIER_LABELS[lead.tier] || lead.tier} - Score {lead.score}/100
                          </span>
                          <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            {getStatusIcon(lead.status)}
                            {STATUS_LABELS[lead.status] || lead.status}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>

                        {/* Lead info with eye toggle */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nome</p>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {isFieldRevealed(lead.id, "name") ? lead.name : maskValue(lead.name)}
                              </p>
                              <button
                                onClick={() => toggleField(lead.id, "name")}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                                title={isFieldRevealed(lead.id, "name") ? "Ocultar" : "Revelar"}
                              >
                                {isFieldRevealed(lead.id, "name") ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Contato</p>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                <Phone className="w-4 h-4 text-gray-400" />
                                {isFieldRevealed(lead.id, "phone") ? lead.phone : maskPhone(lead.phone)}
                              </p>
                              <button
                                onClick={() => toggleField(lead.id, "phone")}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                                title={isFieldRevealed(lead.id, "phone") ? "Ocultar" : "Revelar"}
                              >
                                {isFieldRevealed(lead.id, "phone") ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Localidade</p>
                            <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {lead.city}{leadState ? ` - ${leadState}` : ""}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Data</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-4 flex flex-col gap-2 items-end">
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => toggleExpand(lead.id)}
                          className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-primary cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {isExpanded ? "Recolher" : "Detalhes"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-700 p-5 bg-gray-50/50 dark:bg-gray-800/50">
                      {/* Vehicle + Photos */}
                      <div className="flex flex-col lg:flex-row gap-4 mb-4">
                        <div className="flex-1 bg-white dark:bg-gray-700 rounded-lg p-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Veiculo</p>
                          <p className="font-semibold text-gray-900 dark:text-white text-lg">
                            {lead.vehicleBrand} {lead.vehicleModel} {lead.vehicleYear} - {lead.km} km
                          </p>
                        </div>

                        {photos.length > 0 && (
                          <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <ImageIcon className="w-3.5 h-3.5" /> Fotos ({photos.length})
                            </p>
                            <div className="flex gap-2">
                              {photos.map((photo, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setPhotoModal({ photos, index: idx })}
                                  className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-primary transition-colors cursor-pointer"
                                >
                                  <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Qualification criteria */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Urgencia</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {lead.urgency === "hoje" && "Hoje"}
                            {lead.urgency === "3dias" && "3 dias"}
                            {lead.urgency === "7dias" && "7 dias"}
                            {lead.urgency === "sem_pressa" && "Sem pressa"}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Desconto FIPE</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {lead.discountAcceptance === "20" && "20% abaixo"}
                            {lead.discountAcceptance === "15" && "15% abaixo"}
                            {lead.discountAcceptance === "10" && "10% abaixo"}
                            {lead.discountAcceptance === "fipe" && "Tabela FIPE"}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Documentacao</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {lead.docsStatus === "regular" && "Regular"}
                            {lead.docsStatus === "pendencias" && "Pendencias"}
                            {lead.docsStatus === "nao_sei" && "Nao sei"}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Financiamento</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {lead.financeStatus === "nao" ? "Quitado" : "Com financiamento"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Photo modal */}
      {photoModal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPhotoModal(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPhotoModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={photoModal.photos[photoModal.index]}
              alt="Foto do veiculo"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            {photoModal.photos.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {photoModal.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPhotoModal({ ...photoModal, index: idx })}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer ${
                      idx === photoModal.index ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
