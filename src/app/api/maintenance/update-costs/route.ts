import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const leads = await prisma.lead.findMany();
        const results = { hot: 0, warm: 0, cold: 0 };

        for (const lead of leads) {
            let cost = 1;
            if (lead.tier === "hot") cost = 5;
            else if (lead.tier === "warm") cost = 3;

            await prisma.lead.update({
                where: { id: lead.id },
                data: { unlockCost: cost }
            });

            if (lead.tier === "hot") results.hot++;
            else if (lead.tier === "warm") results.warm++;
            else results.cold++;
        }

        return NextResponse.json({
            success: true,
            message: "Custos atualizados com sucesso",
            results
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
