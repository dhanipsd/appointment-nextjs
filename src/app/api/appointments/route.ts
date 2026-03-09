import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    getAppointments,
    findService,
    findSlot,
    createSlot,
    createAppointment,
    hasOverlappingAppointment,
} from "@/lib/data";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.role === "ADMIN" ? undefined : session.user.id;
        const appointments = getAppointments(userId);

        return NextResponse.json(appointments);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { serviceId, timeSlotId, dynamicTime } = body;

        if (!serviceId) {
            return NextResponse.json({ error: "Missing serviceId" }, { status: 400 });
        }

        let slotId = timeSlotId;

        if (dynamicTime) {
            const startTime = new Date(dynamicTime);

            const service = findService(serviceId);
            if (!service) {
                return NextResponse.json({ error: "Service not found" }, { status: 404 });
            }

            const endTime = new Date(startTime.getTime() + service.duration * 60000);

            if (hasOverlappingAppointment(startTime, endTime)) {
                return NextResponse.json(
                    { error: "Time slot is already booked or overlaps with an existing appointment." },
                    { status: 409 }
                );
            }

            const newSlot = createSlot(startTime, endTime, false);
            slotId = newSlot.id;
        } else {
            if (!timeSlotId) {
                return NextResponse.json({ error: "Missing time info" }, { status: 400 });
            }

            const slot = findSlot(timeSlotId);
            if (!slot || !slot.isAvailable) {
                return NextResponse.json({ error: "Time slot not available" }, { status: 400 });
            }
        }

        const appointment = createAppointment({
            userId: session.user.id,
            serviceId,
            timeSlotId: slotId,
        });

        return NextResponse.json(appointment, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
    }
}
