import bcrypt from 'bcryptjs';

// ============================================================
// Types
// ============================================================

export interface User {
    id: string;
    name: string | null;
    email: string | null;
    password: string | null;
    role: 'USER' | 'ADMIN';
}

export interface Service {
    id: string;
    name: string;
    description: string | null;
    duration: number;
    price: number | null;
}

export interface TimeSlot {
    id: string;
    startTime: Date;
    endTime: Date;
    isAvailable: boolean;
}

export interface Appointment {
    id: string;
    userId: string;
    serviceId: string;
    timeSlotId: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    createdAt: Date;
    updatedAt: Date;
}

// ============================================================
// ID Generator
// ============================================================

let idCounter = 0;
function generateId(): string {
    return `demo_${Date.now()}_${++idCounter}`;
}

// ============================================================
// Demo Data — Services (static)
// ============================================================

export const services: Service[] = [
    { id: 'svc_1', name: 'Academic Tutoring', description: 'Math, Science, Languages - e.g., 1 Hour SAT Prep.', duration: 60, price: 50.0 },
    { id: 'svc_2', name: 'Dental Consultation', description: 'Teeth cleaning, checkups, whitening.', duration: 45, price: 150.0 },
    { id: 'svc_3', name: 'Meeting Room Booking', description: 'Reserving conference rooms in a shared office space.', duration: 60, price: 75.0 },
    { id: 'svc_4', name: 'Photography Session', description: 'Family portraits, professional headshots, event consultation.', duration: 120, price: 250.0 },
    { id: 'svc_5', name: 'Plumbing/Electrical Inspection', description: 'Diagnostics, repair estimates.', duration: 90, price: 100.0 },
];

// ============================================================
// Demo Data — Time Slots (generated for next 7 days)
// ============================================================

function generateTimeSlots(): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const now = new Date();
    let slotIdx = 0;

    for (let i = 0; i < 7; i++) {
        const day = new Date(now);
        day.setDate(day.getDate() + i);

        for (const hour of [10, 13, 16]) {
            const startTime = new Date(day);
            startTime.setHours(hour, 0, 0, 0);
            const endTime = new Date(day);
            endTime.setHours(hour + 1, 0, 0, 0);

            slots.push({
                id: `slot_${++slotIdx}`,
                startTime,
                endTime,
                isAvailable: true,
            });
        }
    }
    return slots;
}

export const timeSlots: TimeSlot[] = generateTimeSlots();

// ============================================================
// Demo Data — Users (pre-seeded with demo accounts)
// ============================================================

const adminHash = bcrypt.hashSync('password123', 10);
const customerHash = bcrypt.hashSync('password123', 10);

export const users: User[] = [
    { id: 'user_admin', name: 'Admin User', email: 'admin@example.com', password: adminHash, role: 'ADMIN' },
    { id: 'user_customer', name: 'Customer User', email: 'customer@example.com', password: customerHash, role: 'USER' },
];

// ============================================================
// Demo Data — Appointments (starts empty)
// ============================================================

export const appointments: Appointment[] = [];

// ============================================================
// Helper Functions
// ============================================================

export function getServices() {
    return [...services].sort((a, b) => a.name.localeCompare(b.name));
}

export function findService(id: string) {
    return services.find((s) => s.id === id) || null;
}

export function createService(data: { name: string; description: string | null; duration: number; price: number | null }): Service {
    const service: Service = {
        id: generateId(),
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
    };
    services.push(service);
    return service;
}

export function deleteService(id: string): boolean {
    const index = services.findIndex((s) => s.id === id);
    if (index === -1) return false;
    services.splice(index, 1);
    return true;
}

export function updateService(id: string, data: { name?: string; description?: string | null; duration?: number; price?: number | null }): Service | null {
    const service = services.find((s) => s.id === id);
    if (!service) return null;
    if (data.name !== undefined) service.name = data.name;
    if (data.description !== undefined) service.description = data.description;
    if (data.duration !== undefined) service.duration = data.duration;
    if (data.price !== undefined) service.price = data.price;
    return service;
}

export function getSlots(dateQuery?: string | null) {
    let filtered = timeSlots.filter((s) => s.isAvailable);

    if (dateQuery) {
        const startOfDay = new Date(dateQuery);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(dateQuery);
        endOfDay.setUTCHours(23, 59, 59, 999);

        filtered = filtered.filter(
            (s) => s.startTime >= startOfDay && s.startTime <= endOfDay
        );
    }

    return filtered.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

export function findSlot(id: string) {
    return timeSlots.find((s) => s.id === id) || null;
}

export function createSlot(startTime: Date, endTime: Date, isAvailable: boolean): TimeSlot {
    const slot: TimeSlot = { id: generateId(), startTime, endTime, isAvailable };
    timeSlots.push(slot);
    return slot;
}

export function findUser(email: string) {
    return users.find((u) => u.email === email) || null;
}

export function createUser(data: { name: string; email: string; password: string; role?: 'USER' | 'ADMIN' }): User {
    const user: User = {
        id: generateId(),
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'USER',
    };
    users.push(user);
    return user;
}

export function getAppointments(userId?: string) {
    // Auto-complete past appointments
    const now = new Date();
    appointments.forEach((a) => {
        if (a.status === 'CONFIRMED') {
            const slot = findSlot(a.timeSlotId);
            if (slot && slot.endTime < now) {
                a.status = 'COMPLETED';
                a.updatedAt = new Date();
            }
        }
    });

    let filtered = userId
        ? appointments.filter((a) => a.userId === userId)
        : [...appointments];

    return filtered
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((a) => ({
            ...a,
            service: findService(a.serviceId),
            timeSlot: findSlot(a.timeSlotId),
            user: (() => {
                const u = users.find((u) => u.id === a.userId);
                return u ? { name: u.name, email: u.email } : null;
            })(),
        }));
}

export function findAppointment(id: string) {
    return appointments.find((a) => a.id === id) || null;
}

export function createAppointment(data: { userId: string; serviceId: string; timeSlotId: string }): Appointment {
    const appointment: Appointment = {
        id: generateId(),
        userId: data.userId,
        serviceId: data.serviceId,
        timeSlotId: data.timeSlotId,
        status: 'CONFIRMED',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    appointments.push(appointment);

    // Mark slot as unavailable
    const slot = findSlot(data.timeSlotId);
    if (slot) slot.isAvailable = false;

    return appointment;
}

export function cancelAppointment(id: string): boolean {
    const appointment = findAppointment(id);
    if (!appointment) return false;

    appointment.status = 'CANCELLED';
    appointment.updatedAt = new Date();

    // Free up the time slot
    const slot = findSlot(appointment.timeSlotId);
    if (slot) slot.isAvailable = true;

    return true;
}

export function hasOverlappingAppointment(startTime: Date, endTime: Date): boolean {
    return appointments.some((a) => {
        if (a.status !== 'CONFIRMED') return false;
        const slot = findSlot(a.timeSlotId);
        if (!slot) return false;

        return (
            (slot.startTime <= startTime && slot.endTime > startTime) ||
            (slot.startTime < endTime && slot.endTime >= endTime) ||
            (slot.startTime >= startTime && slot.endTime <= endTime)
        );
    });
}
