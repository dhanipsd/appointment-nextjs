# Next.js Full Stack Appointment System Template

A production-ready generic appointment booking template built with the modern Next.js App Router, Prisma, PostgreSQL, NextAuth, and Tailwind CSS. It is perfect as a boilerplate for building robust SaaS products or custom booking apps for clients.

## 🚀 Features
- **Next.js 15 App Router** for Server Components and optimal performance.
- **PostgreSQL Database** connected via **Prisma ORM**.
- **NextAuth.js** built-in for JWT-based Credential Authentication (Register/Login).
- **Dynamic Calendar & Time Booking** using custom UI and `react-datepicker`.
- **Conflict Prevention** checking logic to ensure no double bookings occur.
- **Role-based Access Control** (`ADMIN` vs `USER` user dashboard views).
- **Docker Compose** file included for an instant local database.
- **Tailwind CSS** for highly responsive, aesthetic, and customizable designs.

## 🛠️ Tech Stack
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS & Lucide React (Icons)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js (Credentials Provider)
- **Authentication Security:** bcryptjs
- **Date Utilities:** date-fns

---

## 💻 Getting Started

### 1. Clone & Install
Clone the repository and install the dependencies:
```bash
git clone https://github.com/your-username/your-appointment-template.git
cd your-appointment-template
npm install
```

### 2. Set up Environment Variables
Copy the example environment file and update the secrets.
```bash
cp .env.example .env
```
Ensure you set a secure random string for `NEXTAUTH_SECRET` if moving to production.

### 3. Start Database (Docker)
The template includes a `docker-compose.yml` to spin up a local PostgreSQL instance instantly on port 5432.
```bash
docker-compose up -d
```
*(If you are using a managed database like Supabase or Vercel Postgres, skip this step and just update your `.env` `DATABASE_URL`)*.

### 4. Initialize Database Schema
Push the Prisma schema to your newly created database and seed it with dummy services (e.g., Dental, Photography, Tutoring).
```bash
npx prisma db push
npm run seed
```

### 5. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🔧 Core Concepts & Customization

### Testing as an Admin
For local testing and demonstrating the Admin Dashboard view, any account registered with the email `admin@example.com` is automatically granted the `ADMIN` role. 

*Note: You should remove or change this logic in `src/app/api/register/route.ts` before launching a real product!*

### Managing Services
The default services are seeded from `prisma/seed.ts`. To change the services offered when starting the application, simply update the array of `.create()` calls in that seed file before running `npm run seed`. 

*Next Steps for Growth:* Build a small Admin UI to create, update, and delete these services directly from the dashboard!

## 🔐 Deployment
This template is optimized to be deployed seamlessly on **Vercel** or **Railway**. 
1. Provision a PostgreSQL Database.
2. Update your `DATABASE_URL` in your deployment's environment variables.
3. Set your production `NEXTAUTH_URL` and `NEXTAUTH_SECRET`.
4. Deploy!
