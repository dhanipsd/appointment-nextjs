import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateQuery = searchParams.get("date");

        const whereClause: any = { isAvailable: true };

        if (dateQuery) {
            const startOfDay = new Date(dateQuery);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(dateQuery);
            endOfDay.setUTCHours(23, 59, 59, 999);

            whereClause.startTime = {
                gte: startOfDay,
                lte: endOfDay
            };
        }

        const slots = await prisma.timeSlot.findMany({
            where: whereClause,
            orderBy: { startTime: "asc" }
        });

        return NextResponse.json(slots);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch time slots" }, { status: 500 });
    }
}
