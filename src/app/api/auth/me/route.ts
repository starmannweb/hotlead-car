import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Nao autenticado" },
                { status: 401 }
            );
        }
        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("[AUTH ME ERROR]", error);
        return NextResponse.json(
            { success: false, message: "Erro interno" },
            { status: 500 }
        );
    }
}
