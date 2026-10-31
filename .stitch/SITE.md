# Service Hub - Mobile App Constitution (SITE.md)

## 1. Vision & Overview
Service Hub is a full-stack mobile platform built with React Native (Expo SDK 57) and Node.js/Express/MongoDB. It connects customers with certified local service providers (plumbing, electrical, home cleaning, carpentry, appliances, etc.) with real-time geospatial matching, instant booking lifecycle tracking, and smart AI recommendations.

---

## 2. Global Aesthetics & Rules
- **Design Tokens**: Defined in `.stitch/DESIGN.md` (Primary `#1A6BFF`, Accent `#FF6B2B`, Surface `#FFFFFF`, Bg `#F7F8FA`).
- **Typography**: Inter (System sans-serif fallback).
- **Rule**: NO emojis anywhere in UI text or icons.
- **Base Grid**: 8px (8, 16, 24, 32, 48), screen horizontal padding: 16px.

---

## 3. User Roles
1. **Customer**: Searches services, views interactive OpenStreetMap pins, books appointments, tracks status, chats with AI assistant, leaves reviews, files complaints.
2. **Service Provider**: Sets geographic service pin & hourly rate, manages booking requests (Accept/Reject), tracks revenue/earnings, views performance analytics.
3. **Admin**: Approves/rejects providers, oversees platform bookings, manages service categories, handles disputes/complaints, views platform analytics.

---

## 4. Master Screen Inventory & Roadmap

### Group 1: Authentication & Onboarding
- [x] `auth_role_select`: Select between Customer, Service Provider, Admin
- [x] `auth_login`: Role-aware login with email & password
- [x] `auth_signup`: Registration form with role, phone, and credentials

### Group 2: Customer Flow
- [x] `customer_home`: Greeting, category grid, AI recommendation banner, nearby verified providers
- [x] `customer_search_map`: OpenStreetMap / Leaflet interactive view with provider markers and filter list
- [x] `customer_provider_profile`: Bio, AI summary, hourly rate, reviews, verified badges, Book CTA
- [x] `customer_booking_form`: Date, time slot, location address, problem description with AI assist helper
- [x] `customer_bookings_list`: Tabs (Pending, Accepted, Ongoing, Completed, Cancelled)
- [x] `customer_booking_detail`: Status timeline, provider info, receipt summary, action buttons
- [x] `customer_payment`: Online (card/UPI) or Cash on Service selection
- [x] `customer_rating_review`: Star rating (1-5), quality score, written feedback
- [x] `customer_ai_chat`: Dedicated AI assistant for finding providers and trouble diagnosis
- [x] `customer_notifications`: Real-time alerts for booking status and offers
- [x] `customer_profile`: Account settings, saved addresses, service history, complaints

### Group 3: Service Provider Flow
- [x] `provider_dashboard`: Key metrics (bookings, revenue, rating, active status toggle)
- [x] `provider_manage_bookings`: Accept / Reject pending requests, active job progress
- [x] `provider_profile_setup`: Category, hourly rate, work hours, location picker on map
- [x] `provider_earnings`: Detailed monthly breakdown, completed job payouts, pending settlements

### Group 4: Admin Flow
- [x] `admin_dashboard`: System KPIs (Total users, verified providers, gross booking value, disputes)
- [x] `admin_providers`: Provider verification queue with approval and rejection actions
- [x] `admin_categories`: Service category management (CRUD)
- [x] `admin_complaints`: Customer dispute resolution queue

---

## 5. Technology Architecture
- **Mobile Client**: Expo SDK 57, Expo Router, React Native Reanimated, Leaflet.js inside WebView for maps, Lucide Icons.
- **Backend API**: Node.js, Express, MongoDB with 2dsphere index for location queries, Mongoose, JWT authentication, Socket.io for live updates.
- **AI Engine**: OpenAI API integration for provider recommendations, booking description helper, provider profile summary, and conversational assistant.
