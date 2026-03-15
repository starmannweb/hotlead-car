"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Eye, EyeOff, Car, Phone, MapPin, LogOut,
    ChevronDown, ChevronUp, Download, FileText,
    FileSpreadsheet, Flame, Snowflake, TrendingUp, Clock,
    Image as ImageIcon, X, CheckCircle, XCircle, Calendar,
    Search, Filter, TrendingDown, Banknote, Bell
} from "lucide-react";
import { buildRegionOptions } from "@/lib/regions";
import { notifyNewLeads, requestLeadNotificationPermission } from "@/lib/lead-notifications";

interface Lead {
    id: string; name: string; phone: string; state: string; city: string;
    region?: string;
    vehicleBrand: string; vehicleModel: string; vehicleYear: string;
    km: string; urgency: string; discountAcceptance: string; docsStatus: string;
    financeStatus: string; score: number; tier: string; status: string;
    photos: string; createdAt: string;
}

interface AuthUser { id: string; name: string; email: string; role: string; credits: number; }

const TIER_LABELS: Record<string, string> = { hot: "Quente", warm: "Morno", cold: "Frio" };
const STATUS_LABELS: Record<string, string> = { new: "Novo", contacted: "Contactado", negotiating: "Negociando", converted: "Convertido", lost: "Perdido" };

export default function PainelPage() {
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "hot" | "warm" | "cold">("all");
    const [regionFilter, setRegionFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState<"recent" | "score">("score");
    const [searchQuery, setSearchQuery] = useState("");
    const [revealedFields, setRevealedFields] = useState<Record<string, Set<string>>>({});
    const [expandedLeads, setExpandedLeads] = useState<Set<string>>(new Set());
    const [photoModal, setPhotoModal] = useState<{ photos: string[]; index: number } | null>(null);
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const [newLeadNotification, setNewLeadNotification] = useState(false);
    const [newLeadsCount, setNewLeadsCount] = useState(0);
    const seenLeadIds = useRef<Set<string>>(new Set());
    const exportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        checkAuth();
        requestLeadNotificationPermission();
        const interval = setInterval(() => {
            fetchLeads(true);
        }, 30000);
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        const h = (e: MouseEvent) => { if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportMenuOpen(false); };
        document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            if (!data.success || (data.user.role !== "seller" && data.user.role !== "admin")) { router.push("/login"); return; }
            setUser(data.user);
            fetchLeads();
        } catch { router.push("/login"); }
    };

    const fetchLeads = async (isPolling = false) => {
        try {
            const res = await fetch("/api/leads");
            const data = await res.json();
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
        } catch { /* erro silencioso */ } finally { setLoading(false); }
    };

    const handleLogout = async () => {
        await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
        router.push("/login");
    };

    const logView = async (leadId: string, field: string) => {
        try {
            await fetch("/api/credits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "unlock", leadId, field }),
            });
        } catch { /* silent */ }
    };

    const toggleField = (leadId: string, field: string) => {
        setRevealedFields((prev) => {
            const next = { ...prev };
            if (!next[leadId]) next[leadId] = new Set();
            const fieldSet = new Set(next[leadId]);
            if (fieldSet.has(field)) { fieldSet.delete(field); }
            else { fieldSet.add(field); logView(leadId, field); }
            next[leadId] = fieldSet;
            return next;
        });
    };

    const isFieldRevealed = (leadId: string, field: string) => revealedFields[leadId]?.has(field) || false;

    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
            if (res.ok) fetchLeads();
        } catch (err) { console.error("Erro:", err); }
    };

    const maskValue = (v: string) => !v || v.length <= 3 ? "***" : v.substring(0, 2) + "*".repeat(Math.max(v.length - 2, 3));
    const maskPhone = (p: string) => !p ? "***" : p.replace(/\d(?=\d{2})/g, "*");
    const getPhotos = (lead: Lead): string[] => { try { const p = JSON.parse(lead.photos || "[]"); return Array.isArray(p) ? p.filter((x: string) => x && x.startsWith("data:")) : []; } catch { return []; } };
    const getTierIcon = (t: string) => { switch (t) { case "hot": return <Flame className="w-5 h-5 text-red-500" />; case "warm": return <TrendingUp className="w-5 h-5 text-yellow-500" />; case "cold": return <Snowflake className="w-5 h-5 text-blue-400" />; default: return null; } };
    const getTierColor = (t: string) => { switch (t) { case "hot": return "bg-red-50 text-red-700 border-red-200"; case "warm": return "bg-yellow-50 text-yellow-700 border-yellow-200"; case "cold": return "bg-blue-50 text-blue-700 border-blue-200"; default: return "bg-gray-50 text-gray-700 border-gray-200"; } };
    const getStatusIcon = (s: string) => { switch (s) { case "new": return <Clock className="w-4 h-4" />; case "contacted": return <Phone className="w-4 h-4" />; case "converted": return <CheckCircle className="w-4 h-4 text-green-600" />; case "lost": return <XCircle className="w-4 h-4 text-red-600" />; default: return <Calendar className="w-4 h-4" />; } };

    const filteredLeads = leads
        .filter((l) => filter === "all" || l.tier === filter)
        .filter((l) => regionFilter === "all" || (l.region || "") === regionFilter)
        .filter((l) => statusFilter === "all" || l.status === statusFilter)
        .filter((l) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                l.vehicleBrand.toLowerCase().includes(q) ||
                l.vehicleModel.toLowerCase().includes(q) ||
                l.city.toLowerCase().includes(q) ||
                (l.region || "").toLowerCase().includes(q)
            );
        })
        .sort((a, b) => sortBy === "score" ? b.score - a.score : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const regions = buildRegionOptions(
        Array.from(new Set(leads.map((lead) => (lead.region || "").trim()).filter(Boolean)))
    );

    const logExport = async (format: string) => { try { await fetch("/api/leads/view-log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: "export", field: `export_${format}` }) }); } catch { /* */ } };
    const exportCSV = () => {
        const headers = ["Nome", "Telefone", "Estado", "Cidade", "Marca", "Modelo", "Ano", "KM", "Pontuação", "Qualificação", "Status", "Data"];
        const rows = filteredLeads.map((l) => [l.name, l.phone, l.state, l.city, l.vehicleBrand, l.vehicleModel, l.vehicleYear, l.km, l.score, TIER_LABELS[l.tier] || l.tier, STATUS_LABELS[l.status] || l.status, new Date(l.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })]);
        const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "leads.csv"; a.click(); URL.revokeObjectURL(url);
        logExport("csv");
    };
    const exportExcel = () => {
        const headers = ["Nome", "Telefone", "Estado", "Cidade", "Marca", "Modelo", "Ano", "KM", "Pontuação", "Qualificação", "Status", "Data"];
        const rows = filteredLeads.map((l) => [l.name, l.phone, l.state, l.city, l.vehicleBrand, l.vehicleModel, l.vehicleYear, l.km, l.score, TIER_LABELS[l.tier] || l.tier, STATUS_LABELS[l.status] || l.status, new Date(l.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })]);
        let t = "<table><thead><tr>"; headers.forEach((h) => (t += `<th>${h}</th>`)); t += "</tr></thead><tbody>"; rows.forEach((r) => { t += "<tr>"; r.forEach((c) => (t += `<td>${c}</td>`)); t += "</tr>"; }); t += "</tbody></table>";
        const blob = new Blob([`<html><head><meta charset="utf-8"></head><body>${t}</body></html>`], { type: "application/vnd.ms-excel;charset=utf-8;" });
        const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "leads.xls"; a.click(); URL.revokeObjectURL(url);
        logExport("excel");
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><Car className="w-5 h-5 text-white" /></div>
                                <span className="font-bold text-gray-900">Painel do Vendedor</span>
                            </div>
                            {user && <span className="text-sm text-gray-500">Ola, <strong>{user.name}</strong></span>}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="text-center"><div className="text-lg font-bold text-red-500">{leads.filter((l) => l.tier === "hot").length}</div><div className="text-[10px] text-gray-500">Quentes</div></div>
                                <div className="text-center"><div className="text-lg font-bold text-yellow-500">{leads.filter((l) => l.tier === "warm").length}</div><div className="text-[10px] text-gray-500">Mornos</div></div>
                                <div className="text-center"><div className="text-lg font-bold text-blue-500">{leads.filter((l) => l.tier === "cold").length}</div><div className="text-[10px] text-gray-500">Frios</div></div>
                            </div>
                            <div className="relative" ref={exportRef}>
                                <button onClick={() => setExportMenuOpen(!exportMenuOpen)} className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 cursor-pointer"><Download className="w-4 h-4" /> Exportar</button>
                                {exportMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                                        <button onClick={() => { exportCSV(); setExportMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer rounded-t-lg"><FileText className="w-4 h-4 text-green-600" /> CSV</button>
                                        <button onClick={() => { exportExcel(); setExportMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer rounded-b-lg"><FileSpreadsheet className="w-4 h-4 text-blue-600" /> Excel</button>
                                    </div>
                                )}
                            </div>
                            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 cursor-pointer" title="Sair"><LogOut className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">
                                <Filter className="w-3.5 h-3.5 inline mr-1" />Qualificação
                            </label>
                            <div className="flex gap-2">
                                {(["all", "hot", "warm", "cold"] as const).map((tier) => (
                                    <button key={tier} onClick={() => setFilter(tier)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filter === tier ? tier === "hot" ? "bg-red-500 text-white shadow-md shadow-red-500/20" : tier === "warm" ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" : tier === "cold" ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" : "bg-gray-800 text-white" : tier === "hot" ? "bg-red-50 text-red-600 hover:bg-red-100" : tier === "warm" ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : tier === "cold" ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{tier === "all" ? "Todos" : TIER_LABELS[tier]}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Região</label>
                            <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-900 text-xs">
                                <option value="all">Todas as Regiões</option>
                                {regions.map((region) => <option key={region} value={region}>{region}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Status</label>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-900 text-xs">
                                <option value="all">Todos</option>
                                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Ordenar</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "recent" | "score")} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-900 text-xs">
                                <option value="score">Maior pontuação</option>
                                <option value="recent">Mais recentes</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block"><Search className="w-3.5 h-3.5 inline mr-1" />Buscar</label>
                            <input type="text" placeholder="Marca, modelo ou cidade..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-gray-900 text-xs focus:ring-1 focus:ring-primary" />
                        </div>
                        <div className="ml-auto text-sm text-gray-500">{filteredLeads.length} lead(s)</div>
                    </div>
                </div>

                {/* Leads */}
                <div className="space-y-4">
                    {filteredLeads.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</h3>
                        </div>
                    ) : (
                        filteredLeads.map((lead) => {
                            const photos = getPhotos(lead);
                            const isExpanded = expandedLeads.has(lead.id);
                            return (
                                <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-4">
                                                    {getTierIcon(lead.tier)}
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getTierColor(lead.tier)}`}>{TIER_LABELS[lead.tier]} - Pontuação {lead.score}/100</span>
                                                    <span className="flex items-center gap-1 text-sm text-gray-500">{getStatusIcon(lead.status)} {STATUS_LABELS[lead.status] || lead.status}</span>
                                                    <span className="text-xs text-gray-400">{new Date(lead.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nome</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-gray-900">{isFieldRevealed(lead.id, "name") ? lead.name : maskValue(lead.name)}</p>
                                                            <button onClick={() => toggleField(lead.id, "name")} className="text-gray-400 hover:text-gray-600 cursor-pointer" title={isFieldRevealed(lead.id, "name") ? "Ocultar" : "Revelar"}>
                                                                {isFieldRevealed(lead.id, "name") ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contato</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium text-gray-900 flex items-center gap-1"><Phone className="w-4 h-4 text-gray-400" />{isFieldRevealed(lead.id, "phone") ? lead.phone : maskPhone(lead.phone)}</p>
                                                            <button onClick={() => toggleField(lead.id, "phone")} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                                                {isFieldRevealed(lead.id, "phone") ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Localidade</p>
                                                        <p className="font-medium text-gray-900 flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" />{lead.city}{lead.state ? ` - ${lead.state}` : ""}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Veículo</p>
                                                        <p className="font-medium text-gray-900">{lead.vehicleBrand} {lead.vehicleModel} {lead.vehicleYear}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex flex-col gap-2 items-end">
                                                <select value={lead.status} onChange={(e) => updateStatus(lead.id, e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm">
                                                    {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                                </select>
                                                <button onClick={() => { setExpandedLeads((prev) => { const n = new Set(prev); n.has(lead.id) ? n.delete(lead.id) : n.add(lead.id); return n; }); }} className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary cursor-pointer">
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    {isExpanded ? "Recolher" : "Detalhes"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                                            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                                                <div className="flex-1 bg-white rounded-lg p-4">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Veículo</p>
                                                    <p className="font-semibold text-gray-900 text-lg">{lead.vehicleBrand} {lead.vehicleModel} {lead.vehicleYear} - {lead.km} km</p>
                                                </div>
                                                {photos.length > 0 && (
                                                    <div className="bg-white rounded-lg p-4">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> Fotos ({photos.length})</p>
                                                        <div className="flex gap-2">{photos.map((photo, idx) => <button key={idx} onClick={() => setPhotoModal({ photos, index: idx })} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary cursor-pointer"><img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" /></button>)}</div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                <div className="bg-white rounded-lg p-3"><p className="text-xs text-gray-500">Urgência</p><p className="font-medium text-gray-900">{lead.urgency === "hoje" && "Hoje"}{lead.urgency === "3dias" && "3 dias"}{lead.urgency === "7dias" && "7 dias"}{lead.urgency === "sem_pressa" && "Sem pressa"}</p></div>
                                                <div className="bg-white rounded-lg p-3"><p className="text-xs text-gray-500">Desconto FIPE</p><p className="font-medium text-gray-900">{lead.discountAcceptance === "acima_20" && "Acima de 20%"}{lead.discountAcceptance === "10_20" && "Entre 10 a 20%"}{lead.discountAcceptance === "fipe" && "Tabela FIPE"}{lead.discountAcceptance === "20" && "20% abaixo"}{lead.discountAcceptance === "15" && "15% abaixo"}{lead.discountAcceptance === "10" && "10% abaixo"}</p></div>
                                                <div className="bg-white rounded-lg p-3"><p className="text-xs text-gray-500">Documentação</p><p className="font-medium text-gray-900">{lead.docsStatus === "regular" && "Regular"}{lead.docsStatus === "pendencias" && "Pendências"}{lead.docsStatus === "nao_sei" && "Não sei"}</p></div>
                                                <div className="bg-white rounded-lg p-3"><p className="text-xs text-gray-500">Financiamento</p><p className="font-medium text-gray-900">{lead.financeStatus === "nao" ? "Quitado" : "Com financiamento"}</p></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {photoModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPhotoModal(null)}>
                    <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setPhotoModal(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors cursor-pointer">
                            <X className="w-6 h-6" />
                        </button>
                        <img src={photoModal.photos[photoModal.index]} alt="Foto do veículo em tamanho real" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
                        {photoModal.photos.length > 1 && (
                            <div className="flex justify-center gap-2 mt-4">{photoModal.photos.map((photo, idx) => <button key={idx} onClick={() => setPhotoModal({ ...photoModal, index: idx })} className={`w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer ${idx === photoModal.index ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}><img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" /></button>)}</div>
                        )}
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {newLeadNotification && (
                <div className="fixed bottom-6 right-6 z-50 animate-[fadeInUp_0.4s_ease-out] shadow-xl rounded-xl border border-green-200 bg-white p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0 animate-pulse">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm">
                            {newLeadsCount > 1 ? `${newLeadsCount} novos leads capturados!` : "Oba! Novo lead capturado!"}
                        </p>
                        <p className="text-xs text-gray-500">A lista foi atualizada com sucesso.</p>
                    </div>
                    <button onClick={() => setNewLeadNotification(false)} className="text-gray-400 hover:text-gray-600 ml-2">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
