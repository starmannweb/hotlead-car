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
 * Calculate unlock cost based on lead score
 */
export function getUnlockCost(score: number): number {
    // 90-100 = 30 credits
    // 80-89 = 25 credits
    // 70-79 = 20 credits
    // 60-69 = 15 credits
    // 50-59 = 10 credits
    // < 50 = 5 credits
    if (score >= 90) return 30;
    if (score >= 80) return 25;
    if (score >= 70) return 20;
    if (score >= 60) return 15;
    if (score >= 50) return 10;
    return 5;
}
