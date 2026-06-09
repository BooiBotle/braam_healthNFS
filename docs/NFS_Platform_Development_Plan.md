# Platform Development Plan
## Three-Phase Delivery Roadmap (28 Days)

---

## Document Metadata
- **Company:** CoreTech Holdings
- **Client:** NFS Insure & Braam Health Centre
- **Document Version:** 1.0
- **Date:** May 2026
- **Classification:** Confidential Development Document
- **Project Structure:** 3 Phases | 14 Milestones | 89-98 Tasks | 28 Days Delivery
- **Technology Stack:** Supabase (PostgreSQL) + React 18 + Vite + TypeScript

---

## 1. Project Overview

### 1.1 Executive Summary
This document defines the complete development roadmap for the NFS Insure Braam Health Centre platform [cite: 299]. The system is a multi-portal healthcare membership platform with three distinct interfaces—a Member Portal, a Staff Portal, and an Admin Portal—powered by a 30-table Supabase PostgreSQL backend and built on React + Vite [cite: 300]. The project is structured into three strategic phases, each delivered in 7-10 days, progressively building, expanding, and hardening the platform to production quality [cite: 301].

#### Technology Stack Breakdown:
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS, Edge Functions) [cite: 304]
- **Frontend:** React 18+ Vite + TypeScript [cite: 306]
- **Auth:** Supabase Auth with Role-Based Access Control (RBAC): `member` / `staff` / `admin` / `super_admin` [cite: 311]
- **Payments:** Yoco (online card processing), NAEDO/DebiCheck (debit orders) [cite: 312]
- **Communications:** WhatsApp Business API, SMS OTP gateways, Email (SMTP/SendGrid) [cite: 313]
- **Exports/Reporting:** CSV, PDF, XLSX formats [cite: 314]

---

### 1.2 Platform Scope

| Portal | Primary Function |
| :--- | :--- |
| **Member Portal** | Self-service framework for healthcare members: onboarding wizard, KYC document upload, digital membership card, appointment booking, plan management, payment history, and dependant management [cite: 316]. |
| **Staff Portal** | Clinical operations layer: member lookup, consultation logging, medication dispensing, appointment management, and a live "today's clinic" dashboard [cite: 316]. |
| **Admin Portal** | Business intelligence hub: full member management, application approvals, KYC queues, debit orders, 7 report types, integrations hub, audit logs, and a cross-sell pipeline [cite: 316]. |

---

### 1.3 Database at a Glance
The Supabase schema (v1.0, 24 May 2026) defines 30 tables across 12 functional domains [cite: 318]:

| Domain | Target PostgreSQL Tables |
| :--- | :--- |
| **Config & Lookup** | `clinics`, `plans` [cite: 324] |
| **Identity & Auth** | `profiles`, `members`, `dependants` [cite: 324] |
| **Onboarding** | `applications`, `onboarding_steps` [cite: 324] |
| **KYC & Compliance** | `kyc_documents`, `popia_consents`, `popia_consent_purposes` [cite: 324] |
| **Cards** | `member_cards` [cite: 324] |
| **Payments** | `debit_mandates`, `debit_orders`, `reconciliation_batches`, `payments` [cite: 324] |
| **Clinical** | `appointments`, `consultations`, `medications`, `medication_dispenses` [cite: 324] |
| **Plan Management** | `plan_changes`, `agreement_templates`, `signed_agreements` [cite: 324] |
| **Security Layer** | `step_up_requests` [cite: 324] |
| **Notifications** | `notifications` [cite: 324] |
| **Admin / BI** | `audit_log`, `cross_sell_pipeline`, `integrations`, `report_exports`, `statement_requests` [cite: 324] |
| **Caching Engine** | `peak_hours_cache` [cite: 324] |

---

### 1.4 Development Team Allocation

| Badge / Role | Developer | Primary Responsibilities |
| :--- | :--- | :--- |
| **Soso** | Soso Kwani | Supabase schema deployment, RLS policies, Edge Functions, Supabase Auth + RBAC setup, payments gateway integrations, step-up authentication engineering, security audit, API layers, and the notification engine [cite: 326]. |
| **Bontle** | Bontle Booi | React + Vite architecture scaffolding, all portal user interfaces (Member, Staff, Admin), structural component design system, reporting dashboards, UI polish, accessibility frameworks, production deployment, and handover documentation [cite: 326]. |
| **Both** | Co-ownership | End-to-end QA testing, integration cross-checks, cross-portal data consistency validation, bug triage workflows, production smoke tests, and final stakeholder sign-off [cite: 326]. |

---

### 1.5 Master Timeline

| # | Phase Name | Strategic Core Focus | Timeline | Milestones | Total Tasks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Phase 1 | Foundation & Auth (Backend, authentication, Member Portal) | Days 1-9 [cite: 328] | 4 [cite: 328] | 28 tasks [cite: 328] |
| **2** | Phase 2 | Feature Build-Out (Staff, Admin, payments, clinical engines) | Days 10-19 [cite: 328] | 5 [cite: 328] | 39 tasks [cite: 328] |
| **3** | Phase 3 | Integration, Polish & QA (Comms, security hardening, deploy) | Days 20-28 [cite: 328] | 5 [cite: 328] | 31 tasks [cite: 328] |
| **Total** | | | **28 Days** | **14** | **98 Tasks** [cite: 328] |

---

## 2. Phase 1 - Foundation & Core Auth (Days 1-9)
**Objective:** Stand up the entire Supabase backend, implement authentication with full RBAC, and deliver a working Member Portal with onboarding, KYC submission, and a digital membership card framework [cite: 337]. By the end of Phase 1, a member can register, onboard, upload KYC documents, and view their digital membership card [cite: 338].

### 2.1 Milestone 1 - Data Modelling & Security Layer (Deadline: Day 3 | Lead: Soso)
- **Strategic Mission Brief:** Deploy the complete Supabase schema (all 30 tables, enums, indexes, triggers) [cite: 345]. Configure Row-Level Security (RLS) policies for all four portal roles [cite: 346]. Set up Supabase Storage buckets for KYC documents, membership cards, and avatars [cite: 347]. Seed clinics and plans tables with Braam Health Centre data, then verify the React + Vite frontend API connection [cite: 348].
- **Task 1.1: Initialise Supabase Project & Environment (Day 1 | Soso):** Create the Supabase project, configure environment variables in the Vite project, and initialise the `supabase-js` client [cite: 352]. Confirm the frontend-to-backend connection is healthy [cite: 353].
- **Task 1.2: Deploy Full Database Schema (Day 1 | Soso):** Run the complete `schema.sql` (v1.0) in the Supabase SQL editor [cite: 357]. Verify all 30 tables, 25+ enums, indexes, `moddatetime` triggers, and Braam Health Centre seed data are created without errors [cite: 358].
- **Task 1.3: Implement Row-Level Security (RLS) Policies (Day 2 | Soso):** Enable RLS on all tables [cite: 362]. Write and test policies for member, staff, admin, and super_admin roles [cite: 362]. Members must see only their own records; staff are scoped to their clinic; admins have full clinic scope [cite: 363].
- **Task 1.4: Configure Supabase Storage Buckets (Day 2 | Soso):** Create three buckets: `kyc-documents` (private, RLS-gated), `member-cards` (private), and `avatars` (public) [cite: 369]. Apply storage policies so only authenticated users access their own files, while staff/admin access clinic-scoped files [cite: 370].
- **Task 1.5: React + Vite Project Scaffolding (Day 2 | Bontle):** Initialise the Vite React + TypeScript project [cite: 374]. Set up the folder structure (`pages/`, `components/`, `hooks/`, `lib/`, `types/`) [cite: 374]. Install `supabase-js`, `react-router-dom` v6, `@tanstack/react-query`, and a UI library (`shadcn/ui` or Chakra UI) [cite: 375].
- **Task 1.6: API Integration Smoke Test (Day 3 | Both):** Write a minimal test page that reads clinics and plans from the database [cite: 379]. Confirm RLS is active: unauthenticated requests must return empty rows for protected tables [cite: 380].
- **Task 1.7: Review & QA: Data Modelling & Security Layer (Day 3 | Both):** Cross-check all foreign key relationships, verify seed data accuracy, and test RLS with mock users of each role [cite: 384]. Document any schema gaps found [cite: 385].

### 2.2 Milestone 2 - Authentication & RBAC (Deadline: Day 5 | Lead: Soso)
- **Strategic Mission Brief:** Implement the full authentication flow using Supabase Auth [cite: 392]. Members self-register; staff and admin are provisioned by a `super_admin` role [cite: 392]. Build role-based routing so the correct portal loads for each role [cite: 393]. Implement step-up authentication challenges for sensitive actions [cite: 394].
- **Task 2.1: Member Registration Flow (Day 3 | Soso):** Build the member self-registration form (email, phone, SA ID, plan selection) [cite: 398]. On signup, create the `auth.users` record and auto-create a `profiles` row with a `portal_role` of `member`. Trigger email OTP verification [cite: 399].
- **Task 2.2: Login & Session Management (Day 4 | Soso):** Implement the login page (email + password) [cite: 406]. Integrate Supabase session persistence [cite: 406]. Build the `AuthContext` / `useAuth` hook exposing user, role, and session state across the entire app [cite: 407].
- **Task 2.3: Role-Based Routing & Protected Routes (Day 4 | Bontle):** Implement React Router v6 protected route wrappers that read `portal_role` [cite: 411]. Redirect members to the Member Portal, staff to the Staff Portal, and admins to the Admin Portal [cite: 412]. Block cross-role access with a styled 403 page [cite: 413].
- **Task 2.4: Staff & Admin Account Provisioning (Day 4 | Soso):** Build the `super_admin` user-creation interface: invite staff/admin by email, assign `portal_role`, and link to a specific `clinic_id` [cite: 417]. Staff accounts cannot self-register—they must be provisioned manually [cite: 418].
- **Task 2.5: Step-Up Authentication (Day 5 | Soso):** Implement the `step_up_requests` flow for sensitive actions [cite: 422]. The user receives an OTP via SMS or email, submits it, and a `step_up_requests` record is created with a `verified` status (valid for exactly 10 minutes) [cite: 422]. Enforce this gate on all protected actions [cite: 423].
- **Task 2.6: Password Reset & Email Verification (Day 5 | Soso):** Implement the Supabase magic link password reset flow [cite: 427]. Email confirmation must be completed before a member can access any portal content [cite: 427].
- **Task 2.7: Review & QA: Authentication & RBAC (Day 5 | Both):** End-to-end test: register a member, verify email, log in, confirm role routing, test step-up OTP, and test password resets [cite: 433]. Confirm staff and admin routes are completely inaccessible to member-role accounts [cite: 434].

### 2.3 Milestone 3 - Member Portal: Onboarding & Profile (Deadline: Day 7 | Lead: Bontle)
- **Strategic Mission Brief:** Build the full Member Portal UI: the post-registration multi-step onboarding wizard (tracking progress in `onboarding_steps`), profile and account settings, dependant management (capped by plan's `max_members`), POPIA consent centre, and plan overview with benefits breakdown [cite: 441, 445].
- **Task 3.1: Member Dashboard Layout & Shell (Day 6 | Bontle):** Design and build the Member Portal shell: sidebar navigation, header with member name and plan badge, and KPI cards (plan, membership status, consultations remaining) [cite: 449]. Fully responsive for mobile (360px+) and desktop viewports [cite: 450].
- **Task 3.2: Multi-Step Onboarding Wizard (Day 6 | Bontle):** Build the onboarding flow tracked in `onboarding_steps`: (1) Personal details, (2) Banking details, (3) POPIA consent, (4) Debit mandate signature, and (5) KYC document upload [cite: 454]. Show a progress bar and allow resuming an incomplete wizard on the next login [cite: 455].
- **Task 3.3: POPIA Consent Centre (Day 6 | Soso):** Build the POPIA consent page listing all `consent_purpose` types [cite: 459]. Members grant or withdraw consent per purpose and per channel [cite: 459]. Record each consent event in `popia_consents` and `popia_consent_purposes` with a timestamp and schema version [cite: 460].
- **Task 3.4: Profile & Account Settings Page (Day 7 | Bontle):** Allow members to view and update personal details (name, phone, address) [cite: 464]. Changes to banking details must trigger a step-up authentication challenge [cite: 464]. Display the membership card number, plan type, and status prominently [cite: 465].
- **Task 3.5: Dependant Management (Day 7 | Bontle):** Allow members on eligible plans (couple, family, family+, corporate) to add and remove dependants [cite: 469]. Validate counts against `plans.max_members` [cite: 469]. Store each dependant record in the `dependants` table with relationship types [cite: 470].
- **Task 3.6: Plan Overview & Benefits Page (Day 7 | Bontle):** Display current plan details: monthly fee, consultations per month (remaining vs. total), and included benefits (medication, 24h access, chronic programme) [cite: 474]. Show potential upgrade options to higher-tier plans [cite: 475].
- **Task 3.7: Review & QA: Onboarding & Profile (Day 7 | Both):** Test the full onboarding wizard end-to-end [cite: 479]. Verify POPIA consent is recorded correctly [cite: 479]. Test dependant addition/removal with plan limits enforced [cite: 479]. Check full mobile responsiveness across standard breakpoints [cite: 480].

### 2.4 Milestone 4 - Member Portal: KYC & Membership Card (Deadline: Day 9 | Lead: Both)
- **Strategic Mission Brief:** Build the KYC document upload flow with a step-up auth gate, a KYC status tracker showing per-document states, and the digital membership card component [cite: 490]. Implement the card number generation logic and add basic appointment booking to round out the Member Portal for Phase 1 [cite: 491].
- **Task 4.1: KYC Document Upload Interface (Day 8 | Soso):** Build the upload component supporting all required document types: SA ID, proof of address, payslip, bank statement, and passport [cite: 495]. Files go directly to the private `kyc-documents` Supabase bucket, enforcing step-up auth before any upload [cite: 496]. Record each item in `kyc_documents` with a status of `pending_review` [cite: 497].
- **Task 4.2: KYC Status Tracker (Day 8 | Bontle):** Display the member's overall `kyc_status` from `members` and per-document status from `kyc_documents` [cite: 501]. For rejected documents, show the rejection reason inline and allow instant re-upload [cite: 502]. Show a clear progress indicator (not submitted / under review / approved / rejected) [cite: 503].
- **Task 4.3: Digital Membership Card Component (Day 8 | Bontle):** Design and build the membership card UI: member full name, card number (`NFS8 XXXX XXXX X` format), plan name, clinic name, and member-since date [cite: 507]. Support a "Save as PDF" action and source data from `member_cards` and `members` tables [cite: 508].
- **Task 4.4: Membership Card Number Generation Logic (Day 9 | Soso):** Implement the Supabase database function / database trigger that auto-creates a `member_cards` record and assigns a unique `NFS8`-format card number the instant an application is approved [cite: 512]. Ensure uniqueness is strictly enforced at the database level [cite: 513].
- **Task 4.5: Appointment Booking Framework (Day 9 | Bontle):** Add basic appointment booking: select date, time, and appointment type (walk-in, appointment, chronic review) [cite: 517]. Store entries in `appointments` with a default status of `pending` [cite: 517]. Members can view upcoming and past appointments [cite: 518].
- **Task 4.6: Phase 1 End-to-End Integration Test (Day 9 | Both):** Execute a full platform smoke test: register -> verify email -> onboarding wizard -> upload KYC -> view membership card -> book appointment [cite: 521, 526]. Run with a simulated admin approval trigger to document bugs [cite: 527].
- **Task 4.7: Review & QA: KYC & Membership Card (Day 9 | Both):** Test KYC uploads for all document types and verify step-up auth is enforced [cite: 531]. Test card displays with real data and confirm appointment records write correctly to the `appointments` table [cite: 531, 532].

---

## 3. Phase 2 - Feature Build-Out (Days 10-19)
**Objective:** Build out the Staff Portal and Admin Portal in full, implement the core payments pipeline (Yoco card checkouts + automated debit orders), complete the clinical operations module (consultations, medications dispensing), and deliver the full KYC approval queue and 7-report analytical suite [cite: 534]. By the end of Phase 2, all three portals are feature-complete and integrated [cite: 535].

### 3.1 Milestone 5 - Staff Portal: Core Operations (Deadline: Day 12 | Lead: Bontle)
- **Strategic Mission Brief:** Build the Staff Portal for clinic staff: member search (fuzzy text + SA ID + card number), appointment management (confirm/complete/cancel), consultation logging with plan-limit enforcement, and medication dispensing [cite: 536]. Staff are scoped strictly to their `clinic_id` via RLS, and the UI must be optimized for mobile/tablet environments [cite: 537].
- **Task 5.1: Staff Portal Shell & Dashboard (Day 10 | Bontle):** Build the Staff Portal layout: navigation framework (Member Search, Appointments, Consultations, Medications), header with staff name and clinic name, and dashboard cards showing today’s appointment counts, walk-in queues, and consultations logged [cite: 538].
- **Task 5.2: Member Search & Lookup (Day 10 | Bontle):** Implement member search by full name (fuzzy text matching via `pg_trgm`), SA ID, card number, or phone number [cite: 539]. Display a member summary card: name, plan, status, KYC status, and consultation balance [cite: 540]. Show linked dependants inline [cite: 540].
- **Task 5.3: Appointment Management (Day 11 | Bontle):** Build the appointments list view for staff [cite: 541]. Staff can confirm, complete, cancel, or mark no-shows [cite: 542]. Allow staff to create walk-in appointments for any active member [cite: 542]. Update `appointments.status` and log to the `audit_log` [cite: 543].
- **Task 5.4: Consultation Logging Form (Day 11 | Soso):** Build the consultation logging form: select member/dependant, enter diagnosis codes, add clinical free-text notes, and select consultation type [cite: 543]. Decrement consultation counters [cite: 544]. Store records in `consultations` with `staff_id` and `clinic_id` [cite: 544]. Validate against `plans.consultations_pm` and block if the limit is exceeded [cite: 544].
- **Task 5.5: Medication Dispensing (Day 12 | Soso):** Implement medication dispensing: staff selects items from the `medications` master table, enters quantities, and links directly to the `consultation` record [cite: 545]. Create a `medication_dispenses` record [cite: 546]. Flag chronic medication cycles for members on the chronic programme [cite: 546].
- **Task 5.6: Staff Portal Dashboard Live Stats (Day 12 | Bontle):** Display today’s clinic statistics: total consultations logged, walk-ins vs. appointments, medications dispensed, and consultation limit alerts [cite: 547]. Query `consultations` and `medication_dispenses` scoped to the logged staff’s clinic and today's date [cite: 548].
- **Task 5.7: Review & QA: Staff Portal Operations (Day 12 | Both):** Test the full operational workflow: search member -> create appointment -> log consultation -> dispense medication [cite: 549]. Verify clinic-scoping RLS prevents staff from seeing other clinics’ data and verify limit enforcement rules [cite: 550].

### 3.2 Milestone 6 - Admin Portal: Member Management (Deadline: Day 14 | Lead: Bontle)
- **Strategic Mission Brief:** Build the core Admin Portal: member lists with advanced server-side filters and exports, full member detail views (profile data, timeline, and all linked historical objects), application approval workflows, status management controls, and the cross-sell pipeline Kanban board [cite: 551].
- **Task 6.1: Admin Portal Shell & Navigation (Day 13 | Bontle):** Build the Admin Portal layout: sidebar navigation (Members, Applications, Payments, KYC, Reports, Integrations, Audit Log), header with admin name, and top row KPI cards (active members, pending applications, KYC queue counts) [cite: 553].
- **Task 6.2: Member List with Advanced Filters (Day 13 | Bontle):** Implement the full member list with server-side pagination [cite: 554]. Filtering hooks: status, plan type, KYC status, member-since date ranges, and corporate membership flags [cite: 555]. Allow direct CSV/Excel exports and route row clicks to the detail pages [cite: 555, 556].
- **Task 6.3: Member Detail Deep View (Day 13 | Bontle):** Build the member detail page compiling personal info, active plans, generated cards, KYC states, linked dependants, payment histories, consultation histories, plan change logs, executed agreements, and an audit timeline [cite: 556]. Admins can edit member fields with changes logged to the `audit_log` [cite: 557].
- **Task 6.4: Application Approval Workflow (Day 14 | Soso):** Build the applications queue: list submitted applications with applicant snapshots and selected plans [cite: 558]. Admins can approve (creating the `members` record and triggering card numbers) or reject with a reason [cite: 558, 559]. Update `applications.status` and log to the `audit_log` [cite: 559].
- **Task 6.5: Member Status Management (Day 14 | Soso):** Allow admin operators to transition member status fields: activate, suspend, cancel, or mark deceased [cite: 560]. Each action requires confirmation dialog boxes, logging directly to the `audit_log` with actor ID, reasons, and timestamps [cite: 560, 561].
- **Task 6.6: Cross-Sell Pipeline Kanban Board (Day 14 | Bontle):** Build an interactive Kanban board over the `cross_sell_pipeline` table [cite: 562]. Columns map to: *Identified, Contacted, Proposal Sent, Converted, Not Interested* [cite: 563]. Admins can drag cards between stages and append custom follow-up notes per lead [cite: 563].
- **Task 6.7: Review & QA: Admin Member Management (Day 14 | Both):** Test application approvals end-to-end [cite: 564]. Verify member status changes create correct audit log entries [cite: 565]. Test cross-sell pipeline drag-and-drop state persistence and verify admin clinic scoping [cite: 565, 566].

### 3.3 Milestone 7 - Payments & Debit Order Pipeline (Deadline: Day 16 | Lead: Soso)
- **Strategic Mission Brief:** Implement the full payment pipeline: debit mandate capture with canvas-based e-signatures, debit order scheduling and status tracking, Yoco card payment integration, payment reconciliation batches, and the admin payments dashboard [cite: 567]. All payment events must log to `payments` and `debit_orders` [cite: 568].
- **Task 7.1: Debit Mandate Capture & E-Signature (Day 14 | Soso):** Build the debit mandate form into the onboarding wizard: capture bank name, account holder, account number, account type, and branch codes [cite: 568]. Implement a canvas-based e-signature pad [cite: 569]. Store the mandate in `debit_mandates` and upload the signature file to Supabase Storage [cite: 569].
- **Task 7.2: DebiCheck / NAEDO Integration Stub (Day 15 | Soso):** Create the integrations record for NAEDO/DebiCheck [cite: 570]. Build a Supabase Edge Function stub with correct payload structures [cite: 571]. Implement full UI management interfaces while marking live gateway calls as config-dependent for production activation [cite: 571, 572].
- **Task 7.3: Debit Order Scheduling & Status Tracking (Day 15 | Bontle):** Build the debit orders admin view: list all orders filtered by status (pending/success/failed/reversed), debit day, and date ranges [cite: 573]. Admins can manually retry failed orders, and all history is tracked in `debit_orders` [cite: 574].
- **Task 7.4: Yoco Card Payment Integration (Day 15 | Soso):** Integrate the Yoco payment gateway for once-off card payments (registration fees, manual top-ups) [cite: 575]. Build the payment checkout modal in the Member Portal [cite: 576]. On success, create a `payments` record (`payment_method = card`, `status = success`) [cite: 576]. Handle Yoco incoming webhooks via a Supabase Edge Function [cite: 577].
- **Task 7.5: Payment History & Member Statements (Day 16 | Bontle):** Build payment history views for members (own records only) and admins (all clinic payments) [cite: 577]. Display date, amount, method, and status [cite: 578]. Members can request statements (`statement_requests`), and admins can download full payment reports as PDF/CSV [cite: 578, 579].
- **Task 7.6: Reconciliation Batches (Day 16 | Soso):** Build the reconciliation batch viewer in the Admin Portal [cite: 580]. List `reconciliation_batches` with total amounts, matched counts, and unmatched counts [cite: 581]. Implement auto-match logic that aligns `debit_orders` to incoming payments by reference numbers [cite: 582]. Admin marks batches as reconciled [cite: 582].
- **Task 7.7: Review & QA: Payments Pipeline (Day 16 | Both):** Test debit mandate capture and test Yoco flow in sandbox modes [cite: 583]. Test debit order status tracking and verify reconciliation matching logic [cite: 584]. Confirm all payment events write correctly to `payments` and verify webhook endpoint retry behaviors [cite: 584, 585].

### 3.4 Milestone 8 - Clinical Module (Deadline: Day 17 | Lead: Soso)
- **Strategic Mission Brief:** Complete the clinical operations layer: consultation histories visible to members and admins, full medication registers, chronic medication programme tracking, and peak-hours analytics caching [cite: 585]. This milestone closes out the Staff Portal and enriches clinical data models [cite: 586].
- **Task 8.1: Member Consultation History (Day 17 | Bontle):** Display the member’s consultation history inside the Member Portal: date, consultation type, staff name (anonymised to first name), and notes (privacy-aware partial text display) [cite: 587]. Show consultations remaining this month vs. plan limits [cite: 588].
- **Task 8.2: Consultation Summary Report (Day 17 | Bontle):** Build the consultation summary report with filters: date range, consultation type, and plan type [cite: 588]. Show daily totals and type breakdowns, and export as CSV or PDF (corresponds to `report_type = consultation_summary`) [cite: 588, 589].
- **Task 8.3: Medication Register UI (Day 17 | Bontle):** Build the medication register: list all medications in the `medications` master table, recent dispenses from `medication_dispenses`, and dispense frequency by medication [cite: 590]. Admins can add new medications to the master list [cite: 591].
- **Task 8.4: Chronic Medication Programme Tracking (Day 17 | Soso):** For members on a chronic medication plan, track dispensing cycles in `medication_dispenses` [cite: 592]. Alert staff when a member’s chronic medication cycle is due, and display chronic programme status prominently on the member profile across all portals [cite: 593].
- **Task 8.5: Peak Hours Cache & Heatmap (Day 17 | Soso):** Implement a database / Edge Function that aggregates consultation timestamps into `peak_hours_cache` by hour of day and day of week [cite: 594]. Render an interactive heatmap in the Admin Portal dashboard to show clinic busyness patterns [cite: 595].

### 3.5 Milestone 9 - Admin Portal: KYC, Plans & Reporting (Deadline: Day 19 | Lead: Both)
- **Strategic Mission Brief:** Complete the Admin Portal with the KYC approval queue (inline document viewer), plan change management, signed agreements viewer, audit log, and the full 7-report suite [cite: 596]. Admins must be able to generate and export any report in CSV, PDF, or XLSX formats [cite: 597].
- **Task 9.1: KYC Approval Queue Interface (Day 18 | Bontle):** Build the KYC review interface: list members with `kyc_status = pending_review`, display uploaded documents inline from Supabase Storage buckets, and allow admin operators to approve or reject each document with clear reasons [cite: 598]. Updates `kyc_documents.status` and `members.kyc_status`, logging actions to the `audit_log` [cite: 599].
- **Task 9.2: Plan Change Requests Queue (Day 18 | Soso):** Build the plan change flow: members request plan changes from the Member Portal (populating the `plan_changes` table with status `pending`) [cite: 599]. Admins review and approve or reject [cite: 600]. On approval, update `members.plan_id` and write an execution trail to the `audit_log` [cite: 600].
- **Task 9.3: Agreement Templates & Signed Agreements Viewer (Day 18 | Bontle):** Build the agreement template manager (admins upload/edit `agreement_templates`) [cite: 601]. Members sign agreements during onboarding [cite: 602]. Admins can view all signed agreements per member with signature image rendering, timestamps, and template versions [cite: 602].
- **Task 9.4: Full Reporting Suite — 7 Report Types (Day 19 | Bontle):** Implement all `report_type` enum values: `member_list`, `consultation_summary`, `revenue_summary`, `kyc_status`, `plan_distribution`, `debit_order_performance`, `retention`, and `medication_register` [cite: 604]. Each report contains filter controls, a data preview table, and export buttons (`CSV` / `PDF` / `XLSX`), logging exports to `report_exports` [cite: 605, 606].
- **Task 9.5: Audit Log Viewer UI (Day 19 | Soso):** Build the audit log page: full searchable and filterable log interface reading from the `audit_log` table [cite: 606]. Filter by actor, action type, target table, and date ranges [cite: 607]. Read-only—no administrative role can delete audit records, serving as the immutable compliance paper trail [cite: 607, 608].
- **Task 9.6: Review & QA: Phase 2 Complete (Day 19 | Both):** Complete a full regression test of all three portals [cite: 608]. Verify data consistency between portals (e.g., staff logs a consultation -> member sees history update instantly) [cite: 609]. Test all 7 report exports and document bugs with severity ratings [cite: 609, 610].

---

## 4. Phase 3 - Integration, Polish & QA (Days 20-28)
**Objective:** Complete all third-party integrations (WhatsApp Business API, SMS OTP, email notifications), implement the full notification engine with Supabase Realtime subscriptions, conduct a comprehensive security and POPIA audit, execute final end-to-end QA across all three portals, fix all critical bugs, and deploy to production with formal stakeholder sign-off [cite: 611].

### 4.1 Milestone 10 - Notifications & Integrations (Deadline: Day 22 | Lead: Soso)
- **Strategic Mission Brief:** Activate the full notification engine: in-app notifications (Supabase Realtime), email (SMTP), SMS (OTP gateway), and WhatsApp (Business API) [cite: 612]. Implement notification preference centres for members and build the integrations status dashboard in the Admin Portal [cite: 613]. Activate the Google Wallet membership card pass [cite: 614].
- **Task 10.1: Notification Dispatch Engine via Edge Functions (Day 20 | Soso):** Build the notification Edge Functions: given a `notifications` record, route to the correct channel—email via SMTP/SendGrid, SMS via gateway, WhatsApp via Business API, or in-app via Supabase Realtime channels [cite: 614]. Update `notifications.status` on send, failure, or delivery confirmation [cite: 615].
- **Task 10.2: Trigger-Based Notification Events (Day 21 | Soso):** Wire database triggers to Edge Function calls for all key operational events: application submitted, KYC approved/rejected, membership activated, debit order failed, appointment confirmed, consultation limit alert, and plan change approved [cite: 615]. Each event auto-creates a `notifications` record [cite: 616].
- **Task 10.3: In-App Notification Centre (Day 21 | Bontle):** Build the notification bell dropdown / slide-out drawers across all three portals using Supabase Realtime subscriptions [cite: 617]. New notifications must appear instantly with real-time UI updates [cite: 618]. Support marking individual or all notifications as read and show unread badge counts [cite: 618].
- **Task 10.4: Member Notification Preferences (Day 22 | Bontle):** Add a notification preferences configuration page to the Member Portal [cite: 619]. Members toggle which channels (email, SMS, WhatsApp, in-app) they accept per event type [cite: 620]. Store preferences in `popia_consent_purposes` to be respected by the dispatch engine [cite: 621].
- **Task 10.5: Live SMS OTP Integration (Day 22 | Soso):** Activate the production SMS OTP gateway (`integration_name = sms_otp`) [cite: 622]. Test with real phone numbers in staging environments and update the integrations record to `status = active` [cite: 623].
- **Task 10.6: WhatsApp Business API Integration (Day 22 | Soso):** Configure the WhatsApp Business API endpoint (`integration_name = whatsapp`) [cite: 624]. Implement message templates for automated appointment reminders and debit order failure alerts [cite: 625]. Test thoroughly in the WhatsApp sandbox environment [cite: 625].
- **Task 10.7: Integrations Status Dashboard (Day 22 | Bontle):** Build the integrations management page in the Admin Portal: list all integration rows with status indicators, last-used timestamps, and configuration health checks [cite: 626]. Admins can toggle integrations active/inactive and view logs [cite: 627].

### 4.2 Milestone 11 - UI Polish & Accessibility (Deadline: Day 24 | Lead: Bontle)
- **Strategic Mission Brief:** Refine the UI across all three portals: enforce design system consistency, conduct a mobile responsiveness audit, add loading states and comprehensive error handling, implement the Google Wallet pass for digital membership cards, and achieve WCAG 2.1 AA accessibility compliance [cite: 627].
- **Task 11.1: Design System Consistency Audit (Day 23 | Bontle):** Review all three portals against the corporate design system [cite: 629]. Standardise: colour tokens, typography scales, spacing tokens, button variants, form inputs, table styles, badge/tag components, and modal patterns [cite: 630]. Fix all UI inconsistencies found [cite: 630].
- **Task 11.2: Mobile Responsiveness Audit & Layout Fixes (Day 23 | Bontle):** Test all pages at 360px, 390px, and 414px viewports [cite: 631]. Fix broken layouts, especially inside the Staff Portal (likely used on clinic tablets) [cite: 632]. Ensure all interactive touch targets are a minimum of 44px in both dimensions [cite: 633].
- **Task 11.3: Loading States, Skeletons & Error Boundaries (Day 23 | Bontle):** Add skeleton loading screens to every data-fetching grid and component [cite: 634]. Implement React error boundaries with friendly messaging and retry actions [cite: 635]. Handle Supabase errors, network failures, and empty states consistently [cite: 636].
- **Task 11.4: Google Wallet Digital Membership Card Pass (Day 24 | Soso):** Implement the Google Wallet pass integration (`integration_name = google_wallet`) for the digital membership card layout [cite: 637]. Members tap “Add to Google Wallet” from the portal, compiling name, card number, plan, clinic details, and expiry tokens [cite: 638].
- **Task 11.5: WCAG 2.1 AA Accessibility Audit (Day 24 | Bontle):** Run `axe-core` and Lighthouse accessibility audits across all portal endpoints [cite: 639]. Fix missing ARIA labels, insufficient colour contrasts, keyboard navigation gaps, missing focus indicators, and form error announcements to target zero critical violations [cite: 640, 641].
- **Task 11.6: Form Validation & UX Hardening (Day 24 | Bontle):** Audit all forms for validation messages, SA ID number checksum verification, phone number E.164 formatting, date picker constraints, and file upload size limits (max 5MB per document) [cite: 641]. Add confirmation dialogs for all destructive actions [cite: 642].

### 4.3 Milestone 12 - Security Audit & Hardening (Deadline: Day 25 | Lead: Soso)
- **Strategic Mission Brief:** Conduct a full security audit: RLS policy penetration testing, API key and secret management review, POPIA compliance verification, session security hardening, input sanitisation, and XSS reviews [cite: 643]. Document findings and fix vulnerabilities before production go-live [cite: 644].
- **Task 12.1: RLS Policy Penetration Test (Day 25 | Soso):** Systematically test every RLS policy by impersonating each role and attempting out-of-scope data access [cite: 645]. Verify a member cannot read another member’s records, staff cannot access other clinics, and admins cannot modify the `audit_log` [cite: 646]. Document all findings [cite: 646].
- **Task 12.2: API Key & Secret Management Audit (Day 25 | Soso):** Audit all secrets: confirm the Supabase service role key never reaches the frontend client bundle [cite: 647]. Verify all sensitive keys are stored in Supabase Vault or hosting environment variables only, ensuring Vite builds do not leak secrets [cite: 648, 649].
- **Task 12.3: Input Sanitisation & XSS Review (Day 25 | Soso):** Review all user inputs that touch the database [cite: 650]. Verify parameterised queries throughout custom functions, audit custom RPC calls, test for XSS in HTML-rendered fields, and verify file upload validations reject disallowed MIME types [cite: 651, 652].
- **Task 12.4: Session & Auth Hardening (Day 25 | Soso):** Verify session tokens expire correctly, refresh tokens rotate on use, step-up sessions expire after exactly 10 minutes, and concurrent session limits are enforced [cite: 652, 653]. Test that logging out completely clears all session states from browser storage [cite: 654].
- **Task 12.5: POPIA Compliance Verification (Day 25 | Soso):** Verify all data processing has a corresponding `popia_consents` record [cite: 655]. Confirm the account deletion flow (step-up gated) correctly anonymises member PII, data retention policies are documented, and privacy notices display at all collection points [cite: 656, 657].

### 4.4 Milestone 13 - Final QA & End-to-End Testing (Deadline: Day 27 | Lead: Both)
- **Strategic Mission Brief:** Execute the complete QA test suite across all three portals covering all user journeys, all integrations (live and stubbed), all report exports, all notification flows, and all edge cases [cite: 659]. Triage all bugs found, fixing all Critical (P0) and High (P1) issues before sign-off [cite: 660]. Run performance and load testing [cite: 660].
- **Task 13.1: E2E Test: Full Member Journey (Day 26 | Both):** Test the complete member journey: register -> verify email -> onboarding wizard -> upload KYC -> await approval -> receive activation notification -> view membership card -> book appointment -> view consultation history -> request plan change -> download statement [cite: 661].
- **Task 13.2: E2E Test: Staff Clinical Workflow (Day 26 | Both):** Test the full staff workflow: log in -> search member -> create walk-in appointment -> check in member -> log consultation -> dispense medication -> view daily statistics [cite: 662]. Test both appointment and walk-in pathways [cite: 663].
- **Task 13.3: E2E Test: Admin Operations Workflow (Day 26 | Both):** Test full admin workflow: approve application -> approve KYC -> manage debit orders -> generate all 7 report types and export each format -> view audit log -> manage cross-sell pipeline -> toggle an integration -> provision a staff account [cite: 663].
- **Task 13.4: Cross-Portal Data Consistency Validation (Day 26 | Both):** Verify that updates in one portal reflect instantly in others (e.g., staff logs consultation -> admin consultation summary updates -> member sees history change instantly) [cite: 664, 665]. Test Supabase Realtime notifications firing across portals [cite: 665, 666].
- **Task 13.5: Performance & Load Testing (Day 27 | Soso):** Run Lighthouse audits on all portal landing pages (target score > 85) [cite: 666]. Test member search parameters with 1,000+ member records to verify server-side pagination, and profile query execution plans on indexed database columns [cite: 666, 667].
- **Task 13.6: Bug Triage & Critical Fix Sprint (Day 27 | Both):** Compile all bugs from Milestones 10–13 [cite: 668]. Categorise as Critical (P0) / High (P1) / Medium (P2) / Low (P3) [cite: 669]. Fix all P0 and P1 bugs before sign-off, documenting P2 and P3 bugs in the post-launch backlog [cite: 670].
- **Task 13.7: Regression Test After Bug Fixes (Day 27 | Both):** Re-test all structural areas touched by bug fixes to confirm no regressions were introduced [cite: 671]. Each fixed bug receives a pass/fail sign-off with tester name and date [cite: 672].

### 4.5 Milestone 14 - Production Deployment & Sign-Off (Deadline: Day 28 | Lead: Both)
- **Strategic Mission Brief:** Deploy the platform to production, configure all live environment variables and integrations, conduct a production smoke test, set up monitoring and alerting, deliver handover documentation, and obtain formal stakeholder sign-off from the CoreTech Holdings team [cite: 673].
- **Task 14.1: Production Environment Configuration (Day 28 | Soso):** Configure the production Supabase project: production API keys, live SMTP credentials, SMS gateway live keys, Yoco live mode keys, and WhatsApp production credentials [cite: 674]. Update all integrations records to live configurations [cite: 674, 675].
- **Task 14.2: Production Build & Hosting Deployment (Day 28 | Bontle):** Run `npm run build` to produce the optimized Vite production bundle [cite: 675]. Deploy to hosting providers (Vercel, Netlify, or equivalent), configure environment keys, and verify all three portals load at production URLs [cite: 676, 677].
- **Task 14.3: Production Smoke Test (Day 28 | Both):** Run a focused smoke test in the live production environment: create a test member, approve via admin, log a consultation via the staff portal, generate one report export, and trigger a notification to confirm no environment errors appear [cite: 678].
- **Task 14.4: Monitoring & Alerting Setup (Day 28 | Soso):** Configure Supabase built-in monitoring (query performance, error rates) [cite: 679]. Set up uptime monitoring (UptimeRobot or BetterStack), configure alerts for Edge Function failures and failed debit order callbacks, and set up Sentry for error tracking [cite: 680, 681].
- **Task 14.5: Stakeholder Handover Documentation (Day 28 | Bontle):** Produce handover documentation: (1) Admin user guide, (2) Staff user guide, (3) Member onboarding guide, (4) Supabase configuration reference, and (5) Post-launch bug backlog [cite: 682]. Hand over to the CoreTech Holdings PM [cite: 682].
- **Task 14.6: Formal Stakeholder Sign-Off Demo (Day 28 | Both):** Conduct the final launch demo with all key stakeholders: Soso, Bontle, Botle (PM), Leece, Josua Nel, and Shane Ndobela [cite: 683]. Walk through all three portals live in production and obtain written sign-off confirming Phase 3 completion [cite: 684].

---

## 5. Delivery Summary

### 5.1 Master Milestone Table

| # | Phase | Milestone Description | Deadline | Lead | Task Count |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **M1** | Phase 1 | Data Modelling & Security Layer | Day 3 [cite: 685] | Soso [cite: 685] | 7 tasks [cite: 685] |
| **M2** | Phase 1 | Authentication & RBAC | Day 5 [cite: 685] | Soso [cite: 685] | 7 tasks [cite: 685] |
| **M3** | Phase 1 | Member Portal: Onboarding & Profile | Day 7 [cite: 685] | Bontle [cite: 685] | 7 tasks [cite: 685] |
| **M4** | Phase 1 | Member Portal: KYC & Membership Card | Day 9 [cite: 685] | Both [cite: 685] | 7 tasks [cite: 685] |
| **M5** | Phase 2 | Staff Portal: Core Operations | Day 12 [cite: 685] | Bontle [cite: 685] | 7 tasks [cite: 685] |
| **M6** | Phase 2 | Admin Portal: Member Management | Day 14 [cite: 685] | Bontle [cite: 685] | 7 tasks [cite: 685] |
| **M7** | Phase 2 | Payments & Debit Order Pipeline | Day 16 [cite: 685] | Soso [cite: 685] | 7 tasks [cite: 686] |
| **M8** | Phase 2 | Clinical Module (Consultations & Meds) | Day 17 [cite: 686] | Soso [cite: 686] | 5 tasks [cite: 686] |
| **M9** | Phase 2 | Admin Portal: KYC, Plans & Reporting | Day 19 [cite: 686] | Both [cite: 686] | 6 tasks [cite: 686] |
| **M10** | Phase 3 | Notifications & Integrations | Day 22 [cite: 686] | Soso [cite: 686] | 7 tasks [cite: 686] |
| **M11** | Phase 3 | UI Polish & Accessibility | Day 24 [cite: 686] | Bontle [cite: 686] | 6 tasks [cite: 686] |
| **M12** | Phase 3 | Security Audit & Hardening | Day 25 [cite: 686] | Soso [cite: 686] | 5 tasks [cite: 686] |
| **M13** | Phase 3 | Final QA & End-to-End Testing | Day 27 [cite: 686] | Both [cite: 686] | 7 tasks [cite: 686] |
| **M14** | Phase 3 | Production Deployment & Sign-Off | Day 28 [cite: 686] | Both [cite: 686] | 6 tasks [cite: 686] |
| **TOTAL**| | **Structural Engineering Scope** | **28 Days** | | **89 Tasks** [cite: 686] |

---

### 5.2 Phase Delivery Summary

- **Phase 1: Foundation (Days 1–9 | 4 Milestones | 28 Tasks):** Delivers the full Supabase backend architecture, RBAC auth routing, and the complete Member Portal covering interactive onboarding, KYC digital file uploads, digital cards, and appointment booking hooks [cite: 687].
- **Phase 2: Build-Out (Days 10–19 | 5 Milestones | 39 Tasks):** Delivers the full Staff Portal, complete Admin Portal interface, integrated payment pipelines (Yoco API + DebiCheck direct collections), clinical modules, and the full 7-report system suite [cite: 687].
- **Phase 3: QA & Deploy (Days 20–28 | 5 Milestones | 31 Tasks):** Delivers the live notification engine across all channels, activates production service integrations, completes UI polish/accessibility compliance, conducts security audits, and handles production release deployment and sign-off [cite: 687].

---

### 5.3 Developer Task Split

- **Soso Kwani (Soso):** Core database schema, RLS policy penetration guards, Supabase Auth + RBAC rules, Edge Functions, transactional payment gateways (Yoco + DebiCheck), step-up MFA challenge systems, SMS OTP routing, WhatsApp API configurations, Google Wallet Pass packaging, security audits, POPIA alignment checks, and database index performance testing [cite: 688].
- **Bontle Booi (Bontle):** React + Vite application scaffolding, all three web portal user interfaces, frontend component design system, reporting dashboard interfaces, real-time data visualisations, reporting engine analytics UI, notification slide-out UI widgets, mobile viewport responsiveness, accessibility engineering, production builds, deployment webhooks, and handover user guides [cite: 688].
- **Co-Ownership (Both):** Comprehensive end-to-end QA testing matrices, multi-portal integration testing, cross-portal data synchronization checks, bug triage loops, patch engineering, live production environment smoke testing, and stakeholder demo operations [cite: 688, 689].

---
*Prepared by: CoreTech Holdings | May 2026. Every milestone and task should be entered into the project management tracker with deadlines and developer assignments as specified above [cite: 689, 690].*
