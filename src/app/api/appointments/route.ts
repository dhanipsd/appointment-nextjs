import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Admin can see all, user can see only theirs
        const where = session.user.role === "ADMIN" ? {} : { userId: session.user.id };

        const appointments = await prisma.appointment.findMany({
            where,
            include: {
                service: true,
                timeSlot: true,
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

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

        // If dynamicTime is provided (from the new UI), create a custom slot on the fly
        if (dynamicTime) {
            const startTime = new Date(dynamicTime);

            // Get the service to determine the end time based on duration
            const service = await prisma.service.findUnique({ where: { id: serviceId } });
            if (!service) {
                return NextResponse.json({ error: "Service not found" }, { status: 404 });
            }

            const endTime = new Date(startTime.getTime() + service.duration * 60000);

            // Check for overlapping appointments
            const overlappingAppointments = await prisma.appointment.findMany({
                where: {
                    status: "CONFIRMED",
                    timeSlot: {
                        OR: [
                            // New appointment starts within an existing slot
                            {
                                startTime: { lte: startTime },
                                endTime: { gt: startTime }
                            },
                            // New appointment ends within an existing slot
                            {
                                startTime: { lt: endTime },
                                endTime: { gte: endTime }
                            },
                            // New appointment completely engulfs an existing slot
                            {
                                startTime: { gte: startTime },
                                endTime: { lte: endTime }
                            }
                        ]
                    }
                }
            });

            if (overlappingAppointments.length > 0) {
                return NextResponse.json({ error: "Time slot is already booked or overlaps with an existing appointment." }, { status: 409 });
            }

            // Create the custom slot. We immediately mark it unavailable since it's being booked.
            const newSlot = await prisma.timeSlot.create({
                data: {
                    startTime,
                    endTime,
                    isAvailable: false
                }
            });

            slotId = newSlot.id;
        } else {
            // Legacy check
            if (!timeSlotId) {
                return NextResponse.json({ error: "Missing time info" }, { status: 400 });
            }

            const slot = await prisma.timeSlot.findUnique({ where: { id: timeSlotId } });
            if (!slot || !slot.isAvailable) {
                return NextResponse.json({ error: "Time slot not available" }, { status: 400 });
            }
        }

        // Create appointment and mark slot as unavailable
        const appointment = await prisma.$transaction(async (tx: any) => {
            const appt = await tx.appointment.create({
                data: {
                    userId: session.user.id,
                    serviceId,
                    timeSlotId: slotId,
                    status: "CONFIRMED"
                }
            });

            // Mark unavailable (redundant if custom, but safe for legacy)
            await tx.timeSlot.update({
                where: { id: slotId },
                data: { isAvailable: false }
            });

            return appt;
        });

        return NextResponse.json(appointment, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
    }
}
