import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, hashPassword } from "@/lib/auth";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser || currentUser.role !== "admin") {
            return NextResponse.json({ success: false, message: "Sem permissão" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, email, role, credits, password, isActive } = body as {
            name?: string;
            email?: string;
            role?: string;
            credits?: number;
            password?: string;
            isActive?: boolean;
        };

        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            return NextResponse.json({ success: false, message: "Usuário não encontrado" }, { status: 404 });
        }

        if (email && email !== existingUser.email) {
            const emailInUse = await prisma.user.findUnique({ where: { email } });
            if (emailInUse) {
                return NextResponse.json({ success: false, message: "E-mail já cadastrado" }, { status: 409 });
            }
        }

        if (role && !["admin", "seller", "client"].includes(role)) {
            return NextResponse.json({ success: false, message: "Função inválida" }, { status: 400 });
        }

        if (typeof credits !== "undefined" && (!Number.isInteger(credits) || credits < 0)) {
            return NextResponse.json({ success: false, message: "Créditos inválidos" }, { status: 400 });
        }

        if (password && password.length < 6) {
            return NextResponse.json({ success: false, message: "A senha deve ter no mínimo 6 caracteres" }, { status: 400 });
        }

        if (currentUser.id === id) {
            if (role && role !== "admin") {
                return NextResponse.json({ success: false, message: "Você não pode remover seu próprio acesso de admin" }, { status: 400 });
            }
            if (isActive === false) {
                return NextResponse.json({ success: false, message: "Você não pode desativar sua própria conta" }, { status: 400 });
            }
        }

        const data: {
            name?: string;
            email?: string;
            role?: string;
            credits?: number;
            isActive?: boolean;
            password?: string;
        } = {};

        if (typeof name === "string" && name.trim()) data.name = name.trim();
        if (typeof email === "string" && email.trim()) data.email = email.trim().toLowerCase();
        if (typeof role === "string") data.role = role;
        if (typeof credits === "number") data.credits = credits;
        if (typeof isActive === "boolean") data.isActive = isActive;
        if (password) data.password = await hashPassword(password);

        const updatedUser = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                credits: true,
                isActive: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Usuário atualizado com sucesso",
            user: updatedUser,
        });
    } catch (error) {
        console.error("[USER UPDATE ERROR]", error);
        return NextResponse.json({ success: false, message: "Erro interno" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser || currentUser.role !== "admin") {
            return NextResponse.json({ success: false, message: "Sem permissão" }, { status: 403 });
        }

        const { id } = await params;

        // Cannot delete yourself
        if (currentUser.id === id) {
            return NextResponse.json({ success: false, message: "Não é possível deletar a sua própria conta" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            return NextResponse.json({ success: false, message: "Usuário não encontrado" }, { status: 404 });
        }

        await prisma.user.delete({ where: { id } });

        return NextResponse.json({ success: true, message: "Usuário removido com sucesso" });
    } catch (error) {
        console.error("[USER DELETE ERROR]", error);
        return NextResponse.json({ success: false, message: "Erro interno" }, { status: 500 });
    }
}
