import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;
        const appointment = await prisma.appointment.findUnique({
            where: { id }
        });

        if (!appointment) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Only Admin or the owner can delete
        if (session.user.role !== "ADMIN" && appointment.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.$transaction(async (tx: any) => {
            // Mark appointment cancelled
            await tx.appointment.update({
                where: { id },
                data: { status: "CANCELLED" }
            });

            // Free up the time slot
            await tx.timeSlot.update({
                where: { id: appointment.timeSlotId },
                data: { isAvailable: true }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete appointment" }, { status: 500 });
    }
}
