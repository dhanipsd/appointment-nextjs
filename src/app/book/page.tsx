"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format, addDays } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Link from "next/link";
import { CheckCircle2, Calendar, Clock, ArrowRight } from "lucide-react";

function BookingForm() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();

    const selectedServiceId = searchParams.get("service");

    const [date, setDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState<any[]>([]);

    // Custom Time State
    const [selectedHour, setSelectedHour] = useState<number>(10);
    const [amPm, setAmPm] = useState<"AM" | "PM">("AM");

    // UI State
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [bookingSuccess, setBookingSuccess] = useState<any>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(`/login?callbackUrl=/book?service=${selectedServiceId}`);
        }
    }, [status, router, selectedServiceId]);

    // Fetch services to show name in summary
    useEffect(() => {
        fetch("/api/services")
            .then((r) => r.json())
            .then((data) => setServices(data))
            .catch(() => { });
    }, []);

    const selectedService = services.find((s: any) => s.id === selectedServiceId);

    const handleBook = async () => {
        if (!selectedServiceId || !date) return;

        setLoading(true);
        setErrorMsg(null);
        try {
            const bookingDate = new Date(date);
            let hour24 = selectedHour;
            if (amPm === "PM" && hour24 !== 12) hour24 += 12;
            if (amPm === "AM" && hour24 === 12) hour24 = 0;

            bookingDate.setHours(hour24, 0, 0, 0);

            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    serviceId: selectedServiceId,
                    dynamicTime: bookingDate.toISOString()
                })
            });

            if (res.ok) {
                const appointment = await res.json();
                setBookingSuccess({
                    ...appointment,
                    serviceName: selectedService?.name || "Service",
                    date: bookingDate,
                    time: `${selectedHour}:00 ${amPm}`,
                });
            } else {
                const data = await res.json();
                setErrorMsg(data.error || "Failed to confirm appointment. It may already be booked.");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!selectedServiceId) {
        return <div className="text-center py-12">Please select a service first from the home page.</div>;
    }

    // Success Summary Card
    if (bookingSuccess) {
        return (
            <div className="max-w-lg mx-auto px-4 py-12">
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 border border-gray-100 text-center">
                    <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-500 mb-8">Your appointment has been scheduled successfully.</p>

                    <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <Calendar className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase">Service</p>
                                <p className="font-semibold text-gray-900">{bookingSuccess.serviceName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <Calendar className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase">Date</p>
                                <p className="font-semibold text-gray-900">{format(bookingSuccess.date, "EEEE, MMMM d, yyyy")}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <Clock className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase">Time</p>
                                <p className="font-semibold text-gray-900">{bookingSuccess.time}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase">Status</p>
                                <p className="font-semibold text-green-600">CONFIRMED</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Link
                            href="/dashboard"
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            View My Appointments
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/"
                            className="w-full block text-center text-indigo-600 font-medium py-3 px-6 rounded-xl hover:bg-indigo-50 transition-colors"
                        >
                            Book Another Service
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 border-b pb-6">
                    Book Appointment
                    {selectedService && (
                        <span className="block text-lg font-medium text-indigo-600 mt-1">{selectedService.name}</span>
                    )}
                </h2>

                {errorMsg && (
                    <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-8 mt-6 flex items-center justify-between">
                        <span className="font-medium">{errorMsg}</span>
                        <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600 font-bold ml-4">✕</button>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-12 mt-8">
                    {/* Date Picker Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">1. Select Date</h3>
                        <div className="border border-gray-200 p-2 rounded-2xl bg-gray-50/50">
                            <DatePicker
                                selected={date}
                                onChange={(date: Date | null) => { if (date) setDate(date); }}
                                minDate={new Date()}
                                maxDate={addDays(new Date(), 60)}
                                inline
                                calendarClassName="border-none bg-transparent w-full"
                            />
                        </div>
                    </div>

                    {/* Custom Time Selector Section */}
                    <div className="flex flex-col h-full">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">2. Select Time</h3>

                        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">

                            {/* Hour Scroller */}
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Time</label>
                                <div className="h-32 overflow-y-auto custom-scrollbar border border-gray-100 rounded-xl relative snap-y snap-mandatory select-none">
                                    <div className="py-12 pointer-events-none"></div>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((hour) => (
                                        <button
                                            key={`hour-${hour}`}
                                            type="button"
                                            onClick={() => setSelectedHour(hour)}
                                            className={`w-full py-2 text-xl font-medium snap-center transition-colors ${selectedHour === hour ? 'text-indigo-600 bg-indigo-50 font-bold text-2xl' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {hour}:00
                                        </button>
                                    ))}
                                    <div className="py-12 pointer-events-none"></div>
                                </div>
                            </div>

                            {/* AM/PM Toggle */}
                            <div className="flex flex-col gap-2 justify-center pt-6">
                                <button
                                    type="button"
                                    onClick={() => setAmPm('AM')}
                                    className={`px-4 py-3 rounded-xl font-bold transition-all ${amPm === 'AM' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    AM
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAmPm('PM')}
                                    className={`px-4 py-3 rounded-xl font-bold transition-all ${amPm === 'PM' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    PM
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button
                                onClick={handleBook}
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
                            >
                                {loading ? "Confirming..." : `Confirm Booking for ${date ? format(date, 'MMM do') : ''} at ${selectedHour}:00 ${amPm}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BookPage() {
    return (
        <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
            <BookingForm />
        </Suspense>
    );
}
