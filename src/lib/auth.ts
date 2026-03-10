import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "hotlead-car-secret-key-change-in-prod";
const TOKEN_NAME = "auth_token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: "admin" | "seller" | "client";
    credits: number;
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function createToken(user: AuthUser): string {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: TOKEN_MAX_AGE }
    );
}

export function verifyToken(token: string): { id: string; email: string; role: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    } catch {
        return null;
    }
}

export async function getAuthUser(): Promise<AuthUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(TOKEN_NAME)?.value;

        if (!token) return null;

        const decoded = verifyToken(token);
        if (!decoded) return null;

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, name: true, role: true, credits: true, isActive: true },
        });

        if (!user || !user.isActive) return null;

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as "admin" | "seller" | "client",
            credits: user.credits,
        };
    } catch {
        return null;
    }
}

export function getTokenMaxAge() {
    return TOKEN_MAX_AGE;
}

export function getTokenName() {
    return TOKEN_NAME;
}

/**
 * Calculate unlock cost based on lead score/tier
 */
export function getUnlockCost(tier: string): number {
    switch (tier) {
        case "hot": return 30;
        case "warm": return 15;
        case "cold": return 5;
        default: return 5;
    }
}
