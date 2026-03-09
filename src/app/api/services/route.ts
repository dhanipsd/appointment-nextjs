import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServices, createService, deleteService, updateService } from "@/lib/data";

export async function GET() {
    try {
        const result = getServices();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, duration, price } = body;

        if (!name || !duration) {
            return NextResponse.json({ error: "Name and duration are required" }, { status: 400 });
        }

        const service = createService({
            name,
            description: description || null,
            duration: Number(duration),
            price: price ? Number(price) : null,
        });

        return NextResponse.json(service, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, name, description, duration, price } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing service id" }, { status: 400 });
        }

        const service = updateService(id, {
            name,
            description: description ?? null,
            duration: duration ? Number(duration) : undefined,
            price: price !== undefined ? (price ? Number(price) : null) : undefined,
        });

        if (!service) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json(service);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing service id" }, { status: 400 });
        }

        const success = deleteService(id);
        if (!success) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
    }
}
