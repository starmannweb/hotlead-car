"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    BarChart3, Eye, Download, Users, ArrowLeft, Car,
    LogOut, Calendar, User, FileSpreadsheet, Clock,
    Plus, Trash2, X, Banknote
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ViewLogEntry {
    id: string;
    createdAt: string;
    leadId: string;
    field: string;
    creditsUsed: number;
    user?: { id: string; name: string; email: string; role: string };
    lead?: { id: string; vehicleBrand: string; vehicleModel: string; tier: string; score: number; name: string; city: string };
}

interface UserSummary {
    id: string;
    name: string;
    email: string;
    role: string;
    credits: number;
    createdAt: string;
    _count: { viewLogs: number; exportLogs: number };
}

interface SummaryData {
    totalViews: number;
    totalExports: number;
    totalUsers: number;
    totalLeads: number;
    totalCreditsSold: number;
    topViewers: { userId: string; viewCount: number; user?: { id: string; name: string; email: string; role: string } }[];
}

const ROLE_LABELS: Record<string, string> = { admin: "Admin", seller: "Vendedor", client: "Lojista" };
const ROLE_COLORS: Record<string, string> = { admin: "bg-purple-100 text-purple-700", seller: "bg-blue-100 text-blue-700", client: "bg-green-100 text-green-700" };

export default function RelatoriosPage() {
    const router = useRouter();
    const [tab, setTab] = useState<"summary" | "views" | "users">("summary");
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [views, setViews] = useState<ViewLogEntry[]>([]);
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [days, setDays] = useState(30);
    
    // User creation state
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [isSubmittingUser, setIsSubmittingUser] = useState(false);
    const [newUserForm, setNewUserForm] = useState({ name: "", email: "", role: "client", password: "" });

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (tab === "summary") fetchSummary();
        if (tab === "views") fetchViews();
        if (tab === "users") fetchUsers();
    }, [tab, days, selectedUser]);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            if (!data.success || data.user.role !== "admin") {
                router.push("/login");
                return;
            }
            setLoading(false);
        } catch { router.push("/login"); }
    };

    const fetchSummary = async () => {
        const res = await fetch(`/api/reports?type=summary&days=${days}`);
        const data = await res.json();
        if (data.success) setSummary(data.data);
    };

    const fetchViews = async () => {
        const params = new URLSearchParams({ type: "views", days: days.toString() });
        if (selectedUser) params.set("userId", selectedUser);
        const res = await fetch(`/api/reports?${params}`);
        const data = await res.json();
        if (data.success) setViews(data.data);
    };

    const fetchUsers = async () => {
        const res = await fetch(`/api/reports?type=users&days=${days}`);
        const data = await res.json();
        if (data.success) setUsers(data.data);
    };

    const handleLogout = async () => {
        await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
        router.push("/login");
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingUser(true);
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUserForm),
            });
            const data = await res.json();
            if (data.success) {
                alert("Usuário criado com sucesso!");
                setUserModalOpen(false);
                setNewUserForm({ name: "", email: "", role: "client", password: "" });
                fetchUsers();
            } else {
                alert(data.message || "Erro ao criar usuário.");
            }
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            alert("Erro de conexão.");
        } finally {
            setIsSubmittingUser(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Tem certeza que deseja apagar este usuário? Esta ação não pode ser desfeita.")) return;
        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                fetchUsers();
            } else {
                alert(data.message || "Erro ao remover usuário.");
            }
        } catch (error) {
            console.error("Erro ao remover usuário:", error);
            alert("Erro de conexão.");
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => router.push("/admin")} className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"><ArrowLeft className="w-5 h-5" /></button>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><BarChart3 className="w-5 h-5 text-white" /></div>
                                <span className="font-bold text-gray-900">Relatorios</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <select value={days} onChange={(e) => setDays(parseInt(e.target.value))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700">
                                <option value={7}>Ultimos 7 dias</option>
                                <option value={30}>Ultimos 30 dias</option>
                                <option value={90}>Ultimos 90 dias</option>
                            </select>
                            <ThemeToggle />
                            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 cursor-pointer"><LogOut className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {([
                        { id: "summary", label: "Resumo", icon: BarChart3 },
                        { id: "views", label: "Visualizacoes", icon: Eye },
                        { id: "users", label: "Usuarios", icon: Users },
                    ] as const).map((t) => (
                        <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${tab === t.id ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                            <t.icon className="w-4 h-4" />{t.label}
                        </button>
                    ))}
                </div>

                {/* Summary Tab */}
                {tab === "summary" && summary && (
                    <div className="space-y-6">
                        {/* Stats cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2"><Eye className="w-4 h-4" />Visualizacoes</div>
                                <p className="text-3xl font-bold text-gray-900">{summary.totalViews}</p>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2"><Download className="w-4 h-4" />Exportacoes</div>
                                <p className="text-3xl font-bold text-gray-900">{summary.totalExports}</p>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2"><Users className="w-4 h-4" />Usuarios</div>
                                <p className="text-3xl font-bold text-gray-900">{summary.totalUsers}</p>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2"><Car className="w-4 h-4" />Leads</div>
                                <p className="text-3xl font-bold text-gray-900">{summary.totalLeads}</p>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <div className="flex items-center gap-2 text-green-600 text-sm mb-2"><Banknote className="w-4 h-4" />Créditos Vendidos</div>
                                <p className="text-3xl font-bold text-green-700">{summary.totalCreditsSold}</p>
                            </div>
                        </div>

                        {/* Top viewers */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Top Visualizadores</h3>
                            <div className="space-y-3">
                                {summary.topViewers.map((v, idx) => (
                                    <div key={v.userId || idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">{idx + 1}</div>
                                            <div>
                                                <p className="font-medium text-gray-900">{v.user?.name || "Anonimo"}</p>
                                                <p className="text-xs text-gray-500">{v.user?.email}</p>
                                            </div>
                                            {v.user?.role && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ROLE_COLORS[v.user.role] || ""}`}>{ROLE_LABELS[v.user.role]}</span>}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{v.viewCount}</p>
                                            <p className="text-xs text-gray-500">visualizacoes</p>
                                        </div>
                                    </div>
                                ))}
                                {summary.topViewers.length === 0 && <p className="text-gray-500 text-sm">Nenhuma visualizacao registrada.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Views Tab */}
                {tab === "views" && (
                    <div className="space-y-4">
                        {selectedUser && (
                            <button onClick={() => setSelectedUser(null)} className="flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer">
                                <ArrowLeft className="w-4 h-4" /> Voltar para todos
                            </button>
                        )}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium text-gray-700">Data/Hora</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-700">Usuario</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-700">Funcao</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-700">Lead</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-700">Campo</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-700">Creditos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {views.map((v) => (
                                        <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-600">
                                                <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(v.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {v.user ? (
                                                    <button onClick={() => { setSelectedUser(v.user!.id); setTab("views"); }} className="text-primary hover:underline cursor-pointer font-medium">{v.user.name}</button>
                                                ) : <span className="text-gray-400">Anonimo</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                {v.user?.role && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ROLE_COLORS[v.user.role] || ""}`}>{ROLE_LABELS[v.user.role]}</span>}
                                            </td>
                                            <td className="px-4 py-3 text-gray-900">
                                                {v.lead ? `${v.lead.vehicleBrand} ${v.lead.vehicleModel}` : v.leadId === "export" ? "Exportacao" : v.leadId}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{v.field}</td>
                                            <td className="px-4 py-3">{v.creditsUsed > 0 ? <span className="text-amber-600 font-bold">{v.creditsUsed}</span> : <span className="text-gray-400">0</span>}</td>
                                        </tr>
                                    ))}
                                    {views.length === 0 && <tr><td colSpan={6} className="text-center text-gray-500 py-8">Nenhuma visualizacao registrada.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {tab === "users" && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button onClick={() => setUserModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer shadow-sm">
                                <Plus className="w-4 h-4" /> Criar Usuário
                            </button>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Usuario</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Funcao</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Creditos</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Visualizacoes</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Exportacoes</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Cadastro</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Acoes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-gray-500" /></div>
                                                <div><p className="font-medium text-gray-900">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ROLE_COLORS[u.role] || ""}`}>{ROLE_LABELS[u.role]}</span></td>
                                        <td className="px-4 py-3 font-bold text-amber-600">{u.credits}</td>
                                        <td className="px-4 py-3 font-medium">{u._count.viewLogs}</td>
                                        <td className="px-4 py-3 font-medium">{u._count.exportLogs}</td>
                                        <td className="px-4 py-3 text-gray-600">{new Date(u.createdAt).toLocaleDateString("pt-BR")}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => { setSelectedUser(u.id); setTab("views"); }} className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer" title="Ver Atividade">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteUser(u.id)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 cursor-pointer" title="Remover Usuário">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && <tr><td colSpan={7} className="text-center text-gray-500 py-8">Nenhum usuario cadastrado.</td></tr>}
                            </tbody>
                        </table>
                        </div>
                    </div>
                )}
            </div>

            {/* User creation modal */}
            {userModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Novo Usuário</h2>
                            <button onClick={() => setUserModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
                                <input required type="text" value={newUserForm.name} onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail de acesso</label>
                                <input required type="email" value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Função no painel</label>
                                <select required value={newUserForm.role} onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                                    <option value="client">Lojista / Cliente (Compra Leads)</option>
                                    <option value="seller">Vendedor (Opcional interno)</option>
                                    <option value="admin">Administrador Geral</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                                <input required minLength={6} type="password" value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={isSubmittingUser} className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-70">
                                    {isSubmittingUser ? "Criando..." : "Criar Usuário"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
