"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Eye, EyeOff, Lock, Coins, Car, Phone, MapPin,
    Search, Filter, ChevronDown, ChevronUp, LogOut,
    CreditCard, Flame, Snowflake, TrendingUp, Clock,
    Image as ImageIcon, X, Download, FileText,
    FileSpreadsheet, CheckCircle, XCircle, Calendar,
} from "lucide-react";

interface Lead {
    id: string;
    name: string;
    phone: string;
    state: string;
    city: string;
    vehicleBrand: string;
    vehicleModel: string;
    vehicleYear: string;
    km: string;
    urgency: string;
    discountAcceptance: string;
    docsStatus: string;
    financeStatus: string;
    score: number;
    tier: string;
    status: string;
    photos: string;
    unlockCost: number;
    createdAt: string;
}

interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
    credits: number;
}

const TIER_LABELS: Record<string, string> = {
    hot: "Quente", warm: "Morno", cold: "Frio",
};

const STATUS_LABELS: Record<string, string> = {
    new: "Novo", contacted: "Contactado", negotiating: "Negociando",
    converted: "Convertido", lost: "Perdido",
};

export default function LojaPage() {
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "hot" | "warm" | "cold">("all");
    const [sortBy, setSortBy] = useState<"recent" | "score">("recent");
    const [searchQuery, setSearchQuery] = useState("");
    const [unlockedLeads, setUnlockedLeads] = useState<Set<string>>(new Set());
    const [expandedLeads, setExpandedLeads] = useState<Set<string>>(new Set());
    const [photoModal, setPhotoModal] = useState<{ photos: string[]; index: number } | null>(null);
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const [unlocking, setUnlocking] = useState<string | null>(null);
    const [credits, setCredits] = useState(0);
    const exportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        checkAuth();
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

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            if (!data.success) {
                router.push("/login");
                return;
            }
            setUser(data.user);
            setCredits(data.user.credits);
            fetchLeads();
        } catch {
            router.push("/login");
        }
    };

    const fetchLeads = async () => {
        try {
            const res = await fetch("/api/leads");
            const data = await res.json();
            if (data.success) setLeads(data.data);
        } catch (err) {
            console.error("Erro ao carregar leads:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "logout" }),
        });
        router.push("/login");
    };

    const unlockLead = async (leadId: string, field: string) => {
        setUnlocking(leadId);
        try {
            const res = await fetch("/api/credits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "unlock", leadId, field }),
            });
            const data = await res.json();

            if (data.success) {
                setUnlockedLeads((prev) => new Set([...prev, `${leadId}_${field}`]));
                if (data.credits !== undefined) setCredits(data.credits);
            } else if (res.status === 402) {
                alert(`Creditos insuficientes. Necessario: ${data.required}, Saldo: ${data.balance}`);
            } else {
                alert(data.message || "Erro ao desbloquear");
            }
        } catch {
            alert("Erro de conexao");
        } finally {
            setUnlocking(null);
        }
    };

    const isUnlocked = (leadId: string, field: string) => {
        if (user?.role === "admin" || user?.role === "seller") return true;
        return unlockedLeads.has(`${leadId}_${field}`);
    };

    const maskValue = (value: string) =>
        !value || value.length <= 3 ? "***" : value.substring(0, 2) + "*".repeat(Math.max(value.length - 2, 3));

    const maskPhone = (phone: string) =>
        !phone ? "***" : phone.replace(/\d(?=\d{2})/g, "*");

    const getPhotos = (lead: Lead): string[] => {
        try {
            const parsed = JSON.parse(lead.photos || "[]");
            return Array.isArray(parsed) ? parsed.filter((p: string) => p && p.startsWith("data:")) : [];
        } catch { return []; }
    };

    const getTierIcon = (tier: string) => {
        switch (tier) {
            case "hot": return <Flame className="w-5 h-5 text-red-500" />;
            case "warm": return <TrendingUp className="w-5 h-5 text-yellow-500" />;
            case "cold": return <Snowflake className="w-5 h-5 text-blue-400" />;
            default: return null;
        }
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case "hot": return "bg-red-50 text-red-700 border-red-200";
            case "warm": return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case "cold": return "bg-blue-50 text-blue-700 border-blue-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "new": return <Clock className="w-4 h-4" />;
            case "contacted": return <Phone className="w-4 h-4" />;
            case "converted": return <CheckCircle className="w-4 h-4 text-green-600" />;
            case "lost": return <XCircle className="w-4 h-4 text-red-600" />;
            default: return <Calendar className="w-4 h-4" />;
        }
    };

    // Filtering and sorting
    const filteredLeads = leads
        .filter((l) => filter === "all" || l.tier === filter)
        .filter((l) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                l.vehicleBrand.toLowerCase().includes(q) ||
                l.vehicleModel.toLowerCase().includes(q) ||
                l.city.toLowerCase().includes(q)
            );
        })
        .sort((a, b) => {
            if (sortBy === "score") return b.score - a.score;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    const logExport = async (format: string) => {
        try {
            await fetch("/api/leads/view-log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leadId: "export", field: `export_${format}` }),
            });
        } catch { /* silent */ }
    };

    const exportCSV = () => {
        const headers = ["Marca", "Modelo", "Ano", "KM", "Cidade", "Score", "Qualificacao", "Status", "Data"];
        const rows = filteredLeads.map((l) => [
            l.vehicleBrand, l.vehicleModel, l.vehicleYear, l.km, l.city,
            l.score, TIER_LABELS[l.tier] || l.tier, STATUS_LABELS[l.status] || l.status,
            new Date(l.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }),
        ]);
        const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "leads.csv"; a.click();
        URL.revokeObjectURL(url);
        logExport("csv");
    };

    const exportExcel = () => {
        const headers = ["Marca", "Modelo", "Ano", "KM", "Cidade", "Score", "Qualificacao", "Status", "Data"];
        const rows = filteredLeads.map((l) => [
            l.vehicleBrand, l.vehicleModel, l.vehicleYear, l.km, l.city,
            l.score, TIER_LABELS[l.tier] || l.tier, STATUS_LABELS[l.status] || l.status,
            new Date(l.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }),
        ]);
        let table = "<table><thead><tr>";
        headers.forEach((h) => (table += `<th>${h}</th>`));
        table += "</tr></thead><tbody>";
        rows.forEach((r) => { table += "<tr>"; r.forEach((c) => (table += `<td>${c}</td>`)); table += "</tr>"; });
        table += "</tbody></table>";
        const blob = new Blob([`<html><head><meta charset="utf-8"></head><body>${table}</body></html>`], { type: "application/vnd.ms-excel;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "leads.xls"; a.click();
        URL.revokeObjectURL(url);
        logExport("excel");
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
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                                    <Car className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-gray-900">Painel de Leads</span>
                            </div>
                            {user && (
                                <span className="text-sm text-gray-500">
                                    Ola, <strong>{user.name}</strong>
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Credits badge */}
                            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                <Coins className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-bold text-amber-700">{credits} creditos</span>
                            </div>

                            {/* Lead counters */}
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-red-500">{leads.filter((l) => l.tier === "hot").length}</div>
                                    <div className="text-[10px] text-gray-500">Quentes</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-yellow-500">{leads.filter((l) => l.tier === "warm").length}</div>
                                    <div className="text-[10px] text-gray-500">Mornos</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-blue-500">{leads.filter((l) => l.tier === "cold").length}</div>
                                    <div className="text-[10px] text-gray-500">Frios</div>
                                </div>
                            </div>

                            {/* Export */}
                            <div className="relative" ref={exportRef}>
                                <button onClick={() => setExportMenuOpen(!exportMenuOpen)} className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 cursor-pointer">
                                    <Download className="w-4 h-4" /> Exportar
                                </button>
                                {exportMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                                        <button onClick={() => { exportCSV(); setExportMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer rounded-t-lg">
                                            <FileText className="w-4 h-4 text-green-600" /> CSV
                                        </button>
                                        <button onClick={() => { exportExcel(); setExportMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer rounded-b-lg">
                                            <FileSpreadsheet className="w-4 h-4 text-blue-600" /> Excel
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 cursor-pointer" title="Sair">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Tier Filter */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">
                                <Filter className="w-3.5 h-3.5 inline mr-1" />Qualificacao
                            </label>
                            <div className="flex gap-2">
                                {(["all", "hot", "warm", "cold"] as const).map((tier) => (
                                    <button key={tier} onClick={() => setFilter(tier)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filter === tier
                                            ? tier === "hot" ? "bg-red-100 text-red-700"
                                                : tier === "warm" ? "bg-yellow-100 text-yellow-700"
                                                    : tier === "cold" ? "bg-blue-100 text-blue-700"
                                                        : "bg-gray-200 text-gray-900"
                                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                        }`}>
                                        {tier === "all" ? "Todos" : TIER_LABELS[tier]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Ordenar</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "recent" | "score")} className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-xs">
                                <option value="recent">Mais recentes</option>
                                <option value="score">Maior score</option>
                            </select>
                        </div>

                        {/* Search */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">
                                <Search className="w-3.5 h-3.5 inline mr-1" />Buscar
                            </label>
                            <input
                                type="text"
                                placeholder="Marca, modelo ou cidade..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-gray-900 text-xs focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                        </div>

                        <div className="ml-auto text-sm text-gray-500">{filteredLeads.length} lead(s)</div>
                    </div>
                </div>

                {/* Leads List */}
                <div className="space-y-4">
                    {filteredLeads.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</h3>
                            <p className="text-gray-500">Os leads aparecerao aqui quando forem cadastrados.</p>
                        </div>
                    ) : (
                        filteredLeads.map((lead) => {
                            const photos = getPhotos(lead);
                            const isExpanded = expandedLeads.has(lead.id);
                            const nameUnlocked = isUnlocked(lead.id, "name");
                            const phoneUnlocked = isUnlocked(lead.id, "phone");
                            const detailsUnlocked = isUnlocked(lead.id, "details");

                            return (
                                <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                {/* Tier badge */}
                                                <div className="flex items-center gap-3 mb-4">
                                                    {getTierIcon(lead.tier)}
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getTierColor(lead.tier)}`}>
                                                        {TIER_LABELS[lead.tier] || lead.tier} - Score {lead.score}/100
                                                    </span>
                                                    <span className="flex items-center gap-1 text-sm text-gray-500">
                                                        {getStatusIcon(lead.status)}
                                                        {STATUS_LABELS[lead.status] || lead.status}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(lead.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                </div>

                                                {/* Lead info */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    {/* Name - lockable */}
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nome</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-gray-900">
                                                                {nameUnlocked ? lead.name : maskValue(lead.name)}
                                                            </p>
                                                            {!nameUnlocked && (
                                                                <button
                                                                    onClick={() => unlockLead(lead.id, "name")}
                                                                    disabled={unlocking === lead.id}
                                                                    className="flex items-center gap-1 text-amber-600 hover:text-amber-700 cursor-pointer text-xs"
                                                                    title={`Desbloquear (${lead.unlockCost} creditos)`}
                                                                >
                                                                    {unlocking === lead.id ? (
                                                                        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                                                    ) : (
                                                                        <>
                                                                            <Eye className="w-4 h-4" />
                                                                            <Lock className="w-3 h-3" />
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                            {nameUnlocked && user?.role !== "admin" && user?.role !== "seller" && (
                                                                <EyeOff className="w-4 h-4 text-green-500" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Phone - lockable */}
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contato</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium text-gray-900 flex items-center gap-1">
                                                                <Phone className="w-4 h-4 text-gray-400" />
                                                                {phoneUnlocked ? lead.phone : maskPhone(lead.phone)}
                                                            </p>
                                                            {!phoneUnlocked && (
                                                                <button
                                                                    onClick={() => unlockLead(lead.id, "phone")}
                                                                    disabled={unlocking === lead.id}
                                                                    className="flex items-center gap-1 text-amber-600 hover:text-amber-700 cursor-pointer text-xs"
                                                                    title={`Desbloquear (${lead.unlockCost} creditos)`}
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                    <Lock className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Location - always visible */}
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Localidade</p>
                                                        <p className="font-medium text-gray-900 flex items-center gap-1">
                                                            <MapPin className="w-4 h-4 text-gray-400" />
                                                            {lead.city}{lead.state ? ` - ${lead.state}` : ""}
                                                        </p>
                                                    </div>

                                                    {/* Vehicle */}
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Veiculo</p>
                                                        <p className="font-medium text-gray-900">
                                                            {lead.vehicleBrand} {lead.vehicleModel} {lead.vehicleYear}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="ml-4 flex flex-col gap-2 items-end">
                                                {/* Cost indicator */}
                                                {user?.role === "client" && (
                                                    <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                                                        <Coins className="w-3.5 h-3.5" />
                                                        {lead.unlockCost} creditos
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        if (!detailsUnlocked && user?.role === "client") {
                                                            unlockLead(lead.id, "details");
                                                        }
                                                        setExpandedLeads((prev) => {
                                                            const next = new Set(prev);
                                                            next.has(lead.id) ? next.delete(lead.id) : next.add(lead.id);
                                                            return next;
                                                        });
                                                    }}
                                                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary cursor-pointer"
                                                >
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    {isExpanded ? "Recolher" : "Ver detalhes"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded details */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                                            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                                                <div className="flex-1 bg-white rounded-lg p-4">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Veiculo</p>
                                                    <p className="font-semibold text-gray-900 text-lg">
                                                        {lead.vehicleBrand} {lead.vehicleModel} {lead.vehicleYear} - {lead.km} km
                                                    </p>
                                                </div>

                                                {photos.length > 0 && (
                                                    <div className="bg-white rounded-lg p-4">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                            <ImageIcon className="w-3.5 h-3.5" /> Fotos ({photos.length})
                                                        </p>
                                                        {detailsUnlocked || user?.role === "admin" || user?.role === "seller" ? (
                                                            <div className="flex gap-2">
                                                                {photos.map((photo, idx) => (
                                                                    <button key={idx} onClick={() => setPhotoModal({ photos, index: idx })} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary cursor-pointer">
                                                                        <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="flex gap-2">
                                                                {photos.map((_, idx) => (
                                                                    <div key={idx} className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                                                                        <Lock className="w-5 h-5 text-gray-400" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                <div className="bg-white rounded-lg p-3">
                                                    <p className="text-xs text-gray-500">Urgencia</p>
                                                    <p className="font-medium text-gray-900">
                                                        {lead.urgency === "hoje" && "Hoje"}
                                                        {lead.urgency === "3dias" && "3 dias"}
                                                        {lead.urgency === "7dias" && "7 dias"}
                                                        {lead.urgency === "sem_pressa" && "Sem pressa"}
                                                    </p>
                                                </div>
                                                <div className="bg-white rounded-lg p-3">
                                                    <p className="text-xs text-gray-500">Desconto FIPE</p>
                                                    <p className="font-medium text-gray-900">
                                                        {lead.discountAcceptance === "acima_20" && "Acima de 20%"}
                                                        {lead.discountAcceptance === "10_20" && "Entre 10 a 20%"}
                                                        {lead.discountAcceptance === "fipe" && "Tabela FIPE"}
                                                        {lead.discountAcceptance === "20" && "20% abaixo"}
                                                        {lead.discountAcceptance === "15" && "15% abaixo"}
                                                        {lead.discountAcceptance === "10" && "10% abaixo"}
                                                    </p>
                                                </div>
                                                <div className="bg-white rounded-lg p-3">
                                                    <p className="text-xs text-gray-500">Documentacao</p>
                                                    <p className="font-medium text-gray-900">
                                                        {lead.docsStatus === "regular" && "Regular"}
                                                        {lead.docsStatus === "pendencias" && "Pendencias"}
                                                        {lead.docsStatus === "nao_sei" && "Nao sei"}
                                                    </p>
                                                </div>
                                                <div className="bg-white rounded-lg p-3">
                                                    <p className="text-xs text-gray-500">Financiamento</p>
                                                    <p className="font-medium text-gray-900">
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
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPhotoModal(null)}>
                    <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setPhotoModal(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300 cursor-pointer">
                            <X className="w-6 h-6" />
                        </button>
                        <img src={photoModal.photos[photoModal.index]} alt="Foto do veiculo" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
                        {photoModal.photos.length > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {photoModal.photos.map((photo, idx) => (
                                    <button key={idx} onClick={() => setPhotoModal({ ...photoModal, index: idx })} className={`w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer ${idx === photoModal.index ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}>
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
