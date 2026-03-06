import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
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

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || (!user.password && user.email !== "admin@example.com")) return null;

                // For demo purposes, we automatically create the admin user if it's the first login
                if (!user && (credentials.email === "admin@example.com" || credentials.email === "customer@example.com")) {
                    const hashedPassword = await bcrypt.hash(credentials.password, 10);
                    const newUser = await prisma.user.create({
                        data: {
                            email: credentials.email,
                            name: credentials.email === "admin@example.com" ? "Admin User" : "Customer User",
                            password: hashedPassword,
                            role: credentials.email === "admin@example.com" ? "ADMIN" : "USER"
                        }
                    });
                    return { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role };
                }

                if (user && user.password) {
                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isValid) return null;
                }

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
