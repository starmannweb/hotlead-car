import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// GET /api/credits - Get balance and history
export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "Nao autenticado" }, { status: 401 });
        }

        const [balance, transactions] = await Promise.all([
            prisma.user.findUnique({ where: { id: user.id }, select: { credits: true } }),
            prisma.creditTransaction.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: "desc" },
                take: 50,
                include: { lead: { select: { vehicleBrand: true, vehicleModel: true, tier: true } } },
            }),
        ]);

        return NextResponse.json({
            success: true,
            credits: balance?.credits || 0,
            transactions,
        });
    } catch (error) {
        console.error("[CREDITS ERROR]", error);
        return NextResponse.json({ success: false, message: "Erro interno" }, { status: 500 });
    }
}

// POST /api/credits - Purchase credits or unlock lead
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "Nao autenticado" }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body;

        // Admin and seller always have free access
        if (user.role === "admin" || user.role === "seller") {
            if (action === "unlock") {
                // Still log the view for tracking
                const { leadId, field } = body;
                await prisma.viewLog.create({
                    data: {
                        leadId,
                        userId: user.id,
                        field: field || "details",
                        creditsUsed: 0,
                        ip: "",
                    },
                });
                return NextResponse.json({ success: true, creditsUsed: 0 });
            }
        }

        // Client actions
        if (action === "purchase") {
            const { amount, description } = body;
            if (!amount || amount <= 0) {
                return NextResponse.json(
                    { success: false, message: "Quantidade invalida" },
                    { status: 400 }
                );
            }

            const [updatedUser] = await prisma.$transaction([
                prisma.user.update({
                    where: { id: user.id },
                    data: { credits: { increment: amount } },
                }),
                prisma.creditTransaction.create({
                    data: {
                        userId: user.id,
                        type: "purchase",
                        amount,
                        description: description || `Compra de ${amount} creditos`,
                    },
                }),
            ]);

            return NextResponse.json({
                success: true,
                credits: updatedUser.credits,
            });
        }

        if (action === "unlock") {
            const { leadId, field } = body;

            if (!leadId) {
                return NextResponse.json(
                    { success: false, message: "Lead ID obrigatorio" },
                    { status: 400 }
                );
            }

            // Check if already unlocked
            const existingView = await prisma.viewLog.findFirst({
                where: { leadId, userId: user.id, field: field || "details" },
            });

            if (existingView) {
                return NextResponse.json({ success: true, creditsUsed: 0, alreadyUnlocked: true });
            }

            // Get lead to determine cost
            const lead = await prisma.lead.findUnique({
                where: { id: leadId },
                select: { tier: true, unlockCost: true },
            });

            if (!lead) {
                return NextResponse.json(
                    { success: false, message: "Lead nao encontrado" },
                    { status: 404 }
                );
            }

            const cost = lead.unlockCost;

            // Check balance
            const currentUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { credits: true },
            });

            if (!currentUser || currentUser.credits < cost) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Creditos insuficientes",
                        required: cost,
                        balance: currentUser?.credits || 0,
                    },
                    { status: 402 }
                );
            }

            // Deduct credits and log
            const [updatedUser] = await prisma.$transaction([
                prisma.user.update({
                    where: { id: user.id },
                    data: { credits: { decrement: cost } },
                }),
                prisma.creditTransaction.create({
                    data: {
                        userId: user.id,
                        type: "spent",
                        amount: -cost,
                        leadId,
                        description: `Desbloqueio de lead (${field || "details"})`,
                    },
                }),
                prisma.viewLog.create({
                    data: {
                        leadId,
                        userId: user.id,
                        field: field || "details",
                        creditsUsed: cost,
                        ip: "",
                    },
                }),
            ]);

            return NextResponse.json({
                success: true,
                creditsUsed: cost,
                credits: updatedUser.credits,
            });
        }

        return NextResponse.json(
            { success: false, message: "Acao invalida" },
            { status: 400 }
        );
    } catch (error) {
        console.error("[CREDITS POST ERROR]", error);
        return NextResponse.json({ success: false, message: "Erro interno" }, { status: 500 });
    }
}
