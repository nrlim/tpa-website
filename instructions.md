# AI PROJECT INSTRUCTIONS

## ROLE
You are a **Senior Fullstack Engineer and UI/UX Designer** with expertise in:
- Next.js (App Router, Fullstack)
- Supabase (Auth & PostgreSQL)
- Prisma ORM
- Modern UI/UX (Landing Page & Dashboard Design)

---

## PROJECT OVERVIEW
Build a **fullstack student registration website** for:

**TPA Nurul Iman Baltic**

The website should follow a **single-page / landing page style** while still supporting full application features with authentication and dashboards.

---

## TECH STACK (MANDATORY)
- Next.js (Fullstack)
- PostgreSQL (via Supabase)
- Supabase Auth
- Prisma ORM
- Tailwind CSS or modern UI library (shadcn/ui recommended)

---

## DOCUMENTATION RULE (VERY IMPORTANT)
- **EXCLUDE ALL DOCUMENTATION FILES**
- ❌ No technical docs
- ❌ No architecture docs
- ❌ No API docs
- ❌ No comments-as-docs

### ONLY ALLOWED:
- ✅ `README.md`
- README must contain **ONLY a high-level overview**
- Keep README **short, non-detailed, and simple**
- Do NOT explain implementation details

---

## USER ROLES (RBAC)
Implement **Role-Based Access Control** with 3 roles:
1. Admin
2. Teacher
3. Student

---

## FEATURES

### PUBLIC / LANDING PAGE
- One-page layout (landing style)
- Hero section with **banner slider / carousel**
- School branding & introduction
- Call-to-action for student registration
- Clean, modern, Islamic-friendly UI
- Fully responsive

---

### STUDENT REGISTRATION
- Public registration form
- Fields:
  - Full Name
  - Date of Birth
  - Parent/Guardian Name
  - Address
  - Phone Number
  - Email
- Save to PostgreSQL using Prisma
- Auto-assign role: **Student**

---

### AUTHENTICATION
- Supabase Auth
- Role-based route protection
- Middleware enforcement

---

### ADMIN DASHBOARD
- View all students
- Full CRUD:
  - Create
  - Read
  - Update
  - Delete
- Manage student data
- Clean table UI with pagination & search

---

### TEACHER DASHBOARD
- View assigned students
- Input scores for:
  - Reading (Iqro / Al-Qur’an)
  - Memorization (Hafalan)
  - Discipline
  - Attendance
  - Behavior
- Automatically calculate **Final Score**
- Ability to edit scores

---

### STUDENT DASHBOARD
- View own profile
- View scores and final score (read-only)

---

## DATABASE DESIGN
- Use Prisma schema
- Tables:
  - Users
  - Students
  - Teachers
  - Scores
  - Roles
- Clear relational structure
- PostgreSQL via Supabase

---

## UI / UX REQUIREMENTS
- Clean, modern, and professional
- Good spacing, typography, and color consistency
- Intuitive navigation
- Smooth transitions and loading states
- Optimized for usability and clarity

---

## DEVELOPMENT RULES
- Use Server Actions or API Routes properly
- Validate input (client & server)
- Secure data access
- Clean folder structure
- Production-ready code

---

## OUTPUT EXPECTATION
- Fully working Next.js project
- Prisma schema included
- Supabase integration ready
- Minimal README.md (overview only)
- **No extra documentation files**
