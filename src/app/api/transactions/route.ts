import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { getTokenName } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get(getTokenName())?.value;
        
        if (!token) {
            return NextResponse.json({ success: false, message: "Não autorizado" }, { status: 401 });
        }

        const decoded = verify(token, process.env.JWT_SECRET || "default_secret") as any;
        const userRole = decoded.role;

        if (!["admin", "seller"].includes(userRole)) {
            return NextResponse.json({ success: false, message: "Acesso negado" }, { status: 403 });
        }

        const transactions = await prisma.creditTransaction.findMany({
            where: {
                type: "purchase"
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 200
        });

        return NextResponse.json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
            { success: false, message: "Erro ao buscar histórico de transações." },
            { status: 500 }
        );
    }
}
