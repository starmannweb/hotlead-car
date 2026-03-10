import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Exemplo de integração PIX via API Pagou
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 });

        const { amount, credits } = await request.json();

        if (!amount || !credits) {
            return NextResponse.json({ success: false, message: "Dados incompletos" }, { status: 400 });
        }

        // =========================================================================
        // AQUI VOCÊ INTEGRA A API DA PAGOU.VC
        // Normalmente você mandaria um POST para a api da Pagou contendo o valor:
        //
        // const res = await fetch('https://api.pagou.vc/v1/pix/qrcode', {
        //     method: 'POST',
        //     headers: { 
        //         'Authorization': `Bearer ${process.env.PAGOU_API_KEY}`,
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ amount, description: `Compra de ${credits} creditos - HotLead` })
        // });
        // const data = await res.json();
        // =========================================================================

        // Como estou criando a base, vou gerar um MOCK (dados falsos) de PIX para você testar no painel.
        // Assim que você plugar sua API Key acima, você apenas substitui os dados do mock.

        const pixCopiaECola = `00020126580014br.gov.bcb.pix0136${user.email}5204000053039865405${amount}.005802BR5915AUTO OPORTUNIDAD6009SAO PAULO62070503***6304E8A2`;

        // Vamos guardar essa transação no banco de dados com status "pending" para quando liberar
        const tx = await (prisma as any).creditTransaction.create({
            data: {
                userId: user.id,
                amount: credits, // número de creditos
                cost: 0,
                type: "purchase",
                // Pode adicionar um transactionId da pagou depois aqui se adicionar na tabela
            }
        });

        return NextResponse.json({
            success: true,
            txid: tx.id,
            qrCodeUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/220px-QR_code_for_mobile_English_Wikipedia.svg.png",
            pixCopiaECola: pixCopiaECola,
            message: "PIX Gerado com sucesso"
        });

    } catch (error) {
        console.error("Erro na Api de Pix Pagou", error);
        return NextResponse.json({ success: false, message: "Erro ao processar PIX" }, { status: 500 });
    }
}
