import { NextResponse } from "next/server";
import { getSlots } from "@/lib/data";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateQuery = searchParams.get("date");

        const slots = getSlots(dateQuery);
        return NextResponse.json(slots);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch time slots" }, { status: 500 });
    }
}
