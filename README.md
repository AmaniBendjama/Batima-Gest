# 🏢 Batima-Gest — Condominium Management Platform

> A full-stack web application for managing residential condominiums (copropriétés). Batima-Gest centralises fault reports, common area reservations, internal messaging, expense tracking, and document management for residents and property management staff.

**Live Demo:** [https://batima-gest-theta.vercel.app](https://batima-gest-theta.vercel.app)
**GitHub Repository:** [https://github.com/your-username/batima-gest](https://github.com/your-username/batima-gest)

---

## 📋 Table of Contents

1. [Theme Mapping](#-theme-mapping)
2. [Architecture Analysis](#-architecture-analysis)
3. [Features](#-features)
4. [Tech Stack](#-tech-stack)
5. [Database Schema & RLS](#-database-schema--rls)
6. [Setup Instructions](#-setup-instructions)
7. [Test Credentials](#-test-credentials)

---

## 🗂 Theme Mapping

**Theme #7 — Condominium ("Batima-Gest")**

| Assignment Table | Implementation | Description |
|---|---|---|
| **Table A — Users** | `profiles` (via Supabase Auth) | Condominium residents. Each profile links to `auth.users` and includes a `role` column (`resident` \| `admin`) and an apartment number. |
| **Table B — Resources** | `common_areas` | The shared physical spaces of the building: elevator, garden, party room, parking, hallway, gym, pool. These are the browsable elements linked to fault reports. |
| **Table C — Interactions** | `requests` (fault reports) | A resident reports a fault or problem on a common area. Links a **User (A)** to a **Common Area (B)** with a description, status, and date. This is the required join table from the assignment spec. |
| **File (Storage)** | `request-photos` (Supabase Storage bucket) | Photo of the problem uploaded by the resident when submitting a fault report (e.g. a photo of a broken elevator). JPG/PNG format, linked to the corresponding Table C row. |

> **Note:** The application includes additional features (reservations, messaging, documents, expenses) that enrich the user experience but do not alter the structure of the 3 tables required by the assignment.

---

## 🏗 Architecture Analysis

### 1. Why is Vercel + Supabase financially more logical than a traditional server?

Deploying on a traditional physical server requires significant **CAPEX** (Capital Expenditure): purchasing machines, rack units, cooling systems, and software licences — all before a single line of code runs in production. These assets depreciate over time and tie up capital with no guarantee of return.

Batima-Gest runs on a fully managed cloud stack that converts this model into **OPEX** (Operational Expenditure): Vercel and Supabase are both billed monthly on consumption, with no upfront commitment. For a project at launch stage with unpredictable traffic, this is financially rational — the starting cost is zero, and expenses scale proportionally to actual usage rather than worst-case capacity estimates.

### 2. How does Vercel handle scalability compared to a physical data centre?

A physical data centre has a hard capacity ceiling: when traffic exceeds what the provisioned racks can handle, the only solution is to procure and install additional hardware — a process that can take weeks. It also carries constant overhead regardless of load: electricity for the rack servers, continuous cooling (climatisation), and on-site maintenance staff.

Vercel deploys the application as **serverless functions** distributed across a global CDN. Scaling is automatic and near-instantaneous: a traffic spike triggers new function instances in milliseconds, not procurement cycles. There are no racks to manage, no cooling costs to absorb, and no idle servers billing at 3 AM. Supabase applies the same model for PostgreSQL, transparently handling backups, replication, and connection pooling.

### 3. What is structured vs. unstructured data in Batima-Gest?

**Structured data** lives in Supabase's PostgreSQL database: resident profiles, common area definitions, fault reports, reservations, expenses, and messages. Every table has a defined schema, typed columns, and foreign key relationships — all queryable with SQL and secured by Row Level Security policies enforced at the database level.

**Unstructured data** is stored in Supabase Storage: fault report photos uploaded by residents (JPG/PNG) and PDF documents (meeting minutes, building regulations, invoices). These files are binary blobs with no internal schema, referenced only by URL from the structured tables.

---

## ✨ Features

### Core User Flow (per assignment spec)

```
Sign Up / Log In  →  Browse Common Areas (Table B)
        ↓
Submit Fault Report + Upload Photo (Table C + Storage)
        ↓
Personal Dashboard (report history, statuses)
```

### Full Module Overview

| Module | Resident | Admin |
|---|---|---|
| **Dashboard** | Active reports, upcoming reservations, recent news | Full overview: open tickets, expenses, recent activity |
| **News** | Read building announcements | Post, edit, delete announcements |
| **Expenses** | View own charges and invoices | Manage all shared costs, upload PDF invoices |
| **Requests** *(Table C)* | Submit fault report with photo, track status | View all reports, update status, respond to residents |
| **Reservations** | Book a common area, manage own bookings | Approve or reject reservation requests |
| **Messages** | Send/receive messages with management | Communicate with any resident |
| **Docs** | Download legal documents and meeting minutes | Upload and organise building files |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + Vite |
| **Backend / Database** | Supabase — PostgreSQL + Auth + Storage |
| **Hosting & CI/CD** | Vercel (auto-deploy on every `git push` to `main`) |
| **Development Style** | VIBE Coding — rapid AI-assisted prototyping |

---

## 🗄 Database Schema & RLS

### Core Tables

```sql
-- Table A: Users (extends Supabase Auth)
profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users,
  full_name   text,
  role        text CHECK (role IN ('resident', 'admin')),
  unit_number text,
  created_at  timestamptz DEFAULT now()
)

-- Table B: Resources (Common Areas)
common_areas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,   -- e.g. 'Elevator', 'Party Room'
  description text,
  capacity    int,
  created_at  timestamptz DEFAULT now()
)

-- Table C: Interactions (Fault Reports)
requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id),      -- → Table A
  area_id     uuid REFERENCES common_areas(id),  -- → Table B
  description text NOT NULL,
  photo_url   text,            -- Supabase Storage URL (required file)
  status      text DEFAULT 'open'
              CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at  timestamptz DEFAULT now()
)
```

### Row Level Security (RLS) — Eliminatory Criterion

RLS is enabled on all tables. Core policies on the `requests` table:

```sql
-- Residents can only see their OWN fault reports
CREATE POLICY "resident_own_requests" ON requests
FOR ALL USING (user_id = auth.uid());

-- Admins can see and edit EVERYTHING
CREATE POLICY "admin_full_access" ON requests
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

The `request-photos` Storage bucket enforces equivalent policies: only the file owner or an admin can access uploaded photos.

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/batima-gest.git
cd batima-gest
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Initialise the Database

Run `supabase/migrations/init.sql` in the Supabase SQL Editor. This script creates all 3 tables, inserts seed data for common areas, and applies all RLS policies.

### 4. Configure Storage

In the Supabase dashboard, create the bucket:
- `request-photos` — public read, authenticated write

### 5. Run Locally

```bash
npm run dev
# Available at http://localhost:3000
```

---

## ⚡ Development — React + Vite

This project uses the official **React + Vite** template with HMR and ESLint pre-configured. Two transform plugins are available:

| Plugin | Engine | Best for |
|---|---|---|
| `@vitejs/plugin-react` | [Oxc](https://oxc.rs) | Default, fast cold starts |
| `@vitejs/plugin-react-swc` | [SWC](https://swc.rs/) | Faster refresh on larger codebases |

The **React Compiler** is not enabled by default due to its impact on build performance. To opt in, see the [official installation guide](https://react.dev/learn/react-compiler/installation).

For production, consider migrating to the [TypeScript template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) and enabling [`typescript-eslint`](https://typescript-eslint.io).

---

## 🔐 Test Credentials

| Role | Email | Password |
|---|---|---|
| **Resident** | test1234@gmail.com | testtest |
| **Admin** | admin@gmail.com | adminpass |

> The resident account is pre-assigned to apartment **4B** with sample fault reports, reservations, and expenses. The admin account has full access to all building data.
