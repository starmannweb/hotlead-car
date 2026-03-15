"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Car, Download, MapPin, Search, FileText,
  FileSpreadsheet, XCircle, CheckCircle, Calendar,
  TrendingDown, Banknote, LogOut, TrendingUp, Flame,
  Snowflake, Trash2, BarChart3, Bell, X, Phone, Clock, ChevronDown, ChevronUp, Image as ImageIcon, Filter
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { buildRegionOptions } from "@/lib/regions";
import { notifyNewLeads, requestLeadNotificationPermission } from "@/lib/lead-notifications";
import { Lead } from "@prisma/client";

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
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "hot" | "warm" | "cold">("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"score" | "recent">("score");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLeads, setExpandedLeads] = useState<Set<string>>(new Set());
  const [photoModal, setPhotoModal] = useState<{ photos: string[]; index: number } | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [newLeadNotification, setNewLeadNotification] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const seenLeadIds = useRef<Set<string>>(new Set());
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLeads();
    requestLeadNotificationPermission();
    const interval = setInterval(() => {
      fetchLeads(true);
    }, 30000);
    return () => clearInterval(interval);
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

  const fetchLeads = async (isPolling = false) => {
    try {
      const response = await fetch("/api/leads");
      const data = await response.json();
      if (data.success) {
        const nextLeads = data.data as Lead[];
        setLeads(nextLeads);

        const nextIds = new Set(nextLeads.map((lead) => lead.id));
        if (isPolling && seenLeadIds.current.size > 0) {
          const arrivedCount = nextLeads.filter((lead) => !seenLeadIds.current.has(lead.id)).length;
          if (arrivedCount > 0) {
            setNewLeadsCount(arrivedCount);
            notifyNewLeads(arrivedCount);
            setNewLeadNotification(true);
            setTimeout(() => setNewLeadNotification(false), 5000);
          }
        }

        seenLeadIds.current = nextIds;
      }
    } catch (error) {
      console.error("Erro ao carregar leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar este lead? Esta ação não pode ser desfeita.")) return;
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchLeads();
      } else {
        alert("Erro ao remover lead.");
      }
    } catch (error) {
      console.error("Erro ao remover lead:", error);
    }
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

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
    router.push("/login");
  };

  const filteredLeads = leads
    .filter((lead) => (filter === "all" ? true : lead.tier === filter))
    .filter((lead) => (regionFilter === "all" ? true : String((lead as any).region || "") === regionFilter))
    .filter((lead) => (statusFilter === "all" ? true : lead.status === statusFilter))
    .filter((lead) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        lead.vehicleBrand.toLowerCase().includes(q) ||
        lead.vehicleModel.toLowerCase().includes(q) ||
        lead.city.toLowerCase().includes(q) ||
        lead.name.toLowerCase().includes(q) ||
        String((lead as any).region || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => sortBy === "score" ? b.score - a.score : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const regions = buildRegionOptions(
    Array.from(new Set(leads.map((lead) => String((lead as any).region || "").trim()).filter(Boolean)))
  );

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

  // ---- Export functions ----
  const exportCSV = () => {
    const headers = [
      "Nome", "Telefone", "Estado", "Cidade", "Marca", "Modelo", "Ano", "KM",
      "Urgência", "Desconto FIPE", "Documentação", "Financiamento",
      "Pontuação", "Qualificação", "Status", "Data",
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
      new Date(l.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    downloadFile(csv, "leads.csv", "text/csv;charset=utf-8;");
  };

  const exportExcel = () => {
    const headers = [
      "Nome", "Telefone", "Estado", "Cidade", "Marca", "Modelo", "Ano", "KM",
      "Urgência", "Desconto FIPE", "Documentação", "Financiamento",
      "Pontuação", "Qualificação", "Status", "Data",
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
      new Date(l.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
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
          <td>${new Date(l.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
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
          <th>Veículo</th><th>KM</th><th>Pontuação</th>
          <th>Qualificação</th><th>Status</th><th>Data</th>
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

              {/* Reports */}
              <button
                onClick={() => router.push("/admin/transacoes")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <Banknote className="w-4 h-4" />
                Transações
              </button>
              <button
                onClick={() => router.push("/admin/relatorios")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                Relatórios
              </button>

              <ThemeToggle />
              <button 
                onClick={handleLogout} 
                className="p-2 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" 
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Qualificação</label>
              <div className="flex gap-2">
                {(["all", "hot", "warm", "cold"] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setFilter(tier)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${filter === tier
                      ? tier === "hot" ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                        : tier === "warm" ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                          : tier === "cold" ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                            : "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
                      : tier === "hot" ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400"
                        : tier === "warm" ? "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 dark:text-amber-400"
                          : tier === "cold" ? "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                  >
                    {tier === "all" ? "Todos" : TIER_LABELS[tier]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Região</label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">Todas as Regiões</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
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
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Ordenar</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "score" | "recent")}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="score">Maior pontuação</option>
                <option value="recent">Mais recentes</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-1">
                <Search className="w-3.5 h-3.5" /> Buscar
              </label>
              <input
                type="text"
                placeholder="Nome, marca, modelo ou cidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
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
                            {TIER_LABELS[lead.tier] || lead.tier} - Pontuação {lead.score}/100
                          </span>
                          <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            {getStatusIcon(lead.status)}
                            {STATUS_LABELS[lead.status] || lead.status}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(lead.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        {/* Lead info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nome</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{lead.name}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Contato</p>
                            <div className="flex flex-col gap-1">
                              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1 text-sm">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                {lead.phone}
                              </p>
                              {((lead as any).email) && (
                                <p className="text-xs text-gray-500 truncate max-w-[150px]" title={(lead as any).email}>
                                  {(lead as any).email}
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Localidade / IP</p>
                            <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {lead.city}{leadState ? ` - ${leadState}` : ""}
                              {(lead as any).region && <span className="text-gray-500 text-xs ml-1">({(lead as any).region})</span>}
                            </p>
                            {(lead as any).ip && (
                              <p className="text-xs text-gray-400 mt-1">IP: {(lead as any).ip}</p>
                            )}
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Data</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(lead.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-4 flex flex-col gap-2 items-end">
                        <div className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium">
                          {STATUS_LABELS[lead.status] || lead.status}
                        </div>
                        <div className="flex flex-col items-end gap-3 h-full justify-between">
                          <button
                            onClick={() => toggleExpand(lead.id)}
                            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-primary cursor-pointer mb-2"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {isExpanded ? "Recolher" : "Detalhes"}
                          </button>

                          <button
                            onClick={() => deleteLead(lead.id)}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 cursor-pointer transition-colors mt-auto"
                            title="Apagar lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-700 p-5 bg-gray-50/50 dark:bg-gray-800/50">
                      {/* Vehicle + Photos */}
                      <div className="flex flex-col lg:flex-row gap-4 mb-4">
                        <div className="flex-1 bg-white dark:bg-gray-700 rounded-lg p-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Veículo</p>
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
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Urgência
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {lead.urgency === "hoje" && "Hoje"}
                            {lead.urgency === "3dias" && "3 dias"}
                            {lead.urgency === "7dias" && "7 dias"}
                            {lead.urgency === "sem_pressa" && "Sem pressa"}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5" /> Desconto FIPE
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {lead.discountAcceptance === "acima_20" && "Acima de 20%"}
                            {lead.discountAcceptance === "10_20" && "Entre 10 a 20%"}
                            {lead.discountAcceptance === "fipe" && "Tabela FIPE"}
                            {lead.discountAcceptance === "20" && "20% abaixo"}
                            {lead.discountAcceptance === "15" && "15% abaixo"}
                            {lead.discountAcceptance === "10" && "10% abaixo"}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" /> Documentação
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {lead.docsStatus === "regular" && "Regular"}
                            {lead.docsStatus === "pendencias" && "Pendências"}
                            {lead.docsStatus === "nao_sei" && "Não sei"}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Banknote className="w-3.5 h-3.5" /> Financiamento
                          </p>
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
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={photoModal.photos[photoModal.index]}
              alt="Foto do veículo em tamanho real"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            {photoModal.photos.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {photoModal.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPhotoModal({ ...photoModal, index: idx })}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer ${idx === photoModal.index ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
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

      {/* Notification Toast */}
      {newLeadNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-[fadeInUp_0.4s_ease-out] shadow-xl rounded-xl border border-green-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0 animate-pulse">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">
              {newLeadsCount > 1 ? `${newLeadsCount} novos leads capturados!` : "Oba! Novo lead capturado!"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">A lista foi atualizada com sucesso.</p>
          </div>
          <button onClick={() => setNewLeadNotification(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
