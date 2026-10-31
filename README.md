# service-hub

Full-Stack On-Demand Home Services Platform (Mobile & Web)

Service Hub is a full-stack mobile platform built with **React Native (Expo SDK 57)**, **Node.js + Express**, and **MongoDB**. It seamlessly connects customers with verified local service providers (plumbers, electricians, cleaners, carpenters, etc.) with real-time geospatial location queries, interactive map tracking, role-based workflows, and smart AI assistance.

---

## Deliverables & Architecture Overview

```
arathi-pdd/
├── .stitch/                          # PHASE 1: Stitch MCP Designs & Tokens
│   ├── DESIGN.md                     # Visual identity, tokens, 8px grid, Inter font
│   ├── SITE.md                       # Screen roadmap & multi-role architecture
│   ├── metadata.json                 # Project & screen IDs recorded in Stitch MCP
│   └── designs/                      # High-res HTML & PNG assets for designed screens
│       ├── customer_home.html / .png
│       ├── provider_search_map.html / .png
│       ├── provider_profile.html / .png
│       ├── booking_screen.html / .png
│       ├── ai_chat.html / .png
│       ├── provider_dashboard.html / .png
│       └── auth_role_login.html / .png
├── backend/                          # PHASE 2: Node.js + Express + MongoDB Backend
│   ├── config/                       # DB (Mongoose) & Cloudinary setup
│   ├── controllers/                  # Auth, Provider, Booking, AI, Admin, etc.
│   ├── middleware/                   # JWT & Role authorization, error handler
│   ├── models/                       # User, ProviderProfile, Booking, Category, etc.
│   ├── routes/                       # Express REST API routes
│   ├── server.js                     # Server entry with Socket.io real-time engine
│   ├── seed.js                       # Turnkey database seeder with demo accounts
│   ├── .env                          # Backend environment variables
│   └── package.json
└── service-hub/                      # PHASE 3: React Native Frontend (Expo SDK 57)
    ├── app/                          # File-based routing (Expo Router)
    │   ├── (auth)/                   # Role selection, login, and signup
    │   ├── (customer)/               # Customer 5-tab navigator (Home, Map, Bookings...)
    │   ├── (provider)/               # Provider tabs (Dashboard, Manage Bookings, Setup...)
    │   ├── (admin)/                  # Admin tabs (Dashboard, Users, Approvals, Disputes...)
    │   ├── booking/                  # [id].tsx (Details/receipt) & new.tsx (AI Booking)
    │   ├── provider/[id].tsx         # Provider profile page with portfolio & reviews
    │   ├── review/[bookingId].tsx    # Rating & feedback modal
    │   ├── complaint/new.tsx         # Dispute ticket filing
    │   └── ai-chat.tsx               # Dedicated AI Assistant chat screen
    ├── components/
    │   ├── ui/                       # Button, Input, Card, Badge, Avatar, Rating, Skeleton
    │   ├── maps/                     # ProviderMap & LocationPicker (OpenStreetMap/Leaflet)
    │   ├── booking/                  # BookingCard & BookingStatusTimeline
    │   ├── provider/                 # ProviderCard with distance & ratings
    │   └── ai/                       # AIRecommendationBanner & AIChatBubble
    ├── constants/                    # theme.ts (Design tokens) & config.ts
    ├── services/                     # Axios API clients with JWT interceptor
    ├── store/                        # AuthProvider context with AsyncStorage
    ├── hooks/                        # useSocket for real-time notifications
    └── .env                          # Frontend environment variables
```

---

## Quick Start & Running Locally

### 1. Start the Backend Server

```bash
cd backend
npm install
npm run seed       # Populates demo admin, customer, providers & categories
npm start          # Runs server on http://localhost:5000
```

### 2. Start the React + Tailwind Web Application

```bash
cd web
npm install
npm run dev        # Launches Vite dev server at http://localhost:3000
```

The web client features:
- **Landing Page**: GSAP-animated hero banner, live service category selector, verified pro cards, and 3-step guarantee overview.
- **Customer Portal**: Provider search, category filtering, booking modal with AI problem refinement, booking management, review submission, and dispute filing.
- **Provider Portal**: Live dispatch console, online toggle, accept/reject booking controls, job completion, and hourly rate configuration.
- **Admin Portal**: Platform KPIs, smart analytics, provider credential approvals, category management, and dispute mediation.
- **Smart Assistant Drawer**: Slide-in assistant with instant diagnosis and direct booking links.

### 3. Start the React Native Mobile App

```bash
cd service-hub
npm install
npx expo start     # Launches Expo dev server (Web, Android, iOS)
```

Press `w` in the terminal to view in your browser immediately, or scan the QR code with Expo Go on your mobile device.

---

## Turnkey Demo Accounts

The database seed script (`npm run seed` in `backend/`) configures ready-to-test accounts:

| Role | Email | Password | Features |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@servicehub.com` | `password123` | Search map, AI match banner, Book services, AI Chat |
| **Service Provider** | `provider@servicehub.com` | `password123` | Accept/reject jobs, live status, GPS pin picker, earnings |
| **Administrator** | `admin@servicehub.com` | `password123` | Approve providers, KPI dashboard, dispute resolution |

*(On the login screen, you can also use the one-tap **"Quick Fill Demo Account"** buttons).*

---

## Key Features & Compliance

1. **Phase 1 Stitch MCP Design**:
   - **Colors**: Primary `#1A6BFF`, Accent `#FF6B2B`, Surface `#FFFFFF`, Background `#F7F8FA`, Border `#E5E7EB`.
   - **Zero Emojis**: 100% clean Lucide vector stroke iconography.
   - **Spacing**: Strict 8px modular scale and 16px horizontal screen gutters.
   - **Stitch Project**: Created in Stitch MCP under `projects/16245156677596435365`.

2. **Free Interactive Maps (No Google Billing)**:
   - Uses OpenStreetMap tiles with Leaflet.js rendered via WebView.
   - Features custom pill markers with hourly rates, user GPS beacon, and interactive tap-to-select sheets.
   - Providers can drag their pin in the `LocationPicker` to calibrate service areas.

3. **Geospatial Provider Matching**:
   - MongoDB `2dsphere` index on `location.coordinates` (`[longitude, latitude]`).
   - Query endpoint: `/api/provider/nearby?lat=&lng=&radius=&category=` utilizing `$near` geospatial lookup.

4. **AI Assistance**:
   - **Smart Recommendations**: Evaluates user location and categories to recommend top-rated verified technicians.
   - **AI Chat Assistant**: Interactive troubleshooting conversation that yields inline provider cards with one-tap `Book Now` CTAs.
   - **AI Description Helper**: Automatically turns brief phrases (e.g., *"leaking pipe"*) into structured, professional technical summaries.
   - **Provider Profile Summary**: 2-line AI bio highlighting resolution rates and specialties.

5. **Real-time Lifecycle (Socket.io)**:
   - User-specific Socket rooms. Instant notifications when a booking is created, accepted, ongoing, completed, or cancelled.
   - Visual step timeline progress component (`Requested` -> `Accepted` -> `Ongoing` -> `Completed`).
