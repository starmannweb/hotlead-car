import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const currentUser = await getAuthUser();
        if (!currentUser || currentUser.role !== "admin") {
            return NextResponse.json({ success: false, message: "Sem permissao" }, { status: 403 });
        }

        const id = params.id;
        
        // Cannot delete yourself
        if (currentUser.id === id) {
            return NextResponse.json({ success: false, message: "Nao e possivel deletar a sua propria conta" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            return NextResponse.json({ success: false, message: "Usuario nao encontrado" }, { status: 404 });
        }

        await prisma.user.delete({ where: { id } });

        return NextResponse.json({ success: true, message: "Usuario removido com sucesso" });
    } catch (error) {
        console.error("[USER DELETE ERROR]", error);
        return NextResponse.json({ success: false, message: "Erro interno" }, { status: 500 });
    }
}
