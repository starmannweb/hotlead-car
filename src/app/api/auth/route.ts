import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, createToken, getTokenMaxAge, getTokenName } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, email, password, name, role } = body;

        if (action === "register") {
            // Only clients can self-register
            if (role && role !== "client") {
                return NextResponse.json(
                    { success: false, message: "Registro permitido apenas para clientes" },
                    { status: 403 }
                );
            }

            if (!email || !password || !name) {
                return NextResponse.json(
                    { success: false, message: "Preencha todos os campos" },
                    { status: 400 }
                );
            }

            // Check if exists
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) {
                return NextResponse.json(
                    { success: false, message: "E-mail ja cadastrado" },
                    { status: 409 }
                );
            }

            const hashedPassword = await hashPassword(password);
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: "client",
                    credits: 0,
                },
            });

            const authUser: AuthUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role as "admin" | "seller" | "client",
                credits: user.credits,
            };

            const token = createToken(authUser);
            const response = NextResponse.json({ success: true, user: authUser });
            response.cookies.set(getTokenName(), token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: getTokenMaxAge(),
                path: "/",
            });

            return response;
        }

        if (action === "login") {
            if (!email || !password) {
                return NextResponse.json(
                    { success: false, message: "Informe e-mail e senha" },
                    { status: 400 }
                );
            }

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user || !user.isActive) {
                return NextResponse.json(
                    { success: false, message: "Credenciais invalidas" },
                    { status: 401 }
                );
            }

            const valid = await verifyPassword(password, user.password);
            if (!valid) {
                return NextResponse.json(
                    { success: false, message: "Credenciais invalidas" },
                    { status: 401 }
                );
            }

            const authUser: AuthUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role as "admin" | "seller" | "client",
                credits: user.credits,
            };

            const token = createToken(authUser);
            const response = NextResponse.json({ success: true, user: authUser });
            response.cookies.set(getTokenName(), token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: getTokenMaxAge(),
                path: "/",
            });

            return response;
        }

        if (action === "logout") {
            const response = NextResponse.json({ success: true });
            response.cookies.set(getTokenName(), "", { maxAge: 0, path: "/" });
            return response;
        }

        return NextResponse.json(
            { success: false, message: "Acao invalida" },
            { status: 400 }
        );
    } catch (error) {
        console.error("[AUTH ERROR]", error);
        return NextResponse.json(
            { success: false, message: "Erro interno" },
            { status: 500 }
        );
    }
}
