"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar, Clock, Trash2 } from "lucide-react";

export default function DashboardPage() {
    const { data: session } = useSession();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            const res = await fetch("/api/appointments");
            if (res.ok) {
                const data = await res.json();
                setAppointments(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchAppointments();
        }
    }, [session]);

    const cancelAppointment = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this appointment?")) return;
        try {
            const res = await fetch(`/api/appointments/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                fetchAppointments();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading dashboard...</div>;
    }

    const isAdmin = session?.user?.role === "ADMIN";

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {isAdmin ? "Admin Dashboard" : "My Appointments"}
                </h1>
                <p className="mt-2 text-gray-600">
                    Welcome back, {session?.user?.name || session?.user?.email}
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                {appointments.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="bg-gray-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
                        <p className="mt-1 text-gray-500">
                            {isAdmin
                                ? "There are no appointments booked yet."
                                : "You haven't booked any appointments yet."}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {appointments.map((appt) => (
                            <div key={appt.id} className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-gray-50 transition-colors">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">{appt.service.name}</h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${appt.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                                                appt.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                                                    "bg-yellow-100 text-yellow-800"
                                            }`}>
                                            {appt.status}
                                        </span>
                                    </div>

                                    {isAdmin && (
                                        <div className="text-sm text-gray-600 mb-2 font-medium">
                                            Customer: {appt.user?.name || appt.user?.email || "Unknown User"}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            {format(new Date(appt.timeSlot.startTime), "MMMM d, yyyy")}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4" />
                                            {format(new Date(appt.timeSlot.startTime), "h:mm a")} - {format(new Date(appt.timeSlot.endTime), "h:mm a")}
                                        </div>
                                    </div>
                                </div>

                                {appt.status !== "CANCELLED" && (
                                    <button
                                        onClick={() => cancelAppointment(appt.id)}
                                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium border border-transparent hover:border-red-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Cancel
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
