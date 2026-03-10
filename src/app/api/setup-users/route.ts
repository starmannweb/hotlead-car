import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const hash = async (pwd: string) => bcrypt.hash(pwd, 12);
        const users = [
            { email: 'admin@autooportunidade.com.br', password: await hash('SenhaAdmin123'), name: 'Administrador', role: 'admin', credits: 0 },
            { email: 'vendedor@autooportunidade.com.br', password: await hash('SenhaVendedor123'), name: 'Vendedor', role: 'seller', credits: 0 },
            { email: 'lojista@autooportunidade.com.br', password: await hash('SenhaLoja123'), name: 'Lojista VIP', role: 'client', credits: 50 },
        ];

        const results = [];
        for (const u of users) {
            const exist = await prisma.user.findUnique({ where: { email: u.email } });
            if (!exist) {
                const res = await prisma.user.create({ data: u });
                results.push({ email: res.email, role: res.role, action: "created" });
            } else {
                await prisma.user.update({
                    where: { email: u.email },
                    data: { password: u.password, role: u.role, credits: u.credits }
                });
                results.push({ email: exist.email, role: exist.role, action: "updated password/credits" });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Configuração de níveis de usuários aplicada com sucesso. Você já pode fazer login com as contas abaixo.",
            users: results,
            passwords_used: {
                admin: "SenhaAdmin123",
                vendedor: "SenhaVendedor123",
                lojista: "SenhaLoja123"
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
