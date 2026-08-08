# 🍔 MernEats — Food Delivery Platform

A full-stack food-delivery web app (MERN + TypeScript) where customers can browse restaurants, order food with live tracking, and restaurant owners can manage their menu, orders and deliveries.

## ✨ Features

**For customers**
- Browse & search restaurants by city and cuisine, sort by rating / price / delivery time
- Restaurant pages with menus, veg/non-veg & bestseller badges, ratings and reviews
- Cart, Stripe card checkout, plus Cash-on-Delivery / UPI / wallet payments
- Coupons, wallet & loyalty points, saved address book, favourites, reorder
- Live order tracking on a map (Socket.io), scheduled orders
- Membership (Gold/Pro), rewards & streaks, surprise bags (surplus food), group ordering
- Sustainability: eco-packaging opt-in + carbon-impact page
- AI meal recommendations, natural-language search & review summaries

**For restaurant owners**
- Create & manage a restaurant + menu
- Order dashboard with status updates and rider assignment
- Analytics dashboard (revenue, orders, top items)
- Publish discounted surprise bags

## 🧱 Tech stack

| Layer | Tech |
|---|---|
| Frontend | React + TypeScript, Vite, Tailwind, shadcn/ui, React Query, React Router, Auth0 |
| Backend | Node.js, Express + TypeScript, MongoDB (Mongoose), Socket.io |
| Services | Auth0 (auth), Stripe (payments), Cloudinary (images), Anthropic Claude (optional AI) |

## 🔐 Access model

There is no admin role. Access is:
- **Guest** — public pages (home, search, restaurant detail, surprise bags, AI search).
- **Authenticated user** — everything behind auth (Auth0 JWT verified by `jwtCheck` + `jwtParse`).
- **Restaurant owner** — any authenticated user who has created a restaurant; owner-only pages (analytics, manage surprise bags) are guarded by `OwnerRoute` on the frontend and ownership checks on the backend.

## 🚀 Getting started

### Prerequisites
- Node.js 18+
- A MongoDB database (local or [Atlas](https://www.mongodb.com/atlas))
- Accounts for Auth0, Stripe and Cloudinary

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env   # then fill in your values
npm run dev            # starts on http://localhost:7000
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env   # then fill in your values
npm run dev            # starts on http://localhost:5173
```

Open **http://localhost:5173**.

### Environment variables
See [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example) for the full list. The AI features are optional — without `ANTHROPIC_API_KEY` they fall back to heuristics.

## 📦 Scripts

| Location | Command | Description |
|---|---|---|
| backend | `npm run dev` | Run API with auto-reload (+ Stripe listener) |
| frontend | `npm run dev` | Run Vite dev server |
| frontend | `npm run build` | Production build |

## 📝 Notes
- Prices are stored in minor units (pence) and displayed in GBP (£).
- Stripe checkout requires the Stripe CLI for local webhook forwarding.
