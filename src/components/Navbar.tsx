"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Calendar, User, LogOut, LogIn } from "lucide-react";

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
                        <Calendar className="h-6 w-6" />
                        <span>BookIt</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {session ? (
                            <>
                                <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 transition flex items-center gap-1 font-medium">
                                    <User className="h-4 w-4" />
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="text-gray-600 hover:text-red-600 transition flex items-center gap-1 font-medium"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-gray-600 hover:text-indigo-600 px-4 py-2 font-medium transition flex items-center gap-2"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                                >
                                    <LogIn className="h-4 w-4" />
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
