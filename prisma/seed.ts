import { PrismaClient } from '@prisma/client';
import { addDays, set } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing old data...');
    await prisma.appointment.deleteMany();
    await prisma.timeSlot.deleteMany();
    await prisma.service.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    console.log('Creating services...');
    const dental = await prisma.service.create({
        data: {
            name: 'Dental Consultation',
            description: 'Teeth cleaning, checkups, whitening.',
            duration: 45,
            price: 150.0,
        },
    });

    const tutoring = await prisma.service.create({
        data: {
            name: 'Academic Tutoring',
            description: 'Math, Science, Languages - e.g., 1 Hour SAT Prep.',
            duration: 60,
            price: 50.0,
        },
    });

    const inspection = await prisma.service.create({
        data: {
            name: 'Plumbing/Electrical Inspection',
            description: 'Diagnostics, repair estimates.',
            duration: 90,
            price: 100.0,
        },
    });

    const photography = await prisma.service.create({
        data: {
            name: 'Photography Session',
            description: 'Family portraits, professional headshots, event consultation.',
            duration: 120,
            price: 250.0,
        },
    });

    const meetingRoom = await prisma.service.create({
        data: {
            name: 'Meeting Room Booking',
            description: 'Reserving conference rooms in a shared office space.',
            duration: 60,
            price: 75.0,
        },
    });

    console.log('Creating time slots...');
    const now = new Date();

    // Create slots for the next 7 days
    for (let i = 0; i < 7; i++) {
        const day = addDays(now, i);

        // Create slots at 10 AM, 1 PM, and 4 PM
        for (const hour of [10, 13, 16]) {
            const startTime = set(day, { hours: hour, minutes: 0, seconds: 0, milliseconds: 0 });
            const endTime = set(day, { hours: hour + 1, minutes: 0, seconds: 0, milliseconds: 0 });

            await prisma.timeSlot.create({
                data: {
                    startTime,
                    endTime,
                    isAvailable: true,
                },
            });
        }
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
