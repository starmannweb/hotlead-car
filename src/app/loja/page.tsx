"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Eye, EyeOff, Lock, Coins, Car, Phone, MapPin,
    Search, Filter, ChevronDown, ChevronUp, LogOut,
    CreditCard, Flame, Snowflake, TrendingUp, Clock,
    Image as ImageIcon, X, Download, FileText,
    FileSpreadsheet, CheckCircle, XCircle, Calendar,
    TrendingDown, Banknote, Bell, Loader2, Gauge
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { buildRegionOptions } from "@/lib/regions";
import { notifyNewLeads, requestLeadNotificationPermission } from "@/lib/lead-notifications";

interface Lead {
    id: string;
    name: string;
    phone: string;
    state: string;
    city: string;
    region?: string;
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
    const [stateFilter, setStateFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"recent" | "score">("recent");
    const [searchQuery, setSearchQuery] = useState("");
    const [unlockedLeads, setUnlockedLeads] = useState<Set<string>>(new Set());
    const [expandedLeads, setExpandedLeads] = useState<Set<string>>(new Set());
    const [photoModal, setPhotoModal] = useState<{ photos: string[]; index: number } | null>(null);
    const [unlocking, setUnlocking] = useState<string | null>(null);
    const [credits, setCredits] = useState(0);
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [newLeadNotification, setNewLeadNotification] = useState(false);
    const [newLeadsCount, setNewLeadsCount] = useState(0);
    const [pixData, setPixData] = useState<{ qrCodeUrl: string, pixCopiaECola: string, txid: string, message?: string } | null>(null);
    const [loadingPix, setLoadingPix] = useState(false);
    const seenLeadIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        checkAuth();
        requestLeadNotificationPermission();
        const interval = setInterval(() => {
            fetchLeads(true);
        }, 30000);
        return () => clearInterval(interval);
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
                if (data.lead) {
                    setLeads((prev) =>
                        prev.map((l) =>
                            l.id === leadId ? { ...l, ...data.lead } : l
                        )
                    );
                }
                return true;
            } else if (res.status === 402) {
                setBuyModalOpen(true);
                return false;
            } else {
                alert(data.message || "Erro ao desbloquear");
                return false;
            }
        } catch {
            alert("Erro de conexao");
            return false;
        } finally {
            setUnlocking(null);
        }
    };

    const handleGeneratePix = async (amount: number, credits: number) => {
        setLoadingPix(true);
        try {
            const res = await fetch("/api/checkout/pix", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, credits }), 
            });
            const data = await res.json();
            if (data.success) {
                setPixData(data);
            } else {
                alert(data.message || "Erro ao gerar PIX");
            }
        } catch {
            alert("Erro de conexão");
        } finally {
            setLoadingPix(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!pixData?.txid) return;
        setLoadingPix(true);
        try {
            const res = await fetch("/api/checkout/pix/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ txid: pixData.txid }),
            });
            const data = await res.json();
            if (data.success) {
                setCredits(data.newCredits);
                setPixData({ ...pixData, message: "Pagamento Aprovado!" });
                setTimeout(() => {
                    setBuyModalOpen(false);
                    setPixData(null);
                }, 2000);
            } else {
                alert("Pagamento ainda não detectado. Tente novamente.");
            }
        } catch {
        } finally {
            setLoadingPix(false);
        }
    };

    const isUnlocked = (leadId: string) => {
        if (user?.role === "admin" || user?.role === "seller") return true;
        return Array.from(unlockedLeads).some(k => k.startsWith(`${leadId}_`));
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
        .filter((l) => stateFilter === "all" || l.region === stateFilter)
        .filter((l) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                l.vehicleBrand.toLowerCase().includes(q) ||
                l.vehicleModel.toLowerCase().includes(q) ||
                l.city.toLowerCase().includes(q) ||
                (l.region && l.region.toLowerCase().includes(q))
            );
        })
        .sort((a, b) => {
            if (sortBy === "score") return b.score - a.score;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    const regions = buildRegionOptions(
        Array.from(new Set(leads.map((lead) => (lead.region || "").trim()).filter(Boolean)))
    );
    const canBuyCredits = user?.role === "client";

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,109,0,0.3)]">
                                    <Car className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">Painel de Leads</span>
                            </div>
                            {user && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Olá, <strong className="text-gray-900 dark:text-white">{user.name}</strong>
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Credits badge */}
                            <button
                                type="button"
                                onClick={() => canBuyCredits && setBuyModalOpen(true)}
                                className={`flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 ${canBuyCredits ? "cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors" : "cursor-default"}`}
                                title={canBuyCredits ? "Clique para comprar créditos" : "Saldo de créditos"}
                            >
                                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{credits} creditos</span>
                            </button>

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

                            {/* Export removed per request */}

                            <ThemeToggle />

                            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" title="Sair do painel">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Tier Filter */}
                        <div className="flex-1 min-w-[300px] md:flex-initial">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                                <Filter className="w-3.5 h-3.5 inline mr-1" />Qualificação
                            </label>
                            <div className="flex gap-2">
                                {(["all", "hot", "warm", "cold"] as const).map((tier) => (
                                    <button key={tier} onClick={() => setFilter(tier)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filter === tier
                                        ? tier === "hot" ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                                            : tier === "warm" ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                                                : tier === "cold" ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                                                    : "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
                                        : tier === "hot" ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400"
                                            : tier === "warm" ? "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 dark:text-amber-400"
                                                : tier === "cold" ? "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                        }`}>
                                        {tier === "all" ? "Todos" : TIER_LABELS[tier]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Region filter */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Região</label>
                            <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs">
                                <option value="all">Todas as Regiões</option>
                                {regions.map((region) => <option key={region} value={region}>{region}</option>)}
                            </select>
                        </div>
 
                        {/* Sort */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Ordenar</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "recent" | "score")} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs">
                                <option value="recent">Mais recentes</option>
                                <option value="score">Maior pontuação</option>
                            </select>
                        </div>
 
                        {/* Search */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                                <Search className="w-3.5 h-3.5 inline mr-1" />Buscar
                            </label>
                            <input
                                type="text"
                                placeholder="Marca, modelo ou cidade..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                        </div>
 
                        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">{filteredLeads.length} lead(s)</div>
                    </div>
                </div>                {/* Leads List */}
                <div className="space-y-4">
                    {filteredLeads.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                            <Car className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum lead encontrado</h3>
                            <p className="text-gray-500 dark:text-gray-400">Os leads aparecerao aqui quando forem cadastrados.</p>
                        </div>
                    ) : (
                        filteredLeads.map((lead) => {
                            const photos = getPhotos(lead);
                            const isExpanded = expandedLeads.has(lead.id);
                            const contactUnlocked =
                                user?.role === "admin" ||
                                user?.role === "seller" ||
                                isUnlocked(lead.id) ||
                                (lead.name !== "***" && lead.phone !== "***");
                            const nameUnlocked = contactUnlocked;
                            const phoneUnlocked = contactUnlocked;
                            const photosUnlocked = contactUnlocked;
 
                            return (
                                <div key={lead.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                {/* Tier badge */}
                                                <div className="flex items-center gap-3 mb-4">
                                                    {getTierIcon(lead.tier)}
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getTierColor(lead.tier)} dark:bg-opacity-10`}>
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
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    {/* Name - lockable */}
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nome</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                                {nameUnlocked ? lead.name : maskValue(lead.name)}
                                                            </p>
                                                            {nameUnlocked && user?.role !== "admin" && user?.role !== "seller" && (
                                                                <EyeOff className="w-4 h-4 text-green-500" />
                                                            )}
                                                        </div>
                                                    </div>
 
                                                    {/* Phone - lockable */}
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Contato</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                                                <Phone className="w-4 h-4 text-gray-400" />
                                                                {phoneUnlocked ? (
                                                                    <a href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá, eu vi o seu contato na AutoOportunidade e fiquei interessado no seu veículo ' + lead.vehicleBrand + ' ' + lead.vehicleModel + '.')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                                        {lead.phone}
                                                                    </a>
                                                                ) : maskPhone(lead.phone)}
                                                            </p>
                                                        </div>
                                                    </div>
 
                                                    {/* Location - always visible */}
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Localidade</p>
                                                        <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                                            <MapPin className="w-4 h-4 text-gray-400" />
                                                            {lead.city}{lead.state ? ` - ${lead.state}` : ""}
                                                            {lead.region && <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">({lead.region})</span>}
                                                        </p>
                                                    </div>
 
                                                    {/* Vehicle & KM */}
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Veículo</p>
                                                        <p className="font-medium text-gray-900 dark:text-white leading-tight">
                                                            {lead.vehicleBrand} {lead.vehicleModel} {lead.vehicleYear}
                                                        </p>
                                                        
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                                <Gauge className="w-4 h-4 text-gray-400" />
                                                                {lead.km}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
 
                                            {/* Actions */}
                                            <div className="ml-4 flex flex-col gap-2 items-end">
                                                {/* Cost indicator */}
                                                {!contactUnlocked && user?.role === "client" && (
                                                    <div className="flex flex-col items-center gap-2">
                                                      <button
                                                          onClick={() => unlockLead(lead.id, "all")}
                                                          disabled={unlocking === lead.id}
                                                          className="flex items-center gap-1 text-sm bg-amber-500 text-white hover:bg-amber-600 px-3 py-1.5 rounded-lg border border-amber-600 transition-colors shadow-sm cursor-pointer"
                                                          title={`Desbloquear contato`}
                                                      >
                                                          {unlocking === lead.id ? (
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <>
                                                                  <Eye className="w-4 h-4" /> Desbloquear Contato
                                                                </>
                                                            )}
                                                      </button>
                                                      <span className="text-[10px] text-gray-500 dark:text-gray-400 px-1 font-medium">{lead.unlockCost || 1} crédito(s)</span>
                                                    </div>
                                                )}
 
                                                <button
                                                    onClick={() => {
                                                        setExpandedLeads((prev) => {
                                                            const next = new Set(prev);
                                                            next.has(lead.id) ? next.delete(lead.id) : next.add(lead.id);
                                                            return next;
                                                        });
                                                    }}
                                                    className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-primary cursor-pointer mt-2"
                                                >
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    {isExpanded ? "Recolher detalhes" : "Ver detalhes"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
 
                                    {/* Expanded details */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 dark:border-gray-700 p-5 bg-gray-50/50 dark:bg-gray-800/50">
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
                                                        {photosUnlocked ? (
                                                            <div className="flex gap-2">
                                                                {photos.map((photo, idx) => (
                                                                    <button key={idx} onClick={() => setPhotoModal({ photos, index: idx })} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-primary transition-colors cursor-pointer">
                                                                        <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="flex gap-2">
                                                                {photos.map((_, idx) => (
                                                                    <div key={idx} className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center border-2 border-gray-300 dark:border-gray-700">
                                                                        <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
 
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
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPhotoModal(null)}>
                    <div className="relative max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setPhotoModal(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300 cursor-pointer">
                            <X className="w-6 h-6" />
                        </button>
                        <img src={photoModal.photos[photoModal.index]} alt="Foto do veículo em tamanho real" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
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

            {/* Buy Credits Modal */}
            {buyModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-8 relative animate-[fadeInUp_0.3s_ease-out] border border-gray-100 dark:border-gray-700">
                        <button onClick={() => { setBuyModalOpen(false); setPixData(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>

                        {!pixData ? (
                            <>
                                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 mx-auto">
                                    <Coins className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Compre Créditos</h3>
                                <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-8">
                                    Para visualizar os dados reais dos clientes mais qualificados, você precisa adquirir um pacote de créditos.
                                </p>
                                
                                <div className="space-y-4 mb-6">
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:border-primary dark:hover:border-primary transition bg-gray-50 dark:bg-gray-700/50" onClick={() => handleGeneratePix(30, 30)}>
                                        <p className="font-bold text-gray-800 dark:text-white text-lg">30 Créditos</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Por R$ 30,00</p>
                                    </div>
 
                                    <div className="border-2 border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 relative rounded-xl p-4 text-center cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition shadow-sm" onClick={() => handleGeneratePix(55, 60)}>
                                        <span className="absolute -top-3 right-4 bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">Mais Popular</span>
                                        <p className="font-bold text-green-800 dark:text-green-400 text-xl flex items-center justify-center gap-1">
                                            <Flame className="w-5 h-5" /> 60 Créditos
                                        </p>
                                        <p className="text-sm text-green-700 dark:text-green-500 font-medium">Por R$ 55,00 (Economize R$5)</p>
                                    </div>
 
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:border-primary dark:hover:border-primary transition" onClick={() => handleGeneratePix(130, 150)}>
                                        <p className="font-bold text-gray-800 dark:text-white text-lg flex items-center justify-center gap-1">
                                            <TrendingUp className="w-5 h-5 text-blue-600" /> 150 Créditos
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Por R$ 130,00 (Melhor custo/benefício)</p>
                                    </div>
                                </div>

                                {loadingPix && (
                                    <div className="w-full bg-gray-100 text-gray-600 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Gerando QR Code...
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center">
                                {pixData.message ? (
                                    <>
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 mx-auto">
                                            <CheckCircle className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Pagamento Aprovado!</h3>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Pague pelo PIX</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Escaneie o QR Code abaixo ou copie e cole a chave no seu app bancário.</p>
                                        <div className="bg-white p-4 rounded-xl mb-4 inline-block">
                                            <img src={pixData.qrCodeUrl} alt="QR Code PIX" className="w-48 h-48 mx-auto" />
                                        </div>
 
                                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl break-all text-xs text-gray-600 dark:text-gray-300 mb-4 font-mono select-all border border-gray-200 dark:border-gray-600">
                                            {pixData.pixCopiaECola}
                                        </div>

                                        <button onClick={handleConfirmPayment} disabled={loadingPix} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2">
                                            {loadingPix ? "Verificando..." : "Já Paguei! (Confirmar)"}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {newLeadNotification && (
                <div className="fixed bottom-6 right-6 z-50 animate-[fadeInUp_0.4s_ease-out] shadow-2xl rounded-2xl border border-green-200 dark:border-green-800 bg-white dark:bg-gray-800 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0 animate-pulse">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white text-base">
                            {newLeadsCount > 1 ? `${newLeadsCount} novos leads!` : "Oba! Novo lead!"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Acabamos de receber uma nova oportunidade.</p>
                    </div>
                    <button onClick={() => setNewLeadNotification(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
