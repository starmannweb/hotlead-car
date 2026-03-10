import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 });

        const { txid } = await request.json();

        if (!txid) {
            return NextResponse.json({ success: false, message: "Falta transação id" }, { status: 400 });
        }

        const tx = await (prisma as any).creditTransaction.findUnique({ where: { id: txid } });
        if (!tx) return NextResponse.json({ success: false, message: "Não encontrada" }, { status: 404 });

        // Isso é apenas no nosso simulador de PIX Pagou. Na integração real com a API da Pagou, 
        // eles enviarão um webhook para o seu servidor quando o pagamento cair, 
        // e lá você adiciona os créditos ao usuário.

        // Aqui atualiza o balance de "Créditos" do usuario
        const updatedUser = await (prisma as any).user.update({
            where: { id: user.id },
            data: { credits: { increment: tx.amount } }
        });

        return NextResponse.json({
            success: true,
            message: "Pagamento aprovado. Créditos adicionados!",
            newCredits: updatedUser.credits
        });

    } catch (error) {
        console.error("Erro confirmando pix", error);
        return NextResponse.json({ success: false, message: "Erro ao confirmar" }, { status: 500 });
    }
}
