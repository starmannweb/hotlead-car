import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, getAuthUser } from "@/lib/auth";

// POST /api/users - Create user (admin only, or first admin seed)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name, role, action } = body;

        // Seed action: create first admin if no users exist
        if (action === "seed") {
            const count = await prisma.user.count();
            if (count > 0) {
                return NextResponse.json(
                    { success: false, message: "Ja existem usuarios. Use login." },
                    { status: 400 }
                );
            }

            const hashedPassword = await hashPassword(password || "admin123");
            const admin = await prisma.user.create({
                data: {
                    email: email || "admin@autooportunidade.com.br",
                    password: hashedPassword,
                    name: name || "Administrador",
                    role: "admin",
                },
            });

            return NextResponse.json({
                success: true,
                message: "Admin criado com sucesso",
                user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
            });
        }

        // Admin-only actions
        const currentUser = await getAuthUser();
        if (!currentUser || currentUser.role !== "admin") {
            return NextResponse.json({ success: false, message: "Sem permissao" }, { status: 403 });
        }

        if (!email || !password || !name || !role) {
            return NextResponse.json({ success: false, message: "Todos os campos sao obrigatorios" }, { status: 400 });
        }

        if (!["admin", "seller", "client"].includes(role)) {
            return NextResponse.json({ success: false, message: "Role invalida" }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ success: false, message: "Email ja cadastrado" }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name, role },
        });

        return NextResponse.json({
            success: true,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        });
    } catch (error) {
        console.error("[USERS ERROR]", error);
        return NextResponse.json({ success: false, message: "Erro interno" }, { status: 500 });
    }
}

// GET /api/users - List users (admin only)
export async function GET() {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser || currentUser.role !== "admin") {
            return NextResponse.json({ success: false, message: "Sem permissao" }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true, email: true, name: true, role: true,
                credits: true, isActive: true, createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        console.error("[USERS LIST ERROR]", error);
        return NextResponse.json({ success: false, message: "Erro interno" }, { status: 500 });
    }
}
