# TPA Nurul Iman Baltic Website

A fullstack student registration and management system for TPA Nurul Iman Baltic.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS

## Getting Started

1. **Environment Setup:**
   Copy `.env.example` (or similar) to `.env` and fill in your Supabase credentials.
   ```env
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   NEXT_PUBLIC_SUPABASE_URL="https://..."
   NEXT_PUBLIC_SUPABASE_ANON_KEY="ey..."
   ```

2. **Database Setup:**
   ```bash
   npx prisma db push
   npx prisma db seed # Seeds roles (admin, teacher, student)
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

## Roles
- **Admin:** Manage students (CRUD).
- **Teacher:** Input and manage student scores.
- **Student:** Register and view own scores.

## Project Structure
- `src/app`: Application routes and pages.
- `src/components`: Reusable UI components.
- `src/lib`: Utilities and database clients (Prisma, Supabase).
- `prisma`: Database schema and seeds.
