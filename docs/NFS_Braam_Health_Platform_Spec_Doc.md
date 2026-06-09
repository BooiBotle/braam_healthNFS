# Platform Specification
## Health Membership Management System

---

## Document Metadata
- **Company:** NFS INSURE (FSP 53910) & Braam Health Centre
- **Location:** Eagle Canyon, Randpark Ridge
- **Document Version:** 1.0
- **Date:** 24 May 2026
- **Classification:** Confidential | Internal
- **Platform URL:** [braamhealthcentre.nfsconnect.co.za](https://braamhealthcentre.nfsconnect.co.za)
- **Regulated By:** FSCA (Authorised FSP 53910)
- **Compliance Standards:** POPIA | FICA | NCA | NAEDO/DebiCheck
- **Contact Info:** info@nfs.insure | +27 10 011 0010

---

## 1. Executive Overview

The NFS Insure Health Membership Management Platform is a multi-portal web application that connects health clinic members, clinic staff, and NFS Insure administrators within a single, regulated ecosystem. The platform is branded as **NFS Insure | Braam Health Centre** and is accessed at `braamhealthcentre.nfsconnect.co.za`.

The system serves three distinct user types across three portals:

### Table 1: Platform Portals Summary

| Portal | User Type | Primary Purpose |
| :--- | :--- | :--- |
| **Member Portal** | Registered health members | Self-service access to membership card, consultation history, dependants, debit orders, plan upgrades, KYC, and clinic info. |
| **Staff Portal** | Clinic receptionists and nurses | Member verification at the desk, appointment management, consultation logging, medication register, and peak-hour analytics. |
| **Admin Portal** | NFS Insure back-office staff | Full membership lifecycle management: applications, onboarding, KYC review, debit orders, reconciliation, plan changes, compliance (POPIA, audit log, signed agreements). |

### 1.1 Business Context
Braam Health Centre, operated under NFS Insure Consultant (Pty) Ltd (FSP 53910, regulated by the FSCA), provides subscription-based primary healthcare to members in Randpark Ridge, Gauteng. Members pay a monthly debit order for tiered clinic access including GP consultations, chronic medication, and 24/7 emergency care. The platform automates the full membership lifecycle from application through to monthly billing reconciliation, FICA/POPIA compliance documentation, and clinical record-keeping.

### 1.2 Regulatory Environment

### Table 2: Regulatory Obligations and Platform Mapping

| Regulation | Platform Obligation |
| :--- | :--- |
| **POPIA (Act 4 of 2013)** | Explicit consent capture at onboarding with versioned consent records; POPIA register maintained in Admin; member right to access/correct/delete data. |
| **FICA (Act 38 of 2001)** | KYC document collection (SA ID, proof of address, payslip, bank statement); stored securely and reviewed in Admin KYC Queue. |
| **NAEDO / DebiCheck** | Signed debit order mandates captured per member; stored in Admin Mandates; reconciliation dashboard for failed and successful collections. |
| **FSCA (FSP 53910)** | All financial agreements versioned and signed; Signed Agreements registry maintained. |
| **NCA** | Income verification via payslip/bank statement as part of KYC financial affordability assessment. |

---

## 2. Membership Plans

The platform supports the following membership plans. Plans are displayed to members on the Upgrade Plan page and managed via the Admin Portal. Plan changes requested by members are reviewed within 1-2 business days, take effect from the next debit order collection date, and trigger an email confirmation. Only one pending plan change request may be active per member at any time.

### Table 3: Available Membership Plans

| Plan Name | Monthly Fee | Coverage / Members | Consultations | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Essential** | R 550 | 1 (single) | 3 / month | Medication included; 24/7 access |
| **Couple** | R 720 | 2 adults | 6 / month | Medication included; 24/7 access |
| **Family** | R 850 | Family of 4 | 12 / month | Medication included; 24/7 access |
| **Family+** | R 1,150 | Family of 6 | 18 / month | Most popular; medication included; 24/7 access |
| **Senior Care** | R 650 | 1 (age 60+) | 4 / month | Chronic script; medication included; 24/7 access |
| **Corporate** | R 480 | 1 (min. 10) | 3 / month | Per employee; minimum 10 employees |
| **Basic Health Membership** | R 599 | 1 | 3 / month | Braam-specific plan |
| **Braam Health Membership** | R 888 | 1 | 3 / month | Braam-specific plan |
| **Plus+** | R 1,333 | 2 | 6 / month | Braam-specific plan |
| **Braam Health Corporate Membership** | R 499 | 1 (min. 10) | 3 / month | Braam corporate plan |
| **Chronic Medication Prog.** | TBD | 1 | 0 / month | Coming Soon |

---

## 3. Member Portal
**URL Pattern:** `/member/*`  
The Member Portal is the self-service interface for registered NFS Insure health members, accessible via both desktop and mobile web browsers. Authentication is managed via the NFS Connect platform. A WhatsApp Support button is persistently available across all pages.

### 3.1 Navigation Structure
The left-side navigation contains the following items in order:
1. Dashboard
2. My Card
3. Consultations
4. Dependants
5. Debit Orders
6. Appointments
7. Payments
8. Upgrade Plan
9. Statement
10. KYC Verification
11. Clinic Info
12. Profile

*The sidebar footer displays the serving clinic name (Braam Health Centre), the member's avatar/initials, and a Logout link.*

### 3.2 MP-01: Dashboard
The landing page after login, combining an overview card with contextual widgets:
- **3.2.1 Digital Membership Card (Top Widget):** Dark navy card design branded with NFS Insure logo and clinic name. Displays: ACTIVE status badge, Membership Number (e.g., `NFS8 9012 3456 7`), member's full name, and plan name (e.g., `COUPLE`). Includes a QR code on the bottom-right for offline reception scanning, and a Statement link shortcut.
- **3.2.2 Plan Summary Widget:** Shows current plan name, number of members covered, monthly fee, and debit day (e.g., *"Debit on the 1st of each month"*). Contains a "Change Plan" button linking to the Upgrade Plan page.
- **3.2.3 My Consultations Widget:** A counter showing visits used this month vs. monthly allowance (e.g., `0 of 6`), an interactive progress bar indicating utilization, and a "Remaining Visits" label.
- **3.2.4 Your Details Widget:** Displays name with Active badge, email, phone, membership number, physical address (or *"Not provided"*), and member-since date. Includes an "Edit" button linking to the Profile page.
- **3.2.5 Appointments Widget:** Chronological list of upcoming and recent appointments with status badges (`CONFIRMED`, `COMPLETED`), including date, time, reason, brief staff note, and a "Book" button.
- **3.2.6 Consultation History Widget:** Quick scrollable list of past clinic visits with dates and clinical notes.
- **3.2.7 Payment History Widget:** Tracks billing records (date, amount, status), defaulting to an empty state if none are recorded.

### 3.3 MP-02: My Card
A full-page version of the digital membership card. Contains a full-resolution preview of the dark navy card containing the membership number, member name, plan, ACTIVE badge, and QR code. 
- **Instruction Text:** *"Scan the QR code at reception for instant verification no internet required"*
- **Actions:** "Download Card Image" button (saves PNG to device) and "Add to Google Wallet" button (wallet pass integration).

### 3.4 MP-03: Consultations
- **Page Title:** *Consultation History — Your past visits to Braam Health Centre*
- **Layout:** Full chronological list of consultations detailing:
  - Date badge (Month / Day / Year format columns)
  - Day and time (e.g., *"Friday at 11:00"*)
  - Clinical notes text (free text input from staff)
  - Meds badge/link per row (indicates medication was dispensed, links directly to the respective medication record)
- **Pagination:** Scrollable infinite list with no explicit pagination limit.

### 3.5 MP-04: Dependants
- **Subtitle:** *Manage family members linked to your plan*
- **Layout:** Table columns include: `Name`, `Relationship`, `ID / Date of Birth`, `Added`.
- **Empty State:** *"No dependants added to your profile"*
- **Actions:** An "Add Dependant" button on the top-right opens a modal form to link a new family member. Eligibility depends on the active plan type.

### 3.6 MP-05: Debit Orders
- **Subtitle:** *Monthly payment history and banking mandate*
- **Layout:** Three top-row KPI cards displaying `Total Collected`, `Failed Payments`, and `Collection Day`. Includes a debit order history table (with an empty state fallback).
- **Security Action:** A "Change Bank Details" button triggers an identity verification SMS OTP before fields can be edited.

### 3.7 MP-06: Appointments
- **Subtitle:** *Request and track your clinic appointments*
- **Layout:** Displays upcoming and historical appointments including requested date, time, reason/description, a status badge (`Confirmed`, `Completed`, `Pending`, `Cancelled`), and staff notes (e.g., *"Seen by Dr Khumalo. BP elevated medication reviewed."*).
- **Actions:** "Request Appointment" button on the top-right to submit a new clinic slot request.

### 3.8 MP-07: Payments
- **Current State:** "Coming Soon" screen for online card payment processing.
- **Message:** *"Online card payments will be available here shortly. In the meantime, please contact NFS Insure to arrange payment."*
- **Contact Details Provided:** Phone (`+27 10 011 0010`) and Email (`info@nfs.insure`).
- **Future Scope:** Full Yoco / card payment gateway integration for once-off and recurring payments.

### 3.9 MP-08: Upgrade Plan
- **Subtitle:** *Choose a plan that fits your family. Changes take effect from your next debit order collection.*
- **Layout:** Available plans are displayed as individual cards within a responsive grid. The member's current plan is highlighted with a "Current Plan" badge and a disabled action button.
- **Accents:** "Most Popular" badge on the `Family+` plan; "Coming Soon" badge on the `Chronic Medication Programme`.
- **Footer Explainer Notes:**
  1. Requests are reviewed within 1-2 business days.
  2. Approved changes become effective on the next debit order collection date.
  3. Email confirmation is sent immediately upon approval.
  4. Only one pending request may be active at a time.

### 3.10 MP-09: Statement
- **Interface:** Opens as a printable modal overlay.
- **Header Bar:** *"Your membership statement is ready"* with "Email me this statement", "Print/Save as PDF", and "Close" actions.
- **Document Content Layout:**
  - Top-Left: Clinic name and address. Top-Right: "Membership Statement" + generated timestamp.
  - Member Info Block: Name, email, phone, address.
  - Membership Details Block: Plan, cover, monthly fee, debit day, card number, status, member-since date.
  - Summary KPIs: Total Collected (R), Consultations Count, Failed Payments Count.
  - History Tables: Payment History table (date, amount, status) and Consultation History table (date/time, notes).

### 3.11 MP-10: KYC Verification
- **Subtitle:** *Upload your identity and financial documents for FICA compliance*
- **Required Fields:**
  1. **South African ID Document:** *"Clear photo or scan of your ID book or smart card (front and back)"*
  2. **Proof of Address:** *"Utility bill or bank statement, not older than 3 months"*
  3. **Payslip / Proof of Income:** *"Most recent payslip or bank statement showing income"*
  4. **Bank Statement:** *"Last 3 months of bank statements for debit order verification"*
- **UX:** Each field features a "Choose File" upload button with type-validation. Submissions route directly into the Admin KYC Queue.

### 3.12 MP-11: Clinic Info
- **Header Banner:** *"Open 24 hours, 7 days a week"* — Dr M J Diago | General Practice | No appointment needed for members.
- **Contact Card:** Phone: `+27 10 011 0010` | Email: `info@nfs.insure` | Action: "Chat on WhatsApp".
- **Address Card:** Braam Health Centre, Eagle Canyon Office Park, Cnr Christiaan De Wet & Dolfyn St, Randpark Ridge, 2154 — featuring a "Get Directions" button.
- **Operating Hours Table:** Monday–Friday, Saturday, Sunday, and Public Holidays are all explicitly listed as *"Open 24 hours"*.
- **Services Included:** GP consultations, chronic condition management, routine check-ups, wound care, emergency & after-hours care, prescribed medication on-site, BP & glucose monitoring, and specialist referrals.
- **Regulatory Accent:** FSCA regulatory footer notice and a secondary "Chat with Support on WhatsApp" CTA at page bottom.

### 3.13 MP-12: Profile
- **Actions:** "Edit Profile" button on the top-right.
- **Personal Details Card:** Full name, SA ID number, Date of birth.
- **Contact Information Card:** Phone number, Email address, Physical address.
- **Banking Details Card:** Bank name, Account holder, Account number, Collection date.
- **Security Constraint:** "Edit Banking" button triggers SMS OTP identity verification. Warning displayed: *"Editing banking details requires identity verification via SMS"*.

### 3.14 MP-13: POPIA Consent (Onboarding Step)
- **Visibility:** Triggered mandatorily during member onboarding or initial login.
- **Header Text:** *"Privacy Consent (POPIA) — The Protection of Personal Information Act (POPIA) requires Braam Health Centre and NFS Insure FSP 53910 to obtain your explicit consent before processing your personal information."*
- **Data Governance Information Card:** Responsible Party, Purpose, Retention Period (5 years under FICA & medical regulations), and Rights (Access/Correct/Delete via `privacy@braamhealth.co.za`).
- **Required Consent Checkboxes (Version 2024-v1):**
  1. Identity verification (Required)
  2. Medical & consultation records (Required)
  3. Billing & debit order processing (Required)
  4. Membership card & benefits (Required)
- *Optional purposes are available via toggleable switches. All actions log immutably to the Audit Log and POPIA Register.*

### 3.15 MP-14: Global Features
- Floating green WhatsApp Support button located on the bottom-right of all screens.
- Sidebar footer serving label displays: `Braam Health Centre`.
- Sidebar footer Logout link.
- Session-based authentication requiring step-up SMS OTP authentication for core profile or banking updates.

---

## 4. Clinic Staff Portal
**URL Pattern:** `/clinic/*` or `/staff/*`  
The Staff Portal is utilized by Braam Health Centre receptionists and clinical nursing staff. It is architecturally optimized for front-desk efficiency: instantaneous member verification, real-time consultation logging, appointment tracking, medication logs, and operational data analytics.

### 4.1 Navigation Structure
1. Dashboard
2. Verify Member
3. Applications
4. Appointments
5. Consultations
6. Medication Register
7. Peak Hours

### 4.2 SP-01: Dashboard (Daily Summary)
A live-refreshing operational overview dashboard that automatically pulls new data every 30 seconds, indicated visually via a green "Live" pulsing dot.

- **4.2.1 Alert Banners:**
  - *Yellow Alert:* “N member(s) have reached their monthly consultation limit” (lists affected member names).
  - *Red Alert:* “N flagged consultations require attention — Click to review in the flagged section below”.

- **4.2.2 KPI Cards:**
  - **CHECK-INS TODAY:** Active count of daily check-ins; links directly to the daily visit log.
  - **ACTIVE MEMBERS:** Total active member system count; links to the member browser.
  - **OVER LIMIT:** Total count of members exceeding their plan allowance this month; links to limit breach review.
  - **FLAGGED:** Quantitative count of flagged clinical entries; links to the flagged activity section.

- **4.2.3 Today's Check-ins:** Real-time chronological checklist of check-ins. Default empty state: *"No check-ins yet today."*
- **4.2.4 Consultation Limit Exceeded:** Displays members breaching plan constraints. Table columns: `Avatar`, `Name`, `Plan`, `Phone`, `Usage` (e.g., *"4/3 used this month"*). Features a "Verify" action button to view details and proceed with administrative overrides.
- **4.2.5 Flagged Activity:** Lists logs needing review. Table columns: `Avatar/Initials`, `Name`, `Date`, `Time`, `Truncated Clinical Notes`, `Flagged Badge`, `View Icon (Eye)`.
- **4.2.6 Monthly Summary Footer:** Displays cumulative month-to-date metrics: total overall visits, aggregate active members, and gross revenue generated in Rands (R).

### 4.3 SP-02: Verify Member
- **Subtitle:** *Search by ID, passport number, card number, or phone — or scan the QR code on their card*
- **Search Capabilities:** Single text field accepting SA ID, passport number, NFS membership number, or mobile number.
- **Hardware Integration:** A "QR Scan" button (represented by a camera icon) activates the local device camera to instantaneously scan physical or mobile-displayed member QR codes.
- **Verification Outputs:** Returns member name, plan type, status, consultation allowance tracker, and active alerts.

### 4.4 SP-03: Applications Log
- **KPI Summary Row:** Three status boxes detailing `Awaiting Approval` (Orange), `Approved` (Green), and `Declined` (Red).
- **Navigation Filters:** Tabs separating `All` | `Awaiting Approval` | `Approved` | `Declined`.
- **Table Columns:** `Applicant Name + Phone`, `Plan (Name + Price R/mo)`, `Submitted Timestamp`, `Status Badge`, `Details (View Button)`.
- *Staff access is strictly read-only; editing or approval permissions reside exclusively in the Admin Portal.*

### 4.5 SP-04: Appointments
- **Subtitle:** *Book and manage member appointments*
- **Actions:** "Refresh" and "New Appointment" workflow buttons.
- **Filters:** Dropdown sorting options for `All appointments`, `Confirmed`, `Completed`, `Pending`, or `Cancelled`.
- **Layout:** Comprehensive grid mapping date badges, member names, status indicator badges, descriptions, phone numbers, and initial request dates. Rows are expandable to reveal deep nested data. All cross-clinic entries are visible here.

### 4.6 SP-05: Recent Consultations
- **Subtitle:** *Log of all recent visits to the clinic*
- **Table Columns:** `Date`, `Member Name`, `Card Number (NFS... or N/A)`, `Medication Status (Dispensed / None)`, `Flagged Status (Checkbox/Dash)`.
- **Sorting:** Strict reverse-chronological layout (newest first).

### 4.7 SP-06: Medication Register
- **Subtitle:** *Log and review all medications dispensed at the clinic*
- **Actions:** "Record Dispensing" button launches an immediate modal form to enter a medication output event.
- **Filters:** Search filter by member name or medication name string.
- **Table Columns:** `Date & Time`, `Member Name`, `Plan`, `Medication Description` (includes precise dosage and volumes, e.g., *"Metformin 500mg x60 tablets dispensed"*), and `Flagged Indicator`. Flagged entries display an aggressive red status badge.

### 4.8 SP-07: Peak Hours Analytics
- **Subtitle:** *Consultation patterns by time of day and day of week*
- **Timeframes:** Filterable view toggles for `7 days` | `30 days` | `90 days`.
- **KPI Row:** `Total Visits`, `Daily Average`, `Busiest Hour`, `Busiest Day`.
- **Visual Charts:** - *Consultations by Hour of Day:* Color-coded bar charts mapping operational time blocks: Morning (8–11: Teal), Midday (12–14: Blue-Teal), Afternoon (15–18: Purple), and Off-Peak (Grey).
  - *Consultations by Day of Week:* Teal brand-colored aggregate volume bar chart.

---

## 5. Admin Portal
**URL Pattern:** `/admin/*`  
The Admin Portal provides NFS Insure back-office operators comprehensive oversight and structural configuration mechanisms governing the membership application, billing lifecycles, cross-portal workflows, regulatory compliance, and analytical reporting.

### 5.1 Navigation Structure
1. Dashboard
2. Members
3. Applications
4. Onboarding
5. Appointments
6. Mandates
7. KYC Queue
8. Cards
9. Cards Gallery
10. Debit Orders
11. Reconciliation
12. Plan Changes
13. Cross-Sell Pipeline
14. Audit Log
15. Retention Report
16. Reports & Exports
17. Integrations
18. POPIA Register
19. Signed Agreements

### 5.2 AP-01: Admin Dashboard
Comprehensive platform operational analytics display, featuring data visualization graphs and live activity tickers.
- **5.2.1 Top-Row KPI Cards:**
  - **Total Members:** Gross platform members with a dynamic live sub-count showing active users.
  - **Monthly Revenue:** Total billing collected in the current calendar cycle alongside an embedded collection success percentage rate.
  - **Consultations This Month:** Cumulative log of current month clinical visits.
  - **Pending Items:** Action item counts monitoring `KYC Submissions`, `Cards to Issue`, and `Failed Orders`.
- **5.2.2 Graphical Charting Suite:**
  - *Revenue Overview (12 Months):* Historical line/bar overlay charting trailing 12-month billing performance.
  - *Plan Distribution:* Breakdown donut chart visualising membership volumes spread across available plan tiers.
- **5.2.3 Recent Activity Feed:** Live real-time stream logging structural occurrences (e.g., system registrations, consultation uploads, KYC document uploads).

### 5.3 AP-02: Members
- **Subtitle:** *Manage platform members*
- **Actions:** "Export CSV" and "Add Member" configuration buttons.
- **Table Structure:** Features global search filter (*"Search by name, ID, or card number"*). Columns outline: `Member (Name + Card Number)`, `ID Number`, `Plan Type`, `Status Badge (Active/Inactive)`, `Joined Date`, and a "View" action button linking directly to the full member profile page.

### 5.4 AP-03: Applications Inbox
- **Subtitle:** *Review submitted applications and activate or reject membership*
- **Structural Separation:** Two core layout tabs tracking `Individual` and `Corporate` requests, accompanied by interactive counter indicators (`Individual Pending`, `Corporate New`).
- **Sub-Filter States:** `Awaiting Approval` | `Activated` | `Rejected`.
- **UX Table Actions:** "Approve", "Reject", or "View". Approvals instantly provision membership accounts, generate card sequences, and trigger welcoming notifications.

### 5.5 AP-04: Onboarding
Guided wizard flow handling structural setup for fresh memberships (capable of processing via customer self-service or staff assistance). Tracks onboarding milestone completion status step-by-step:
1. Personal details entry
2. Plan tier selection
3. Banking information capture
4. POPIA compliance consent agreement
5. KYC digital file upload
6. Mandate signing
7. Healthcare Membership Agreement execution

### 5.6 AP-05: Appointments (Admin View)
Complete centralized master calendar overview capturing historical and upcoming appointments across all platform records. Supports full filtering, text searching, data exports, manual note injection, or cancellation overrides.

### 5.7 AP-06: Mandates
- **Full Title:** *Debit Order Mandate Signing — Capture member’s signed debit order mandate for NAEDO/DebiCheck compliance*
- **Workflow:** Operators input a member's ID number to open mandate capture interfaces. Signed files are stored permanently and remain reviewable within the member's profile. Mandate documentation execution is a system blocking requirement before any monthly debit order processes can be scheduled.

### 5.8 AP-07: KYC Queue
Centralized verification hub streaming member FICA digital file uploads. For each processing record, operators review uploaded credentials: SA ID document, Proof of Address, Income Payslip, and Bank Statement. Available operator outcomes include: "Approve KYC", "Request Resubmission", or "Flag for Review". Status updates sync directly across member profile objects and the POPIA Register.

### 5.9 AP-08: Cards
Individual member card management workspace. Administrators assign card values, alter card status markers (`Active`, `Inactive`, `Cancelled`), or trigger on-demand physical/digital pass regenerations. All card allocations follow a strict standardized expression format: `NFS[clinic-code][7-digit-number]`.

### 5.10 AP-09: Cards Gallery
- **Subtitle:** *N cards — preview and download high-resolution PNG images*
- **Layout:** Grid visualizing all generated membership card passes using the official corporate dark navy, gold-trimmed brand standard. Displays: member name, plan, membership identifier code, QR graphic asset, and status indicator.
- **Actions:** "Download PNG" per item, or a global "Download All (N)" utility button executing a bulk archival download of all active image assets.

### 5.11 AP-10: Debit Orders
Comprehensive tracking framework capturing historical and scheduled monthly billing records across the platform. Columns display: `Member`, `Amount`, `Collection Date`, and `Status (Success / Failed / Pending)`. Features immediate operational utilities allowing single or bulk collection retries for failed processes alongside CSV data exporting utilities. Integrates directly with the Reconciliation engine.

### 5.12 AP-11: Reconciliation
- **Purpose:** Monthly operational dashboard mapping variances between projected financial expectations and actual incoming collection performance.
- **Key Metrics:** `Total Expected Revenue`, `Total Collected Revenue`, `Failed Collection Orders Count`, and `Collection Rate Percentage (%)`.
- **Features:** Provides granular per-member collection breakdowns alongside management overrides for manual adjustments and account write-offs. Outputs custom reconciliation analytical reports into CSV or PDF formats.

### 5.13 AP-12: Plan Changes
Centralized operations queue monitoring membership modification requests filed from the Member Portal. Lists: `Member Name`, `Current Active Plan`, `Requested Destination Plan`, and `Request Timestamp`. Admin operators hold absolute "Approve" or "Decline" decision inputs. Approved changes adjust downstream billing schedules on the immediate next collection cycle and dispatch automated email confirmations to the member.

### 5.14 AP-13: Cross-Sell Pipeline
Visual business pipeline identifying existing members matching background metrics for tier upgrades or complementary financial insurance product cross-selling. Tracks business opportunities step-by-step: `Identified` -> `Contacted` -> `Proposal Sent` -> `Converted` -> `Not Interested`. Designed to support the sales follow-up workflows for the NFS Insure team.

### 5.15 AP-14: Audit Log
- **Sub-Header:** *Compliance – Immutable Audit Trail*
- **Purpose:** Centralized compliance-grade tracking engine maintaining records of all administrative and financial transformations executed across the system ecosystem.
- **System Behavior:** Automatically pushes updated records every 15 seconds. The underlying storage architecture is completely immutable: modification or deletion mechanisms are absent from all roles.
- **Filtering Suite:** Structured search parameters filtering via specific action codes or structural entities. Header displays: *"Showing N audit record(s) — immutable trail, export for compliance"*.
- **Table Columns:** `Timestamp`, `Action (Color-Coded Status Badge)`, `Entity Type (Badge)`, `Entity ID`, and `Performed By`.
- **Monitored Action Triggers:** Include *Popia Consent Given, Agreement Signed, Step Up Verified, Step Up Requested, Yoco Checkout Created, Consultation Logged, KYC Submitted, and Member Activated*. Features deep-nested JSON data payload expansion buttons per row alongside a dedicated compliance CSV export utility.

### 5.16 AP-15: Retention Report
Analytics dashboard delivering structural churn, retention metrics, and membership stability reporting:
- Dynamic monthly cohort retention grid charting fresh acquisitions against eventual membership cancellations.
- Retention performance breakdown separated by membership plan tier.
- Longitudinal metrics mapping average active lifespan indicators.
- System flagging surfacing at-risk memberships (e.g., consecutive failed debit collection loops or prolonged absence of clinical consultations).

### 5.17 AP-16: Reports & Exports
Highly configurable operational report rendering suite.
- **Supported Report Templates:** Member List registry, Consultation Summary logs, Revenue Performance metrics, KYC Status summaries, Plan Volume distribution maps, and Debit Order Performance summaries.
- **Controls:** Custom historical date range selectors exporting clean assets into CSV or PDF file formats. Supports automated subscription schedules dispatching reports via corporate email channels.

### 5.18 AP-17: Integrations
Centralized panel monitoring operational links, API keys, webhook configurations, and status links powering external third-party microservices:
- **Yoco Checkout:** Powers online debit card transaction layers, checkout creation mechanisms, and step-up payment verification processes.
- **WhatsApp Business API:** Drives automated support chats, member notices, and transactional messaging.
- **NAEDO / DebiCheck Gateway:** Connects direct banking collection loops and financial mandate compliance systems.
- **Google Wallet Pass API:** Translates membership metadata into native Android wallet passes.
- **SMS OTP Gateway Provider:** Authorizes identity validation step-up challenges governing structural profile amendments.

### 5.19 AP-18: POPIA Register
Specialized legal database tracking consent events captured platform-wide. Columns capture: `Member Identifier`, `Consent Legal Version (e.g., 2024-v1)`, `Accepted Consent Clauses`, `Timestamp`, and originating `IP Address`. Architected to support statutory right-of-access requests, allowing administrators to generate full historical privacy data compliance profiles for any given member. Fully auditable via direct CSV compliance export engines.

### 5.20 AP-19: Signed Agreements
- **Subtitle:** *Member-signed Healthcare Membership Agreements — NFS Insure copies*
- **Oversight Elements:** Top summary metrics monitoring `Total Signed Agreements`, `This Month's Signatures Count`, and `Latest Legal Framework Version (e.g., 2025-v1)`. Contains a complete table mapping signed contracts with member metadata, agreement version markers, and signature timestamps.
- **Compliance Aspect:** Agreements are dynamically generated and e-signed during onboarding, then stored immutably.

---

## 6. Cross-Portal Features & Data Flows

### 6.1 Member Lifecycle Flow
1. **Application:** The prospect initiates a membership file using the digital onboarding wizard (completed via self-service or staff assistance).
2. **POPIA Consent:** Explicit privacy checkouts are captured and written to the POPIA Register and system Audit Log.
3. **KYC Upload:** The member provides required identity and financial documentation, which routes immediately to the Admin KYC Queue.
4. **Mandate Signing:** A debit order mandate is executed digitally and archived securely within the Admin Mandates database.
5. **Agreement Signing:** The primary Healthcare Membership Agreement is e-signed and recorded inside the Signed Agreements repository.
6. **Admin Review:** Back-office operators process the application from the Applications Inbox, activating the account upon satisfactory file review.
7. **Card Generation:** Account activation triggers the auto-generation of a digital membership card pass containing an offline-scannable QR code block.
8. **First Debit:** The monthly membership subscription billing executes automatically on the designated collection date and updates the Debit Orders ledger.
9. **Clinic Visits:** Front-desk clinic staff verify incoming members via QR code scan or SA ID input, logging consultations and modifying the Medication Register as required.
10. **Monthly Reconciliation:** Financial administrators cross-reference monthly banking inputs against expected account volumes.
11. **Plan Change / Upgrade:** Members apply for plan alterations via their portal tier; following admin approval, adjustments apply onto the subsequent billing cycle.
12. **Cancellation / Churn:** Terminations map across the Retention Report, while final termination sequences write permanently to the system Audit Log.

### 6.2 QR Code Verification Flow
1. A member presents their digital membership card QR pass via a mobile device at the clinic reception desk.
2. The receptionist logs into the Staff Portal, loads `Verify Member`, and launches the `QR Scan` interface.
3. The integrated hardware device camera initializes and decodes the digital QR code pass.
4. The system queries data objects to validate active membership parameters in real-time.
5. The interface outputs immediate verification feedback: member name, plan tier, remaining consultation balance, and outstanding system alerts.
6. The receptionist clears the check-in, allowing clinical teams to proceed with consultation entry.

### 6.3 Consultation Limit Enforcement
- Plan configurations enforce fixed monthly consultation allowances (defined in Section 2).
- When a member reaches or breaks their monthly visit volume limit:
  - The Staff Dashboard triggers a prominent yellow alert banner calling out the member's name.
  - The member is added to the "Consultation Limit Exceeded" reporting view, displaying precise usage parameters (e.g., *"4/3 used this month"*).
  - Staff can still verify the member and view the alert, but further clinical logging requires explicit administrative override validation.
  - Over-limit occurrences write to specialized financial reports for pricing reconciliation and targeted plan upgrade marketing sequences.

### 6.4 Flagging System
- Clinical consultation entries and medication dispensing logs can be flagged manually by clinic operators or tripped automatically by backend risk validation algorithms.
- Active flags route instantly into the Staff Dashboard's *Flagged Activity* tracking row.
- Flag entries surface concurrently inside administrative analytical tools (Consultations, Medication Register views).
- The system Audit Log maintains an un-alterable tracking record detailing exactly who initiated a flag and the exact timestamp.
- Authorized clinic supervisors can clear flags after conducting structural case reviews.

---

## 7. Authentication & Security

### Table 4: Authentication and Security Specifications

| Feature | Specification Details |
| :--- | :--- |
| **Session Authentication** | Strict session-based authorization token management; authenticated users are restricted to their authorized portal tier. |
| **Role-Based Access Control** | Three rigid system access roles defined: Member, Staff (Clinic), and Admin. |
| **Step-Up Authentication** | SMS OTP transaction challenges are forced before any critical profile data or banking amendments execute in the Member Portal. |
| **Step-Up Audit** | Every step-up challenge distribution and validation event writes to the immutable Audit Log. |
| **Banking Detail Change** | Requires mandatory SMS identity verification prior to updating bank fields. |
| **Portal Isolation** | Members are blocked from accessing Staff or Admin data; Staff are isolated from Admin-only features. |
| **HTTPS Protection** | Complete system traffic operates over TLS encryption layers. |
| **Data Retention** | Structural clinical files and financial records are maintained for a minimum 5-year compliance duration (FICA & health regulations). |

---

## 8. Compliance Requirements Summary

### Table 5: Compliance Features by Regulation

| Regulation | Feature Mapping | Portal / Module Location |
| :--- | :--- | :--- |
| **POPIA** | Versioned consent capture at point of onboarding | Member Portal: POPIA Consent Page; Admin: POPIA Register & Audit Log |
| **POPIA** | Right to access / correct / delete personal records | Admin: Member Record Management; Contact point: `privacy@braamhealth.co.za` |
| **FICA** | KYC document upload collection and operator review | Member Portal: KYC Verification; Admin Portal: KYC Queue |
| **NAEDO / DebiCheck** | Signed debit order mandate execution | Admin Portal: Mandates module; Member Portal: Debit Orders view |
| **FSCA (FSP 53910)** | Signed Healthcare Membership Agreements | Admin Portal: Signed Agreements registry |
| **General Compliance** | Completely immutable platform event audit logs | Admin Portal: Audit Log (auto-refresh enabled, CSV export supported) |
| **Medical Records** | Safe tracking of consultation notes and pharmacy outputs | Staff Portal: Consultations & Medication Register; Member Portal: Consultation History |

---

## 9. Third-Party Integrations

### Table 6: Third-Party Integration Summary

| Integration | Type | Functional Purpose |
| :--- | :--- | :--- |
| **Yoco** | Payment Gateway | Handles online debit card checkouts (coming soon), checkout session token creation, and step-up payment validation checks. |
| **WhatsApp API** | Messaging Platform | Powers live member customer support chat interfaces, event alerts, and alternative OTP delivery systems. |
| **NAEDO / DebiCheck** | Banking Network | Facilitates monthly direct debit mandate tracking and automated billing collection processes. |
| **Google Wallet** | Digital Wallet Pass | Packages membership details into native Android wallet passes for mobile access. |
| **SMS / OTP Provider** | Verification Engine | Distributes step-up verification codes validation checks for profile edits (banking modifications). |
| **Email Provider** | Communications Engine | Dispatches member statements, plan alteration notices, welcome documentation, and automated appointment reminders. |

---

## 10. Page Inventory Summary

### 10.1 Member Portal (12 Pages + Global Features)

| Page ID | Page Name | Summary & Functional Description |
| :--- | :--- | :--- |
| **MP-01** | Dashboard | Platform landing area summarizing membership card, active plan stats, consultations, upcoming appointments, and payment states. |
| **MP-02** | My Card | Renders full-resolution digital card displaying verification QR code, download image utility, and Google Wallet setup. |
| **MP-03** | Consultations | Reverse-chronological historical clinic log highlighting clinical remarks and linked medication dispense files. |
| **MP-04** | Dependants | Interface to provision and track linked family accounts matching active plan rules. |
| **MP-05** | Debit Orders | Monitors history of monthly collections and allows bank field modifications protected by step-up SMS authorization. |
| **MP-06** | Appointments | Calendar request utility allowing members to apply for clinic visits and monitor status logs. |
| **MP-07** | Payments | Holds temporary placeholder for oncoming credit card checkout processing tools (*Coming Soon*). |
| **MP-08** | Upgrade Plan | Selection interface visualizing available plan options, highlighting current plan stats, and handling upgrade requests. |
| **MP-09** | Statement | Overlay modal assembling real-time account parameters, billing records, and clinical occurrences into a printable layout. |
| **MP-10** | KYC Verification | Document compliance ingestion terminal for FICA items (SA ID, Proof of Address, Income Payslip, Bank Statement). |
| **MP-11** | Clinic Info | Reference screen detailing operating hours, facility contact channels, map coordinates, and included membership features. |
| **MP-12** | Profile | Configuration dashboard tracking personal identity details, active contact records, and active banking profiles. |
| **MP-13** | POPIA Consent | Initial login onboarding modal capturing explicit statutory privacy consent across mandatory checkboxes. |

### 10.2 Staff Portal (7 Pages)

| Page ID | Page Name | Summary & Functional Description |
| :--- | :--- | :--- |
| **SP-01** | Dashboard | Operational display streaming real-time KPI boxes, risk validation alert text, check-in logs, and flagged rows. |
| **SP-02** | Verify Member | Front-desk lookup page processing structural strings (ID, phone, card) or parsing digital QR passes using video cameras. |
| **SP-03** | Applications Log | Read-only workspace reflecting submitted registration files and active approval status markers. |
| **SP-04** | Appointments | Operations tracking board detailing clinic appointments, status adjustments, and expansion sub-rows. |
| **SP-05** | Consultations | Chronological clinical visit registry displaying medication flags and active system flags. |
| **SP-06** | Medication Register | Ingestion workspace to capture medication dispensing logs, browse inventory descriptions, and evaluate flag statuses. |
| **SP-07** | Peak Hours | Management reporting view delivering analytics on customer volumes separated by operational hours and business days. |

### 10.3 Admin Portal (19 Pages)

| Page ID | Page Name | Summary & Functional Description |
| :--- | :--- | :--- |
| **AP-01** | Dashboard | Core display aggregate visualising membership volumes, gross monthly revenue scales, plan split donuts, and platform activity logs. |
| **AP-02** | Members | Central master identity table supporting advanced search filters, data adjustments, and manual profile generation. |
| **AP-03** | Applications | Operational checkouts allowing staff to evaluate, authorize, or reject incoming retail or corporate membership files. |
| **AP-04** | Onboarding | Stage-by-stage wizard monitoring setup metrics for freshly compiled accounts. |
| **AP-05** | Appointments | Master calendar control panel tracking cross-platform appointments, supervisor overrides, and spreadsheet exporting tools. |
| **AP-06** | Mandates | Administrative ingestion screen logging NAEDO/DebiCheck compliance mandate documents linked to individual member IDs. |
| **AP-07** | KYC Queue | Compliance review queue displaying user-uploaded FICA documents for operator verification or resubmission triggers. |
| **AP-08** | Cards | Allocation console provisioning individual membership card identifiers following corporate format algorithms. |
| **AP-09** | Cards Gallery | Visual database rendering high-resolution previews of issued passes with bulk archival ZIP exporting options. |
| **AP-10** | Debit Orders | Master transaction ledger tracking monthly collection sequences, payment status codes, and execution controls. |
| **AP-11** | Reconciliation | Financial auditing display tracing variance indicators between projected cash expectations and concrete banking returns. |
| **AP-12** | Plan Changes | Processing dashboard mapping user tier-modification requests requiring manual authorization. |
| **AP-13** | Cross-Sell Pipeline | Sales funnel monitoring existing accounts matching data metrics for tier expansion or complementary product sales. |
| **AP-14** | Audit Log | Immutable event-tracking hub streaming cross-platform operational, financial, and compliance changes every 15 seconds. |
| **AP-15** | Retention Report | Analytical performance dashboards modeling user cancellation trends, cohort lifespan metrics, and churn indicators. |
| **AP-16** | Reports & Exports | Modular compilation workspace building tailor-made business reports filterable by variables and structural parameters. |
| **AP-17** | Integrations | Operations console tracking credentials, cryptographic keys, and live connection health for external microservices. |
| **AP-18** | POPIA Register | Auditable compliance ledger capturing user privacy approvals, digital signatures, and IP logs for statutory audits. |
| **AP-19** | Signed Agreements | Secure storage workspace housing e-signed user contracts linked across identity profiles. |

---

## 11. Design & UX Specifications

### 11.1 Brand Colours

### Table 10: Platform Colour Palette

| Name | Hex Code | System Application & Usage |
| :--- | :--- | :--- |
| **Navy Dark** | `#0D1B2A` | Primary navigation sidebar background, membership card background canvas, primary headings. |
| **Navy Mid** | `#1A2C42` | Secondary background wrappers, contextual widget cards background layout. |
| **Gold** | `#C9A84C` | Active navigation menu indicator line, plan tier text highlight on card, premium content accents. |
| **Teal** | `#1A7A6E` | Successful confirmation states, active interaction prompts, persistent WhatsApp elements, core CTAs. |
| **White** | `#FFFFFF` | Main dashboard core canvas background, readable text values inside dark headers. |
| **Light Gray** | `#F5F7FA` | Global application wrapper canvas background, form input layout wrappers. |
| **Text Gray** | `#64748B` | Secondary line text entries, subtitle wrappers, minor metadata notations. |
| **Red Alert** | `#DC2626` | Failure / error layout indicators, active risk badges, dashboard notification banners. |
| **Green OK** | `#16A34A` | Successful status indicators, verified transaction markers, approved step confirmations. |

### 11.2 Typography & Layout
- **Font Stack:** Standard clean system sans-serif font layout (Inter, Roboto, or equivalent); optimized for legibility at tight typography scales.
- **Structural Layout Grid:** Fixed dark navy left-hand navigation sidebar (width: `240px`) paired alongside an expanding main dashboard data workspace.
- **Responsive Adaptability:** Clean mobile scaling behaviors. Side navigation collapses into a mobile hamburger slide-out layout menu on compact touch screens, pushing content blocks to full-width proportions.
- **Card Styling UI:** Floating data cards utilize explicit white background colors enhanced with soft ambient drop-shadow properties positioned over the global light gray canvas.
- **Data Tables UI:** Tables deploy clean, minimal horizontal border separations. Alternating row zebra-striping is absent; column headers utilize heavy bold treatments.
- **Visual Status Badges:** Contextual status tracking relies on a color-coded status badge configuration matrix (`Confirmed`, `Completed`, `Flagged`, `Active`, etc.).

### 11.3 Branding Details
- **Corporate Logomark:** Top-left header displays the official `NFS INSURE` wordmark graphic accompanied by a building silhouette symbol. Sub-text reads: `[Clinic Name] \| [Portal Role]` (e.g., *Braam Health Centre · Member*).
- **Membership Card Pass Assets:** Dark navy backdrop carrying gold plan tier styling details, teal/white typography elements, and an offline scannable QR verification graphic block anchored to the bottom-right coordinate.
- **WhatsApp Integration Utility:** A persistent floating action button located on the bottom-right corner utilizing the official corporate green brand layout color.

---

## 12. Non-Functional Requirements

### Table 11: Non-Functional Requirements Matrix

| Requirement Tier | Technical Specification Details |
| :--- | :--- |
| **System Availability** | Minimum 99.9% application uptime service-level agreement (SLA); clinic modules function 24/7/365, necessitating constant database connectivity. |
| **System Performance** | Staff Portal `Verify Member` operational lookups must resolve in under 2 seconds; standard dashboard page components must load within 3 seconds. |
| **Data Synchronization** | Clinic staff dashboards run an automated background pull every 30 seconds; Administrative Audit Logs pull fresh items every 15 seconds. |
| **Data Lifecycle Retention** | Health records and billing transactions are preserved inside operational databases for a minimum 5-year statutory period (FICA & health data laws). |
| **Log Immutability** | System event records entering the Audit Log collection are completely unalterable; edit or remove query permissions are omitted across all user classes. |
| **Document Export Formats** | Generates CSV spreadsheets for Members lists, Audit Logs, and modular Reports; extracts accounts Statements into PDF formats. |
| **Mobile Web Adaptability** | Member Portal tools must remain fully interactive across small screens (including real-time QR generation, pass downloads, and support links). |
| **Offline Verification Mode** | Card QR assets carry necessary encryption keys allowing receptionist scanners to pull identity strings without needing internet connections. |
| **Multi-Clinic Tenancy** | Core database schemas utilize multi-tenant scoping filters, allowing an identical system instance to host independent clinic nodes. |

---

## 13. Glossary

### Table 12: Glossary of Terms

| Terminology Token | Definition and Regulatory Scope |
| :--- | :--- |
| **POPIA** | Protection of Personal Information Act (Republic of South Africa, Act No. 4 of 2013). |
| **FICA** | Financial Intelligence Centre Act (Republic of South Africa, Act No. 38 of 2001). |
| **KYC** | Know Your Customer; file-based confirmation verifying consumer identity, residence records, and regular financial income structures. |
| **NAEDO** | Non-Authenticated Early Debit Order; traditional financial routing protocol utilized for South African bank collection management. |
| **DebiCheck** | Modern electronic debit order authentication framework managed by PASA for South African consumer bank networks. |
| **FSCA** | Financial Sector Conduct Authority (Republic of South Africa regulatory body). |
| **FSP** | Financial Services Provider; statutory operating license issued by the FSCA. |
| **NCA** | National Credit Act; statutory legal framework regulating affordability metrics and consumer financial assessments. |
| **QR Code** | Quick Response matrix bar code graphic asset carrying token data strings parsed instantly by reception capture cameras. |
| **Step-Up Challenge** | Contextual secondary identity challenge forcing user inputs (SMS OTP) to approve sensitive profile actions. |
| **Collection Mandate** | Formal signed legal authorization artifact enabling monthly subscription collection processing loops under DebiCheck standards. |
| **Card Number Code** | System-generated unique identifier adopting standard sequence parameters: `NFS[clinic-code][7-digit-number]`. |
| **Membership Plan Tier** | System account classification mapping billing costs, monthly clinic consult allowances, and aggregate family member counts. |
| **Flagged Status** | Special state indicator identifying an abnormal medical consultation or medication dispensing line for managerial review. |

---
*NFS Insure Consultant (Pty) Ltd \| Authorised FSP No. 53910, regulated by the FSCA* *Eagle Canyon Office Park, Cnr Christiaan De Wet & Dolfyn St, Randpark Ridge, 2154* *Platform Specification v1.0 — 24 May 2026. All data processed in strict compliance with POPIA.*
