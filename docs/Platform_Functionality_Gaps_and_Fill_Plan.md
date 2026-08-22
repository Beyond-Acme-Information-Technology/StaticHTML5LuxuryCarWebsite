# Luxury Car Services Platform — Gap Findings & Fill Plan

**Date:** 21 August 2026  
**Compared:** *Luxury Car Services Platform — Functionality Summary* vs built site (`StaticHTML5LuxuryCarWebsite` on `main`, commit `e62a5df`)  
**Related:** `Awesome_Luxury_Services_Technical_Review_and_Enhancement_Guide.md` (v1.5, §8) · Cursor canvas `platform-functionality-gap-plan.canvas.tsx`

---

## 1. Executive finding

The Functionality Summary describes **three products** (Admin Console, Driver & Fleet Partner App, Customer App) plus shared payments, security, messaging, support, and a full database.

What is built today is **one web SPA** for Awesome Luxury Services Group: marketing pages, Book Online, Contact, staff inbox, Stripe test Checkout, chauffeur roster (save/list/assign), browser chauffeur trip statuses, and live GPS map while a trip is active.

| Layer | Rough coverage | Verdict |
|---|---|---|
| Admin Console | ~25% | Partial staff dispatch; not a full admin console |
| Driver & Fleet Partner | ~30% | Single-company chauffeur portal; no fleet marketplace |
| Customer App | ~35% | Web booking + My Account; not a full consumer app |
| Shared / Database | ~20% | Leads-centric store; not the summary’s core schema |

**Rule:** Close website gaps that block paid trips first. Do not start marketplace / native-app work until Phase A is done and bookings are live.

---

## 2. What is already in place

Use this as the baseline so fill work does not rebuild working pieces.

### Admin (Staff Inbox)

- View leads; set status (`new` → `closed`, including `accepted` / `confirmed`)
- Accept quote → Stripe Checkout link emailed
- Refunds; wait-time and damage extra charges
- Per-mile rates by country + ride category
- Chauffeur roster (name, phone, PIN); assign to accepted/confirmed booking
- Live map on booking while trip is live

### Driver (Login → Chauffeur)

- Phone + PIN sign-in
- Accept assigned trip; status ladder (on my way → on location → on board + luggage photo → drop-off GPS)
- GPS pings; guest message/call hooks

### Customer (site + My Account)

- Book Online (service type, vehicle, calendar, multi-route miles, stops, airports)
- Contact without a required quote
- Email OTP login; profile; trip list; public track link
- Stripe Checkout + thank-you (still **test mode**)

### Shared / data

- Brevo email; Stripe webhooks; Vercel env secrets
- Supabase: `leads`, client OTP/sessions/profiles, `pricing_rates`
- Chauffeur roster via `leads` fallback and/or optional `drivers` SQL
- Trip lifecycle on `leads.meta.trip`
- All-black Fleet gallery (Suburban, Escalade, party bus, etc.)

---

## 3. Gaps by area (findings)

### 3.1 Admin Console

| # | Gap | Summary expected | Status today |
|---|---|---|---|
| A1 | User management | Approve drivers, reset passwords, fleet subscriptions, customer profiles, bulk import/export, audit logs | Staff token + client OTP only |
| A2 | Pricing depth | City/state rates, cancel/no-show fees, add-on prices, surge, zone, corporate promos | Country + ride-category rates; wait/min; staff extras |
| A3 | Dispatch automation | Auto-dispatch, fleet-partner jobs, multi-stop optimize, emergency reassign | Manual assign only |
| A4 | GPS advanced | ETA, geofencing, historical playback, demand heat maps | Live ping map only |
| A5 | Payouts & invoices | Driver compensation, payouts, invoices, tax docs, payment schedules | Guest pay + staff refund only |
| A6 | Reporting | Ops metrics, performance, revenue, custom/exportable reports | Inbox list only |

### 3.2 Driver & Fleet Partner App

| # | Gap | Summary expected | Status today |
|---|---|---|---|
| D1 | Registration & compliance | Self-signup, license/insurance docs, Checkr, expiry alerts | Staff creates chauffeur |
| D2 | Fleet subscriptions | Tiered plans, renewals, failed-payment recovery | Not built |
| D3 | Trip execution extras | Decline job, turn-by-turn nav, digital signature, offline completion, arrival/drop-off photos beyond luggage | Status + GPS + luggage photo + email message |
| D4 | Fleet management | Multi-vehicle/drivers, internal assign, maintenance, shifts, utilization | Single roster |
| D5 | Earnings | Earnings ledger, forecast, goals | Assigned trip list only |
| D6 | Native / reliable mobile | Dedicated mobile apps | Mobile browser only |

### 3.3 Customer App

| # | Gap | Summary expected | Status today |
|---|---|---|---|
| C1 | Booking extras | Saved places, recurring trips, multi-leg planner, live flight tracking | Book Online covers core one-shot trips |
| C2 | Price negotiation | Budget, suggestions, negotiate, bids, packages | Fixed quote → staff accept |
| C3 | Add-on catalog | Costume, red carpet, champagne, WiFi, music, events as SKUs | Marketing copy only |
| C4 | Trip management | Mid-ride stops, guest cancel/reschedule, share status, traffic preview, rich notifications | Track link + some emails |
| C5 | Payments depth | Saved methods, split pay, Apple/Google Pay, payment plans | Checkout (test); no wallets/split/plans |
| C6 | Native customer app | iOS/Android | Web only |

### 3.4 Shared platform & database

| # | Gap | Summary expected | Status today |
|---|---|---|---|
| S1 | Multi-gateway | Stripe + PayPal + Square; Connect payouts; fraud suite | Stripe only (test) |
| S2 | Security depth | Full RBAC, OAuth/social, biometric, formal GDPR/CCPA DSAR | Token/OTP + leads RLS |
| S3 | Communication | In-app chat, push, SMS, SOS, multi-language | Email + `tel:` |
| S4 | Support product | Tickets, live chat, knowledge base, VIP priority | Contact form + phone |
| S5 | Core schema | Users, vehicles, trips, payments, subscriptions, documents, notifications, audit | Leads-centric; optional drivers |
| S6 | Realtime | WebSockets / SSE for live updates | Poll / refresh |

### 3.5 Known production bugs / ops (do first)

| # | Issue | Why it matters |
|---|---|---|
| B1 | Stripe still test mode | Guests cannot pay real money |
| B2 | Chauffeur “Could not update trip” | Status changes fail after assign |
| B3 | Assign/save may need hard-refresh after deploy | Cache / deploy lag |
| B4 | No GPS 90-day purge | Retention requirement unmet |
| B5 | Route on map after status change (requested) | Not built — plan before coding |

---

## 4. How to fill the gaps — one by one

Work top to bottom. Finish each item’s **Done when** before starting the next numbered item in that phase. Do not jump to Phase C while Phase A items are open.

---

### Phase A — Stabilize the live website (1–2 weeks)

Goal: paid trips work end-to-end for one fleet.

| Step | Fill this gap | How | Done when |
|---|---|---|---|
| **A-1** | B1 Live payments | Put live Stripe keys + webhook secret in Vercel; run one real $1–$5 Checkout; keep test keys out of git | Guest pays; booking becomes `confirmed`; thank-you + email fire |
| **A-2** | B2 Trip status update | Same pattern as assign fix: no read-only FS writes on Vercel; return clear API errors in chauffeur portal | Chauffeur can advance Accepted → On my Way → … → Dropped off |
| **A-3** | B3 Roster/assign reliability | Confirm Chauffeurs list after save; Assign trip on accepted/confirmed; optional `supabase/driver-ops.sql` | Staff assigns; guest gets assign email; chauffeur sees trip |
| **A-4** | C4 Guest cancel / no-show (minimum) | Staff actions + guest “request cancel” that emails/inbox-flags; Terms already prose | Staff can refund/cancel without hunting Stripe Dashboard only |
| **A-5** | B4 GPS retention | Scheduled purge or documented manual SQL for trip GPS older than 90 days | Policy in guide + job or runbook |
| **A-6** | B5 Route on map (design then build) | After A-2 works: overlay OSRM/Mapbox route from chauffeur GPS → pickup (then → drop-off). Prefer deep-link to Google/Apple Maps for turn-by-turn first | Chauffeur sees direction; guest/staff see path or “Open in Maps” |
| **A-7** | Ops visibility | Sentry (or Vercel log alerts) on `/api/chauffeur` and Stripe webhook failures | Failures visible without guessing |

**Exit Phase A:** One real paid trip assigned, driven through statuses, tracked, completed.

---

### Phase B — Single-fleet dispatch product (4–8 weeks)

Goal: stronger Admin + Driver + Customer **without** marketplace partners.

Do these **one by one** in order:

| Step | Fill this gap | How | Done when |
|---|---|---|---|
| **B-1** | S5 Trips schema | Add `trips` + `trip_stops`; migrate off `leads.meta.trip` | Assign/status/GPS use `trips` rows |
| **B-2** | A3 Reassign | Staff can change chauffeur on an active trip; notify old + new | Emergency reassign works |
| **B-3** | D3 Decline + photos | Driver can decline with reason; pickup/drop-off photo slots | Decline logged; photos on trip |
| **B-4** | D3 Navigation (practical) | “Navigate” button → Google/Apple Maps with pickup/drop-off coords | Chauffeur gets turn-by-turn without building a full nav engine |
| **B-5** | C1 Saved places | Customer profile: home/work/airport favorites | Prefill on Book Online |
| **B-6** | C3 Add-on catalog | `addons` + `trip_addons`; staff or guest select; priced on Checkout | Champagne/WiFi/etc. appear as line items |
| **B-7** | C4 Share + SMS | Share track link; Twilio SMS on assign / on the way / arrived | Guest gets SMS without only email |
| **B-8** | C5 Wallets | Enable Apple Pay / Google Pay on Stripe Checkout | Wallet options on Checkout |
| **B-9** | A6 Light reporting | Staff dashboard: trips today, revenue (Stripe), open leads | Export CSV of leads/trips |
| **B-10** | D3 Offline queue | Queue status/GPS posts when offline; flush on reconnect | Works on spotty cellular |

**Exit Phase B:** Dispatcher runs the day without spreadsheets; chauffeurs use PWA + Maps; guests get SMS and add-ons.

---

### Phase C — Marketplace platform (3–6 months)

Goal: match most of the Functionality Summary. **Start only if** you need multi-fleet partners or bidding.

Do these **one by one** (each is a mini-project):

| Step | Fill this gap | How | Done when |
|---|---|---|---|
| **C-1** | S2 / A1 RBAC | `users` + roles (admin, dispatcher, driver, fleet_manager, customer); JWT sessions; audit log table | Role-gated admin routes |
| **C-2** | D1 Onboarding | Driver self-signup; document upload; Checkr webhook; expiry alerts | Applicant → approved driver without staff typing PIN only |
| **C-3** | D2 / A5 Fleet partners | Subscriptions; Stripe Connect; commissions; partner payout | Partner receives payout for completed trips |
| **C-4** | D4 Fleet ops | Partner manages own drivers/vehicles; internal assign | Partner console live |
| **C-5** | C2 Negotiation | Implement Appendix F bid state machine | Guest budget → driver bid → lock |
| **C-6** | A2 Dynamic pricing | Surge / zone / time rules (`pricing_rules`) | Rates change by zone/time |
| **C-7** | S6 Realtime | WebSockets or SSE for maps and chat | Live updates without refresh |
| **C-8** | S3 Push + SOS | Push notifications; SOS to dispatch | SOS alert reaches staff |
| **C-9** | D6 / C6 Native apps | React Native or Flutter; App Store / Play staged rollout (Appendix J) | Driver + customer apps published |
| **C-10** | A4 / A6 Analytics | Playback, heat maps, custom reports | Ops can answer “where is demand?” |
| **C-11** | S4 Support | Tickets + knowledge base (or Intercom/Zendesk) | VIP queue optional |
| **C-12** | S1 Extra gateways | PayPal/Square only if Stripe is insufficient | Second gateway in production |

**Exit Phase C:** Summary’s three-app marketplace is substantially delivered.

---

## 5. One-by-one checklist (copy into issues)

### Phase A

- [ ] A-1 Live Stripe  
- [ ] A-2 Fix “Could not update trip”  
- [ ] A-3 Confirm save/list/assign after deploy  
- [ ] A-4 Guest cancel request + staff no-show/refund actions  
- [ ] A-5 GPS 90-day retention  
- [ ] A-6 Route / Maps plan then implement  
- [ ] A-7 API error monitoring  

### Phase B

- [ ] B-1 `trips` / `trip_stops`  
- [ ] B-2 Reassign chauffeur  
- [ ] B-3 Decline + extra photos  
- [ ] B-4 Navigate deep link  
- [ ] B-5 Saved places  
- [ ] B-6 Add-on catalog  
- [ ] B-7 Share track + SMS  
- [ ] B-8 Apple/Google Pay  
- [ ] B-9 Light reporting + CSV  
- [ ] B-10 Offline queue  

### Phase C (optional marketplace)

- [ ] C-1 RBAC + audit  
- [ ] C-2 Driver onboarding + Checkr  
- [ ] C-3 Connect + partner payouts  
- [ ] C-4 Partner fleet console  
- [ ] C-5 Price negotiation  
- [ ] C-6 Surge/zone pricing  
- [ ] C-7 WebSockets/SSE  
- [ ] C-8 Push + SOS  
- [ ] C-9 Native apps  
- [ ] C-10 Analytics / heat maps  
- [ ] C-11 Support tickets  
- [ ] C-12 Extra payment gateways  

---

## 6. Recommended next action

Start **A-1** and **A-2** in parallel (live Stripe + chauffeur trip update fix). Everything else in the Functionality Summary waits until those two pass a real trip.

---

*End of gap findings & fill plan.*
