import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const services = await prisma.service.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl tracking-tight">
          Book your <span className="text-indigo-600">appointment</span>
        </h1>
        <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
          Choose from our premier services and secure your time slot instantly.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {services.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            No services available at the moment.
          </div>
        ) : (
          services.map((service: any) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all duration-300 border border-gray-100 flex flex-col h-full group"
            >
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {service.name}
              </h3>
              <p className="text-gray-500 mt-2 flex-grow">{service.description}</p>

              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
                <div>
                  <p className="text-sm text-gray-400 font-medium">Duration</p>
                  <p className="font-semibold text-gray-900">{service.duration} mins</p>
                </div>
                {service.price && (
                  <div className="text-right">
                    <p className="text-sm text-gray-400 font-medium">Price</p>
                    <p className="font-semibold text-gray-900">${service.price}</p>
                  </div>
                )}
              </div>

              <Link
                href={`/book?service=${service.id}`}
                className="mt-6 block w-full text-center bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-3 rounded-xl font-semibold transition-colors duration-200"
              >
                Book Now
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
