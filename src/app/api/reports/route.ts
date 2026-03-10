import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "Nao autenticado" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type") || "views";
        const userId = searchParams.get("userId");
        const days = parseInt(searchParams.get("days") || "30");

        const since = new Date();
        since.setDate(since.getDate() - days);

        // Admin can see all; others only see own
        const filterUserId = user.role === "admin" && userId ? userId : user.role !== "admin" ? user.id : undefined;

        if (type === "views") {
            const where: Record<string, unknown> = { createdAt: { gte: since } };
            if (filterUserId) where.userId = filterUserId;

            const views = await prisma.viewLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: 200,
                include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                    lead: { select: { id: true, vehicleBrand: true, vehicleModel: true, tier: true, score: true, name: true, city: true } },
                },
            });

            return NextResponse.json({ success: true, data: views });
        }

        if (type === "users") {
            // Admin only
            if (user.role !== "admin") {
                return NextResponse.json({ success: false, message: "Sem permissao" }, { status: 403 });
            }

            const users = await prisma.user.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    credits: true,
                    createdAt: true,
                    _count: {
                        select: {
                            viewLogs: { where: { createdAt: { gte: since } } },
                            exportLogs: { where: { createdAt: { gte: since } } },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });

            return NextResponse.json({ success: true, data: users });
        }

        if (type === "exports") {
            const where: Record<string, unknown> = { createdAt: { gte: since } };
            if (filterUserId) where.userId = filterUserId;

            const exports = await prisma.exportLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: 100,
                include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                },
            });

            return NextResponse.json({ success: true, data: exports });
        }

        if (type === "summary") {
            // Admin only
            if (user.role !== "admin") {
                return NextResponse.json({ success: false, message: "Sem permissao" }, { status: 403 });
            }

            const [totalViews, totalExports, totalUsers, totalLeads, viewsByUser] = await Promise.all([
                prisma.viewLog.count({ where: { createdAt: { gte: since } } }),
                prisma.exportLog.count({ where: { createdAt: { gte: since } } }),
                prisma.user.count({ where: { isActive: true } }),
                prisma.lead.count(),
                prisma.viewLog.groupBy({
                    by: ["userId"],
                    where: { createdAt: { gte: since }, userId: { not: null } },
                    _count: { id: true },
                    orderBy: { _count: { id: "desc" } },
                    take: 10,
                }),
            ]);

            // Get user names for the top viewers
            const topViewerIds = viewsByUser
                .filter((v) => v.userId)
                .map((v) => v.userId as string);

            const topViewerUsers = topViewerIds.length > 0
                ? await prisma.user.findMany({
                    where: { id: { in: topViewerIds } },
                    select: { id: true, name: true, email: true, role: true },
                })
                : [];

            const topViewers = viewsByUser.map((v) => ({
                userId: v.userId,
                viewCount: v._count.id,
                user: topViewerUsers.find((u) => u.id === v.userId),
            }));

            return NextResponse.json({
                success: true,
                data: { totalViews, totalExports, totalUsers, totalLeads, topViewers },
            });
        }

        return NextResponse.json({ success: false, message: "Tipo invalido" }, { status: 400 });
    } catch (error) {
        console.error("[REPORTS ERROR]", error);
        return NextResponse.json({ success: false, message: "Erro interno" }, { status: 500 });
    }
}
