import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { findUser, createUser } from "@/lib/data";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET || "demo-secret-key-for-appointment-app-2026",
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "admin@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                let user = findUser(credentials.email);

                // Auto-create demo users on first login
                if (!user && (credentials.email === "admin@example.com" || credentials.email === "customer@example.com")) {
                    const hashedPassword = await bcrypt.hash(credentials.password, 10);
                    user = createUser({
                        name: credentials.email === "admin@example.com" ? "Admin User" : "Customer User",
                        email: credentials.email,
                        password: hashedPassword,
                        role: credentials.email === "admin@example.com" ? "ADMIN" : "USER"
                    });
                    return { id: user.id, email: user.email, name: user.name, role: user.role };
                }

                if (!user || !user.password) return null;

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;

                return { id: user.id, email: user.email, name: user.name, role: user.role };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        }
    }
};
