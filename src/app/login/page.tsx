"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Car, Mail, Lock, User } from "lucide-react";

type Mode = "login" | "register";

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("login");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
        name: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: mode,
                    ...form,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.message);
                setLoading(false);
                return;
            }

            // Redirect based on role
            const role = data.user?.role;
            if (role === "admin") {
                router.push("/admin");
            } else if (role === "seller") {
                router.push("/painel");
            } else {
                router.push("/loja");
            }
        } catch {
            setError("Erro de conexao. Tente novamente.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark via-navy to-navy-light px-4 relative overflow-hidden">
            {/* Decorative blurs */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-[150px]" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                        <Car className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-white font-bold text-2xl tracking-tight">
                        Auto<span className="text-accent">Oportunidade</span>
                    </span>
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-extrabold text-white mb-1 text-center">
                        {mode === "login" ? "Entrar" : "Criar conta"}
                    </h2>
                    <p className="text-white/50 text-sm text-center mb-8">
                        {mode === "login"
                            ? "Acesse seu painel de leads"
                            : "Cadastre-se gratuitamente como lojista"}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === "register" && (
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                <input
                                    type="text"
                                    placeholder="Nome completo"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <input
                                type="email"
                                placeholder="E-mail"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Senha"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                minLength={6}
                                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl pl-12 pr-12 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-accent/20 cursor-pointer disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Carregando...
                                </>
                            ) : (
                                <>
                                    {mode === "login" ? "Entrar" : "Criar conta"}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setMode(mode === "login" ? "register" : "login");
                                setError("");
                            }}
                            className="text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                        >
                            {mode === "login"
                                ? "Ainda nao tem conta? Cadastre-se"
                                : "Ja tem conta? Faca login"}
                        </button>
                    </div>
                </div>

                {/* Back to site */}
                <div className="mt-6 text-center">
                    <a
                        href="/"
                        className="text-sm text-white/30 hover:text-white/50 transition-colors"
                    >
                        Voltar ao site
                    </a>
                </div>
            </div>
        </div>
    );
}
