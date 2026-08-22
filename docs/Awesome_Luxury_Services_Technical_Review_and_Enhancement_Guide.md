# Awesome Luxury Services Group — Technical Review & Enhancement Guide

**Document Version:** 1.5 (Review Edition)  
**Date:** August 21, 2026 (night)  
**Prepared for:** Awesome Luxury Services Group Development Team  
**Location:** San Francisco, CA / Burlingame office  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Critical Gaps & High-Priority Fixes](#2-critical-gaps--high-priority-fixes)
3. [Architecture & Technical Improvements](#3-architecture--technical-improvements)
4. [Business Logic & Feature Gaps](#4-business-logic--feature-gaps) — includes 4.5 website booking, 4.6 chauffeur ops, **4.7 fleet gallery**
5. [Operational & DevEx Improvements](#5-operational--devex-improvements)
6. [Suggested Document Restructure](#6-suggested-document-restructure)
7. [Quick-Win Action Items](#7-quick-win-action-items)
8. [**Platform Functionality Summary — gaps & fill plan**](#8-platform-functionality-summary--gaps--fill-plan)
9. [Appendix E: Expanded Database Schema](#appendix-e-expanded-database-schema)
10. [Appendix F: Price Negotiation State Machine & API](#appendix-f-price-negotiation-state-machine--api-specification)
11. [Appendix G: Risk Register](#appendix-g-risk-register)
12. [Appendix H: Secrets Management & Security Hardening](#appendix-h-secrets-management--security-hardening)
13. [Appendix I: Capacity Planning](#appendix-i-capacity-planning)
14. [Appendix J: Mobile Release & Rollback Strategy](#appendix-j-mobile-release--rollback-strategy)

---

## 1. Executive Summary

The Enhanced Requirements Document (v1.1) is the long-term **Luxury Car Services Platform** (native apps, bidding, fleet partners). The developed product is the **marketing + dispatch website** on `awesomeservicesgroups.com`.

**As of 21 Aug 2026 evening the website MVP is largely built:** Book Online, Contact without a quote, staff inbox, Stripe test Checkout, chauffeur roster (save + list), trip statuses, live maps, and an all-black fleet gallery (Suburban, latest Escalade, party bus). Remaining website work is **live Stripe keys**, operational retention, and hardening. Platform extras (negotiation, native apps, shifts, Checkr) stay later.

**Priority Themes:**
- 🔴 **Go live on payments:** Switch Stripe from test to live after a paid dry run
- 🟡 **Dispatch ops:** Optional `drivers` SQL tables; GPS 90-day purge; cancellation automation
- 🟢 **Later platform:** Bidding, fleet partners, native iOS/Android, WebSockets, `/api/v1`

---

## 2. Critical Gaps & High-Priority Fixes

### 2.1 Security: The Plain-Text Password Exposure
The hardcoded password `polo-raster-space-kneel` appears in Section 13 of the original document. **Action required:**
- Remove it entirely from all documentation
- Rotate all credentials that have appeared in shared documents
- Implement a formal **Secrets Management** architecture (see Appendix H)
- Mandate `.env` files never enter version control (add `.env*` to `.gitignore`)

### 2.2 Missing: Data Retention & Deletion Policies
GDPR/CCPA compliance is mentioned but lacks specifics. Recommended policy:

| Data Type | Active Retention | Archive | Purge |
|---|---|---|---|
| Trip GPS traces | 90 days | 1 year | After 1 year |
| Customer personal data | Account lifetime | 7 years post-deletion | After 7 years |
| Driver background checks | Active + 3 years | 7 years | After 7 years |
| Payment records | 7 years (IRS) | 10 years | After 10 years |
| Chat messages | Account lifetime | 2 years | After 2 years |

Implement a "Right to be Forgotten" workflow with admin approval for drivers with pending disputes.

### 2.3 No Disaster Recovery (DR) Plan Details
"Zero data loss" is stated but undefined. Add formal targets:
- **RPO (Recovery Point Objective):** < 5 minutes
- **RTO (Recovery Time Objective):** < 30 minutes
- **Strategy:** Multi-region Supabase replication (primary: us-west, standby: us-east)
- **Testing:** Automated backup restoration drills monthly
- **Failover:** DNS failover with health checks every 60 seconds

---

## 3. Architecture & Technical Improvements

### 3.1 Database Schema Enhancements
The existing schema covers core entities well but lacks support for several Phase 1–2 features. See **Appendix E** for the full SQL additions. Key missing elements:

| Missing Element | Why It Matters | Table Added |
|---|---|---|
| Multi-stop trips | Listed as feature; `trips` only supports single pickup/dropoff | `trip_stops` |
| Dynamic add-ons | Add-ons are hardcoded in categories | `addons`, `trip_addons` |
| Pricing rules engine | Surge/zone/time logic is described in prose only | `pricing_rules` |
| In-app messaging | Mentioned but no schema exists | `conversations`, `messages` |
| Driver shift tracking | Labor law compliance (especially CA) | `driver_shifts` |
| Fleet revenue sharing | Commission rates not modeled | `fleet_contracts` |
| Soft deletes | Audit/compliance requirement | `deleted_at` on all tables |

### 3.2 API Design: Pagination & Rate Limiting
All `GET /api/v1/*` list endpoints must specify:
- **Cursor-based pagination** (preferred over offset for real-time feeds)
  - `?limit=20` (max 100)
  - `?cursor=eyJpZCI6...` (base64-encoded last-seen ID + sort field)
- **Rate limiting tiers:**
  - Anonymous: 30 req/min
  - Customer: 100 req/min
  - Driver: 150 req/min
  - Fleet Manager: 200 req/min
  - Admin: 1000 req/min
- **API versioning strategy:** Document `/v1/` sunset policy (minimum 6 months notice, deprecation headers)

### 3.3 Real-Time: WebSocket Scalability
Supabase Realtime is suitable for MVP but may bottleneck at >10k concurrent drivers. Plan for:
- **Connection pooling:** Max 1 WebSocket per driver session
- **Fallback strategy:** Server-Sent Events (SSE) or long-polling when WebSocket fails
- **Message queuing:** Redis Streams for offline driver message buffering
- **Alternative vendors:** Evaluate Ably, Pusher, or AWS API Gateway WebSockets for Phase 3

---

## 4. Business Logic & Feature Gaps

### 4.1 Price Negotiation: Under-Specified
The negotiation feature is a key differentiator for luxury services but lacks formal rules. See **Appendix F** for the complete state machine and API specification. Core decisions needed:
- **Who has final authority?** Algorithm for 85–95% range; human dispatcher below 85%
- **Race condition prevention:** Lock trip for 60 seconds during active negotiation
- **Escrow timing:** Hold customer funds on bid submission, release on driver assignment

### 4.2 Fleet Partner: Missing Sub-Fleet & Permissions
Fleet partners often have complex organizational structures:
- Add **fleet-internal roles:** Fleet Admin, Dispatcher, Driver
- Support **multi-subsidiary billing** (parent fleet with child accounts)
- Model **revenue sharing rules** in `fleet_contracts` table (see Appendix E)
- **Commission tracking:** Deduct platform fee before payout; generate monthly commission statements

### 4.3 Driver Availability & Shift Management
Current `driver_profiles.availability_status` is insufficient for labor compliance:
- Drivers must log **shift start/end** (mandatory in CA for IC classification defense)
- **Break tracking:** Auto-enforce 30-min break after 5 hours online
- **Weekly hour caps:** Warn at 40 hours, hard cap at 60 hours (safety)
- **Shift-based availability:** Only dispatch to drivers with active shifts

### 4.4 Cancellation Logic: Edge Cases
The cancellation matrix covers customer-initiated cancellations but misses:
- **Driver-initiated cancellations:** Impact on driver rating (max 2 per week without penalty)
- **Force majeure:** Weather, vehicle breakdown — requires photo proof, no penalty
- **Partial cancellations:** Reduce passengers but keep trip (price adjustment workflow)
- **No-show by driver:** Automatic refund + credit + priority reassignment

### 4.5 Website booking, passenger types, and Stripe (marketing site)

The live site (`awesomeservicesgroups.com`) is the chauffeur intake product. It is not the full driver/GPS platform, but these rules apply there:

**Passenger / trip types**
- **Regular / luxury chauffeur** — airport, point-to-point, hourly, events, corporate
- **Non-urgent medical transport** — scheduled, non-emergency only. Not an ambulance. No lights/sirens, no clinical care
- **Patient and equipment** — passenger plus mobility/medical equipment (wheelchair, oxygen concentrator, etc.)

**Quote → staff accept → Stripe confirm**
1. **Book Online** requires pickup, drop-off, optional stops, and a calculated quote. **Contact Us does not require a quote** — guests can send a message with optional trip notes
2. Driving miles are calculated; **Book Online offers multiple route options** (fastest plus alternates). Guest picks one; price follows that route’s miles
3. Staff **Accept** locks the quote and emails a Stripe Checkout link
4. Payment success sets the booking to **confirmed**
5. Staff can **refund** a paid trip in Stripe (cancellation)
6. Staff can add **wait time** (minutes × wait/minute rate) or **damage** extra Checkout charges
7. After accept/pay, staff **assign a chauffeur** from Staff inbox → Chauffeurs (see 4.6)

**Admin rates (by country)**
Staff inbox → **Per-mile rates**. Enter dollars (e.g. `4.50`). Stored as cents. Country is ISO-2 from the pickup geocode (`US`, `CA`, `GB`). Suggested US starting points:
- Regular: $45 base, $4.50/mi, $15/stop, $1.50 wait/min
- Non-urgent medical: $65 base, $5.25/mi, $20/stop, $2.00 wait/min
- Patient + equipment: $85 base, $6.50/mi, $25/stop, $2.50 wait/min

Adjust after a week of actual Bay Area trips. Add a row per country when you start serving outside the US.

**Stripe**
Test-mode keys only in Vercel / `.env.local`. Never commit secrets. Use Stripe Checkout. Rotate any key that was pasted into chat or Word.

### 4.6 Driver operations, trip statuses, and live maps (required)

The original platform guide mentioned drivers, GPS traces, and messaging at a high level (schema, shifts, SOS). It did **not** specify the chauffeur phone UI, admin driver roster, or guest/staff live map. Those are now required for Awesome Luxury Services dispatch.

**Admin (Staff inbox → Chauffeurs)**
- Enter driver information: name, phone, email, vehicle, license number, notes, active flag
- Set a 4–6 digit PIN (hashed at rest). This is how the chauffeur signs in
- Assign a chauffeur to an **accepted** or **confirmed** booking
- Watch the trip live on a map until drop-off

**Chauffeur app (Login → Chauffeur, mobile browser for MVP; native app later)**

| Step | Status | Required actions |
|---|---|---|
| Dispatch assigns ride | `assigned` | Guest is emailed chauffeur name + future track link |
| Driver accepts | `accepted` | Required before moving |
| On my Way | `on_my_way` | Live GPS pings start; guest and staff see the map |
| On Location | `on_location` | **GPS capture** at pickup. Driver may **message in-app** (email + trip thread) and **call** the guest |
| Customer picked up | `on_board` | **Luggage photo** via the phone camera in the app |
| Drop-off | `completed` | **GPS capture** at drop-off. Live map **ends** for staff and guest |

**Live tracking**
- While status is `on_my_way`, `on_location`, or `on_board`, chauffeur GPS is stored and shown on OpenStreetMap to **staff** (inbox) and **customer** (My Account + `/#/track?t=…`)
- Tracking **stops when the trip ends** (`completed`). Historical last point may remain for audit
- GPS traces follow 2.2 retention (90 days operational, then archive/purge)

**Persistence**
- Preferred: run `supabase/driver-ops.sql` (`drivers`, `driver_sessions`)
- Required for production: roster must **save and list** without a blank Chauffeurs tab. If those tables are missing, store the roster on the existing `leads` table (`type = chauffeur_roster`) so Vercel can persist chauffeurs
- Trip lifecycle for the website MVP lives on `leads.meta.trip` until the full `trips` / `trip_stops` schema from Appendix E is built
- PIN is 4–6 digits, hashed at rest. Phone is 10 digits

**Not a substitute for the native driver app in Appendix J.** This is the Phase 6 website MVP so dispatch can run without waiting for App Store review.

### 4.7 Fleet gallery (marketing site)

The public Fleet page and Book Online vehicle list must match the real all-black fleet.

| Vehicle | Kind | Seats | Notes |
|---|---|---|---|
| Mercedes-Benz S-Class | Executive sedan | 3 | Black sedan |
| BMW 7 Series | Luxury sedan | 3 | Current-generation black 7 Series |
| Chevrolet Suburban | Full-size SUV | 7 | Replaces Audi A8 |
| Range Rover Autobiography | Luxury SUV | 6 | Black |
| Tesla Model S | Electric luxury | 4 | Black Model S, not a white Model 3 |
| Cadillac Escalade ESV | Executive SUV | 7 | Latest generation, all black |
| Party Bus | Nightlife / events | 22 | Black luxury coach |

Photos must show the named vehicle in **black**. Do not use sports coupes, grey RS 7s, white Teslas, or unrelated stock (office meetings). Prefer owned photos for Suburban, Escalade, and party bus. Host fleet images on the site (`/fleet/…`) so Unsplash 404s cannot blank the gallery.

---

## 5. Operational & DevEx Improvements

### 5.1 Testing: Missing Contract Testing
Beyond unit, integration, and E2E tests, add:
- **Consumer-driven contract testing** (Pact) between frontend and backend
- **Mobile device farm testing** via BrowserStack or AWS Device Farm (critical for biometric auth and background location)
- **Chaos engineering:** Simulate Supabase outage, Stripe latency, GPS drift

### 5.2 Monitoring: Missing Business Alerts
Technical alerting is covered; add business-critical alerts:
- **Fraud detection:** >5 bookings from same card in 10 minutes
- **Driver safety:** SOS button activation, off-route >5 min, sudden stop
- **Revenue anomalies:** >20% drop in trip completion rate by zone (hour-over-hour)
- **Driver supply:** <3 available drivers in high-demand zone for >15 minutes

### 5.3 Documentation: Architecture Decision Records (ADRs)
For a project of this complexity, document *why* key choices were made:
- Why Supabase over Firebase or custom Node.js/PostgreSQL?
- Why React Native/Flutter over pure native Swift/Kotlin?
- Why Stripe over Adyen (common in European luxury markets)?
- Why cursor-based pagination over offset?

Store ADRs in `/docs/adr/NNN-title.md` using the standard template.

---

## 6. Suggested Document Restructure

Consider elevating these to **top-level sections** in the master requirements document:

| New Section | Content |
|---|---|
| **16. Risk Register** | Top 10 risks with likelihood, impact, mitigation, and owner |
| **17. Capacity Planning** | Expected load per phase and infrastructure scaling triggers |
| **18. Mobile Release Strategy** | App store timelines, staged rollout, rollback plan |
| **19. Third-Party SLA Summary** | Stripe, Checkr, Twilio uptime and failure impact |
| **20. Accessibility (a11y) Requirements** | WCAG 2.1 AA checklist per interface |

---

## 7. Quick-Win Action Items

Website (this week):

1. [ ] **Switch Stripe from test to live** after one successful test-mode Checkout
2. [ ] **Hard-refresh production** (`Ctrl+F5`) so Fleet photos and chauffeur save are not served from cache
3. [x] **Chauffeur roster save + list** on Vercel (leads-table fallback if `drivers` SQL is not run)
4. [x] **Fleet gallery:** all black; Suburban instead of Audi A8; latest Escalade; party bus photos hosted at `/fleet/`
5. [x] **Contact Us without a mileage quote**
6. [ ] *(Optional)* Run `supabase/driver-ops.sql` for dedicated `drivers` / `driver_sessions` tables

Later platform (not blocking bookings):

7. [ ] Add Appendix E tables (`trip_stops`, `addons`, `pricing_rules`, messaging, `driver_shifts`, `fleet_contracts`)
8. [ ] Negotiation state machine (Appendix F) — not used on the marketing site
9. [ ] Rotate any credential that still appears in old Word/docs
10. [ ] GPS 90-day purge; MFA; Sentry; automated tests
11. [ ] Native iOS/Android (Appendix J)

---

## 8. Platform Functionality Summary — gaps & fill plan

Compared against the **Luxury Car Services Platform — Functionality Summary** (Admin Console, Driver & Fleet Partner App, Customer App, shared payments/security/comms/support, core tables). Full write-up with one-by-one fill steps: **`Platform_Functionality_Gaps_and_Fill_Plan.md`**. Interactive matrix: Cursor canvas `platform-functionality-gap-plan.canvas.tsx`.

### 8.1 Coverage snapshot (built website vs summary)

| App / layer | Rough coverage | What exists | Biggest gaps |
|---|---|---|---|
| Admin Console | ~25% | Staff inbox, rates, assign chauffeur, live map, refunds/extras | User admin, auto-dispatch, analytics, payouts, fleet partners |
| Driver / Fleet | ~30% | Phone+PIN portal, trip statuses, GPS, luggage photo, guest message | Self-signup, Checkr, docs, turn-by-turn, earnings, fleet orgs |
| Customer | ~35% | Book Online, Contact, My Account OTP, track link, Stripe Checkout (test) | Negotiation, add-on catalog, wallets, recurring, flight track, native |
| Shared / DB | ~20% | Brevo email, Stripe webhooks, leads + pricing_rates (+ optional drivers) | WebSockets, Twilio, SOS, tickets, trips/vehicles/users tables |

### 8.2 Fill plan (ordered)

**Phase A — Stabilize live site (1–2 weeks)**  
Live Stripe keys; fix chauffeur “Could not update trip”; confirm assign/list after deploy; guest cancel/reschedule + no-show actions; GPS retention; optional route-on-map after status change (plan before build).

**Phase B — Single-fleet dispatch product (4–8 weeks)**  
First-class `trips` / `trip_stops`; reassign; driver PWA (decline, Maps deep link, offline); customer saved places / share track / Twilio SMS / add-on SKUs; Apple/Google Pay via Checkout.

**Phase C — Marketplace platform (3–6 months)**  
RBAC users; driver self-onboarding + Checkr; fleet partner subscriptions + Stripe Connect; price negotiation (Appendix F); native apps + push + SOS; analytics and support tickets.

**Decision rule:** Finish Phase A and take paid bookings before Phase B. Start Phase C only if the business needs multi-fleet partners and bidding — not required for Awesome Luxury Services as a single Burlingame fleet.

---

# Appendices

---

## Appendix E: Expanded Database Schema

*Add these tables to Section 6 of the master requirements document alongside the existing schema.*

```sql
-- ============================================
-- Multi-stop support for trips
-- ============================================
CREATE TABLE trip_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  sequence INT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT,
  arrival_time TIMESTAMP WITH TIME ZONE,
  departure_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'arrived', 'completed', 'skipped')),
  proof_photo_url TEXT,
  signature_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(trip_id, sequence)
);

-- ============================================
-- Dynamic add-on catalog (replaces hardcoded categories)
-- ============================================
CREATE TABLE addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('luxury', 'entertainment', 'comfort', 'special', 'business')),
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  price_type VARCHAR(20) DEFAULT 'flat' CHECK (price_type IN ('flat', 'per_mile', 'per_minute', 'per_trip')),
  currency TEXT DEFAULT 'USD',
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  requires_admin_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- Link add-ons to trips
-- ============================================
CREATE TABLE trip_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  addon_id UUID REFERENCES addons(id),
  quantity INT DEFAULT 1,
  negotiated_price DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
  added_by VARCHAR(20) DEFAULT 'customer' CHECK (added_by IN ('customer', 'driver', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- Pricing rules engine (surge, zone, time-based)
-- ============================================
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rule_type VARCHAR(30) NOT NULL CHECK (rule_type IN ('surge', 'time_based', 'zone_based', 'minimum_fare', 'corporate_discount')),
  priority INT DEFAULT 0,
  conditions JSONB NOT NULL DEFAULT '{}',
  multiplier DECIMAL(4,2) DEFAULT 1.00,
  flat_adjustment DECIMAL(10,2) DEFAULT 0.00,
  active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  days_of_week INT[],
  start_time TIME,
  end_time TIME,
  geofence GEOGRAPHY(POLYGON, 4326),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

/*
Example conditions JSONB:
-- Surge: {"min_demand": 10, "max_supply": 3, "area": "downtown_sf"}
-- Time-based: {"peak_hours": true, "holiday_multiplier": false}
-- Zone-based: {"zone_id": "airport_sfo", "entry_fee": 15.00}
*/

-- ============================================
-- In-app messaging
-- ============================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'driver', 'admin', 'system')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location', 'system_alert')),
  content TEXT,
  media_url TEXT,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- Driver shift & labor compliance
-- ============================================
CREATE TABLE driver_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  break_duration_minutes INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'auto_ended')),
  total_trips INT DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  ended_reason VARCHAR(20) DEFAULT 'manual' CHECK (ended_reason IN ('manual', 'timeout', 'system', 'violation')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- Fleet partner commission & revenue sharing
-- ============================================
CREATE TABLE fleet_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id UUID REFERENCES users(id) ON DELETE CASCADE,
  commission_rate DECIMAL(4,2) NOT NULL,
  payment_terms_days INT DEFAULT 7,
  contract_start DATE NOT NULL,
  contract_end DATE,
  auto_renew BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- Soft delete support (add to ALL existing tables)
-- ============================================
-- ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
-- ALTER TABLE trips ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
-- ALTER TABLE vehicles ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
-- ALTER TABLE payments ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
-- ALTER TABLE subscriptions ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
-- ALTER TABLE documents ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- Performance indexes
-- ============================================
CREATE INDEX idx_trip_stops_trip ON trip_stops(trip_id, sequence);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(active, rule_type, priority DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, sent_at DESC);
CREATE INDEX idx_driver_shifts_driver ON driver_shifts(driver_id, started_at DESC);
CREATE INDEX idx_fleet_contracts_fleet ON fleet_contracts(fleet_id, status);
CREATE INDEX idx_addons_category ON addons(category, active);
CREATE INDEX idx_trip_addons_trip ON trip_addons(trip_id, status);
```

---

## Appendix F: Price Negotiation State Machine & API Specification

*Insert after Section 7 (API Specification) as a dedicated subsection.*

### F.1 Negotiation Lifecycle

```
[PENDING] ──customer_bid──> [UNDER_REVIEW]
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
  [COUNTER_OFFER]         [AUTO_ACCEPTED]          [REJECTED]
         │                       │
    customer_response           │
    ┌────┴────┐                │
    ▼         ▼                ▼
[ACCEPTED] [DECLINED]    [CONFIRMED]
    │                          │
    └──────────┬───────────────┘
               ▼
         [EXPIRED]  <─── timeout on any state (> 10 min)
               │
               ▼
         [CANCELLED]
```

### F.2 Business Rules

| Rule | Value |
|---|---|
| Customer bid timeout | 10 minutes |
| Counter-offer timeout | 10 minutes |
| Minimum price floor | 80% of algorithm-estimated fare |
| Auto-accept threshold | Bid ≥ 95% of estimated fare |
| Admin approval required | Bid < 85% of estimated fare |
| Max negotiation rounds | 3 per trip |
| Lock duration | Trip locked for 60 seconds during active negotiation |

### F.3 API Endpoints

```text
POST   /api/v1/trips/{trip_id}/negotiate           # Customer initiates bid
GET    /api/v1/trips/{trip_id}/negotiation         # View current negotiation state
POST   /api/v1/trips/{trip_id}/negotiate/counter   # System/driver counters
POST   /api/v1/trips/{trip_id}/negotiate/accept    # Customer accepts counter
POST   /api/v1/trips/{trip_id}/negotiate/decline   # Customer declines
POST   /api/v1/trips/{trip_id}/negotiate/cancel    # Either party cancels
```

### F.4 Request/Response Examples

**Initiate Bid:**
```http
POST /api/v1/trips/{trip_id}/negotiate
Content-Type: application/json

{
  "proposed_fare": 145.00,
  "currency": "USD",
  "reason": "Corporate rate request",
  "justification": "Weekly recurring booking"
}
```

```json
HTTP/1.1 201 Created
{
  "negotiation_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "under_review",
  "proposed_fare": 145.00,
  "estimated_fare": 160.00,
  "minimum_acceptable": 128.00,
  "expires_at": "2026-08-21T15:22:00Z",
  "round": 1,
  "max_rounds": 3,
  "requires_admin_approval": false
}
```

**System Counter-Offer:**
```http
POST /api/v1/trips/{trip_id}/negotiate/counter
Content-Type: application/json

{
  "negotiation_id": "550e8400-e29b-41d4-a716-446655440000",
  "counter_fare": 152.00,
  "message": "Best available rate for this vehicle class"
}
```

```json
HTTP/1.1 200 OK
{
  "negotiation_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "counter_offer",
  "counter_fare": 152.00,
  "previous_bid": 145.00,
  "expires_at": "2026-08-21T15:32:00Z",
  "round": 2,
  "max_rounds": 3
}
```

**Admin Approval Required:**
```json
HTTP/1.1 202 Accepted
{
  "status": "pending_admin_approval",
  "message": "Your bid is below the automated threshold and requires manual review.",
  "estimated_review_time": "15 minutes"
}
```

### F.5 WebSocket Events

```text
negotiation.created
negotiation.counter_offered
negotiation.accepted
negotiation.expired
negotiation.requires_admin_approval
negotiation.cancelled
negotiation.confirmed
```

### F.6 Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `NEGOTIATION_CLOSED` | 409 | Trip already has a confirmed negotiation |
| `BELOW_MINIMUM_FLOOR` | 422 | Bid below 80% of estimated fare |
| `MAX_ROUNDS_REACHED` | 409 | 3 rounds already completed |
| `NEGOTIATION_EXPIRED` | 410 | Previous offer timed out |
| `TRIP_LOCKED` | 423 | Another negotiation in progress |

---

## Appendix G: Risk Register

*Insert as new Section 16 in the master requirements document.*

| ID | Risk | Likelihood | Impact | Score | Mitigation Strategy | Owner |
|---|---|---|---|---|---|---|
| R01 | **Driver supply shortage** during launch | High | Critical | 12 | Pre-sign 50+ drivers before go-live; offer guaranteed minimum earnings for first 30 days; partner with existing limo companies | Operations |
| R02 | **Chargeback fraud** on luxury trips ($500+) | Medium | High | 8 | Require 3D Secure on all transactions >$200; hold funds 24h for first-time customers; flag transactions with mismatched billing ZIP | Finance |
| R03 | **Regulatory change** (CA AB5 reclassification) | Medium | Critical | 8 | Legal review of driver IC vs employee classification; maintain flexible contract templates; budget 15% contingency for wage reclassification | Legal |
| R04 | **GPS/location data breach** | Low | Critical | 4 | Encrypt location at rest (AES-256); purge historical traces after 90 days; strict RLS policies; annual penetration testing | Security |
| R05 | **Stripe account suspension** | Low | High | 4 | Maintain PayPal as hot failover; keep 30-day operating reserve in secondary account; maintain <1% chargeback ratio | Finance |
| R06 | **App store rejection** (iOS background location) | Medium | Medium | 6 | Submit "Purpose String" early; use TestFlight beta; prepare video demo for Apple review; comply with iOS 17+ location privacy requirements | Mobile Lead |
| R07 | **Surge pricing backlash** (negative press) | Medium | Medium | 6 | Cap surge at 2.5x; require in-app confirmation with explicit price display; publish transparent pricing policy; proactive customer communication | Marketing |
| R08 | **Fleet partner churn** (competitor poaching) | Medium | High | 8 | Annual contracts with early-termination penalties; dedicated partner success manager; quarterly business reviews; volume-based loyalty bonuses | BD |
| R09 | **Database performance degradation** at 50k+ users | Medium | High | 8 | Connection pooling (PgBouncer); read replicas; aggressive Redis caching; database sharding plan ready; query optimization reviews | Backend |
| R10 | **Driver safety incident** (accident/assault) | Low | Critical | 4 | Real-time SOS button; automatic trip sharing with emergency contact; $2M insurance coverage; 24/7 safety hotline; incident response playbook | Safety |

**Risk Scoring Matrix:**
- Likelihood: Low (1), Medium (2), High (3)
- Impact: Low (1), Medium (2), High (3), Critical (4)
- **Score = Likelihood × Impact**
- **Score ≥ 6:** Requires executive review and documented contingency plan
- **Score ≥ 8:** Requires board notification and quarterly re-evaluation

---

## Appendix H: Secrets Management & Security Hardening

*Replace Section 13 of the master requirements document with this hardened version.*

### H.1 Secrets Management Architecture

| Environment | Tool | Access Method |
|---|---|---|
| Local Development | Doppler or 1Password CLI | `doppler secrets` injection at runtime |
| CI/CD Pipeline | GitHub Actions Secrets + Doppler | Ephemeral injection at build time; no secrets in build artifacts |
| Staging | AWS Secrets Manager | IAM role-based access; automatic rotation every 30 days |
| Production | HashiCorp Vault or AWS Secrets Manager | Certificate-based auth; audit logging; no env vars on disk |

### H.2 Mandatory Security Rules

1. **No plaintext secrets** in repositories, documentation, Slack, or email
2. **Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`) never exposed to frontend or mobile clients
3. **JWT Secret** rotated every 90 days; maintain active/previous key pair for zero-downtime rotation
4. **Database URL** uses IAM auth or certificate-based auth in production; no hardcoded passwords
5. **Stripe webhook secrets** verified with `stripe.webhooks.constructEvent()` before processing
6. **All secrets** injected at runtime; never committed to `.env` files in production
7. **Audit trail** for all secret access (who, when, which environment)

### H.3 Supabase Hardened Configuration

```yaml
# supabase/config.toml (production)
[db]
pooler_port = 6543
max_connections = 200

[auth]
site_url = "https://luxury.example.com"
additional_redirect_urls = [
  "https://luxury.example.com/callback",
  "https://admin.luxury.example.com/callback"
]
jwt_expiry = 3600
enable_signup = true
mfa_enabled = true
mfa_enforced_roles = ["admin", "fleet_manager"]

[auth.email]
enable_signup = true
enable_confirmations = true
double_confirm_changes = true
max_verification_emails_per_hour = 5

[auth.sms]
enable_signup = true
template = "confirm-phone"
max_frequency = "5 per hour"

[storage]
max_file_size = "10MB"
allowed_mime_types = ["image/*", "application/pdf"]
virus_scan_enabled = true

[realtime]
enabled = true
max_connections = 10000

[db.security]
rls_enforced = true
enable_prepared_statements = true
```

### H.4 Environment Variables Template

```bash
# .env.example — SAFE TO COMMIT (contains no real values)
# Copy to .env.local and populate via Doppler/AWS Secrets Manager

# Supabase
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=pk_test_...
SUPABASE_SERVICE_ROLE_KEY=sk_test_... # NEVER expose to frontend
DATABASE_URL=postgresql://...

# Payments
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Maps
MAPS_API_KEY=...

# Monitoring
SENTRY_DSN=https://...

# JWT
JWT_SECRET=<generate-via-openssl-rand-base64-64>
JWT_EXPIRY=3600
REFRESH_TOKEN_EXPIRY=604800

# Communication
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
SENDGRID_API_KEY=...
```

**Key Generation:**
```bash
# Generate a 512-bit secret
openssl rand -base64 64

# Generate Stripe webhook secret locally for testing
stripe listen --forward-to localhost:3000/webhooks/stripe
```

### H.5 Security Checklist (Pre-Launch)

- [ ] All secrets migrated to Doppler/Vault; no plaintext in repo
- [ ] RLS enabled on all tables; policies tested with `auth.uid()`
- [ ] MFA enforced for admin and fleet_manager roles
- [ ] 3D Secure enabled for Stripe transactions >$200
- [ ] Rate limiting configured on API Gateway (100 req/min customer, 1000 req/min admin)
- [ ] Sentry DSN configured with PII scrubbing enabled
- [ ] TLS 1.3 enforced; HSTS headers set
- [ ] Content Security Policy (CSP) headers configured
- [ ] OWASP ZAP scan completed; all High/Critical findings resolved
- [ ] Penetration test scheduled (or completed) by third party
- [ ] Incident response playbook documented and team trained
- [ ] GDPR data processing agreement signed with all third parties

---

## Appendix I: Capacity Planning

*Insert as new Section 17 in the master requirements document.*

### I.1 Expected Load by Phase

| Metric | MVP (Weeks 1-8) | Phase 2 (Weeks 9-16) | Phase 3 (Weeks 17-24) |
|---|---|---|---|
| Registered Users | 1,000 | 10,000 | 100,000 |
| Daily Active Users (DAU) | 200 | 2,000 | 20,000 |
| Concurrent Drivers | 50 | 300 | 2,000 |
| Trips/Day | 100 | 1,500 | 15,000 |
| Peak API Requests/Min | 500 | 5,000 | 50,000 |
| Database Storage | 50 GB | 500 GB | 5 TB |
| File Storage (photos/docs) | 100 GB | 1 TB | 10 TB |

### I.2 Infrastructure Scaling Triggers

| Resource | Current | Scale Trigger | Action |
|---|---|---|---|
| Supabase DB Connections | 200 | >80% for 5 min | Enable PgBouncer; add read replica |
| API Response Time (p95) | <200ms | >300ms for 10 min | Scale Vercel functions; enable CDN caching |
| WebSocket Connections | 10,000 | >7,000 | Migrate to Ably/Pusher; shard by region |
| Redis Memory | 16 GB | >12 GB | Evict old location data; cluster Redis |
| Storage Bandwidth | 1 Gbps | >800 Mbps | Enable CloudFront/Cloudflare CDN |
| Error Rate | <0.1% | >0.5% | Page on-call engineer; enable circuit breakers |

### I.3 Database Scaling Roadmap

- **MVP:** Single Supabase project (us-west-2)
- **Phase 2:** Read replica for analytics/reporting queries; connection pooling via PgBouncer
- **Phase 3:** Database sharding by geographic region (West, Central, East); migrate to AWS RDS PostgreSQL with Supabase-compatible APIs if needed

### I.4 Cost Projections (Monthly)

| Service | MVP | Phase 2 | Phase 3 |
|---|---|---|---|
| Supabase | $25 | $150 | $1,200 |
| Vercel Pro | $20 | $150 | $500 |
| Stripe Fees (2.9% + $0.30) | $50 | $750 | $7,500 |
| Maps API (Google/Mapbox) | $100 | $800 | $5,000 |
| Redis (Upstash/AWS) | $20 | $150 | $800 |
| Sentry | $26 | $80 | $300 |
| SendGrid/Twilio | $50 | $400 | $2,000 |
| **Total Infrastructure** | **~$300** | **~$2,500** | **~$17,000** |

---

## Appendix J: Mobile Release & Rollback Strategy

*Insert as new Section 18 in the master requirements document.*

### J.1 Release Timeline

| Milestone | iOS | Android | PWA |
|---|---|---|---|
| Alpha (Internal) | Week 4 | Week 4 | Week 2 |
| Beta (TestFlight/Play Console) | Week 6 | Week 6 | Week 4 |
| Soft Launch (100 users) | Week 8 | Week 8 | Week 6 |
| Public Launch | Week 10 | Week 10 | Week 8 |
| Phase 2 Update | Week 18 | Week 18 | Week 16 |

### J.2 App Store Submission Checklist

**iOS (App Store):**
- [ ] Apple Developer Program membership active ($99/year)
- [ ] App Store Connect app record created
- [ ] Privacy Nutrition Label completed (location, contacts, photos)
- [ ] Background location usage description (NSLocationAlwaysAndWhenInUseUsageDescription)
- [ ] App Preview video (15–30 seconds, 3 required sizes)
- [ ] Screenshots for iPhone 6.7", 6.5", 5.5", iPad Pro
- [ ] App Review Information: demo account credentials provided
- [ ] Export Compliance: uses encryption? (Yes — HTTPS/TLS)

**Android (Google Play):**
- [ ] Google Play Developer account active ($25 one-time)
- [ ] Target API Level 34+ (Android 14)
- [ ] Foreground location permission declared in manifest
- [ ] App signing key enrolled in Google Play App Signing
- [ ] Data safety form completed
- [ ] Content rating questionnaire (PEGI/ESRB)

### J.3 Staged Rollout Strategy

| Stage | Percentage | Duration | Criteria to Advance |
|---|---|---|---|
| Canary | 5% | 24 hours | Crash rate <0.5%; no critical bugs |
| Early Access | 20% | 48 hours | API error rate <0.1%; support tickets <10/day |
| General | 50% | 72 hours | NPS stable; no regression in trip completion rate |
| Full | 100% | — | All KPIs green for 48 hours |

### J.4 Rollback Plan

**Scenario 1: Critical Bug in Production**
1. **Immediate:** Pause staged rollout in App Store Connect / Play Console
2. **0–30 min:** Identify affected users via Sentry crash reports
3. **30–60 min:** If bug is server-side, deploy hotfix via Vercel (instant)
4. **1–4 hours:** If bug is client-side, submit expedited review (iOS) or immediate update (Android)
5. **Communication:** In-app banner + push notification to affected users

**Scenario 2: API Breaking Change**
1. Maintain backward compatibility for minimum 2 app versions
2. Use API versioning (`/v1/`, `/v2/`) — never break existing clients
3. Force-upgrade only for security-critical fixes (with 7-day notice)

**Scenario 3: Database Migration Failure**
1. All migrations must be backward-compatible (expand-then-contract pattern)
2. Maintain pre-migration database snapshot for 24 hours
3. Rollback script tested in staging before every production deploy

### J.5 Version Support Policy

| App Version | Support Window | API Compatibility |
|---|---|---|
| Current (n) | Full support | All features |
| Previous (n-1) | 30 days bug fixes | All features |
| n-2 | Security fixes only | Core features only |
| n-3 | Deprecated | Force upgrade required |

---

**End of Document**

*This review and enhancement guide is a living document. Update appendices as architecture decisions evolve.*
