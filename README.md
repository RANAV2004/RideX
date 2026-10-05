w# 🚗 RideX — Uber Clone

A full-stack Uber clone built with **Next.js**, **Node.js**, and **MongoDB**, featuring real-time ride tracking, driver/rider roles, fare estimation, live chat, and a support chatbot.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Auth** | JWT-based login/register for Riders and Drivers |
| **Rider Dashboard** | Book rides, view fare estimates across 4 ride types |
| **Driver Dashboard** | Toggle online/offline, accept ride requests in real time |
| **Fare Estimation** | Haversine distance calculation + time-based pricing |
| **Live Tracking** | Socket.IO real-time driver location updates |
| **Ride Status Flow** | pending → accepted → en_route → arrived → in_progress → completed |
| **In-ride Chat** | Real-time messaging between rider and driver |
| **Support Chatbot** | Rule-based AI bot answering common questions |
| **Ride History** | View all past rides with details |
| **Star Ratings** | Rate your driver/rider after each trip |
| **Ride OTP** | 4-digit OTP for secure pickup verification |

---

## 🏗️ Project Structure

```
uber-clone/
├── backend/                    # Node.js + Express API
│   ├── models/
│   │   ├── User.js             # User model (rider & driver)
│   │   ├── Ride.js             # Ride model
│   │   └── Message.js          # Chat message model
│   ├── routes/
│   │   ├── auth.js             # Register, login, update location
│   │   ├── ride.js             # Ride CRUD + fare estimation
│   │   ├── user.js             # Profile, availability, nearby drivers
│   │   └── chat.js             # Messages + bot responses
│   ├── middleware/
│   │   └── auth.js             # JWT middleware
│   ├── socket/
│   │   └── socketHandler.js    # Socket.IO events
│   └── server.js               # Entry point
│
└── frontend/                   # Next.js 14 App Router
    ├── app/
    │   ├── page.tsx             # Root redirect
    │   ├── layout.tsx           # Root layout
    │   ├── globals.css          # Tailwind styles
    │   ├── auth/
    │   │   ├── login/page.tsx   # Login page
    │   │   └── register/page.tsx# Register page (2-step for drivers)
    │   ├── dashboard/page.tsx   # Main dashboard
    │   ├── ride/
    │   │   ├── [id]/page.tsx    # Active ride tracking
    │   │   └── history/page.tsx # Ride history
    │   └── chat/page.tsx        # Support chatbot
    ├── components/
    │   ├── Navbar.tsx           # Navigation bar
    │   ├── RiderDashboard.tsx   # Rider view
    │   └── DriverDashboard.tsx  # Driver view
    └── lib/
        ├── api.ts               # Axios API client
        ├── store.ts             # Zustand global state
        └── socket.ts            # Socket.IO client
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** — create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/uber-clone
JWT_SECRET=your_secret_key_change_this
CLIENT_URL=http://localhost:3000
```

**Frontend** — create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key   # optional
```

### 3. Run the App

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open **http://localhost:3000** 🎉

---

## 🗺️ Google Maps Integration (Optional)

To enable the live map:
1. Get an API key from [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Maps JavaScript API** and **Geocoding API**
3. Add key to `frontend/.env.local`

The map placeholder in the dashboard will auto-activate once the key is set.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update-location` | Update driver location |

### Rides
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rides/estimate` | Get fare estimates |
| POST | `/api/rides/request` | Book a ride |
| GET | `/api/rides/active` | Get active ride |
| GET | `/api/rides/my-rides` | Ride history |
| GET | `/api/rides/pending` | Pending rides (driver) |
| PUT | `/api/rides/:id/accept` | Accept ride (driver) |
| PUT | `/api/rides/:id/status` | Update ride status |
| PUT | `/api/rides/:id/cancel` | Cancel ride |
| POST | `/api/rides/:id/rate` | Submit rating |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/:rideId/messages` | Get chat messages |
| POST | `/api/chat/:rideId/message` | Send message |
| POST | `/api/chat/bot` | Ask support bot |

---

## 🔌 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `authenticate` | client → server | Identify user |
| `join_ride` | client → server | Join ride room |
| `update_location` | client → server | Driver sends GPS |
| `new_ride_request` | server → client | New ride available |
| `ride_accepted` | server → client | Driver accepted ride |
| `ride_status_updated` | server → client | Status changed |
| `driver_location_updated` | server → client | Driver GPS update |
| `new_message` | server → client | New chat message |
| `ride_cancelled` | server → client | Ride was cancelled |

---

## 💰 Fare Structure

| Ride Type | Base Fare | Per km | Per min |
|-----------|-----------|--------|---------|
| Economy | $2.50 | $1.20 | $0.20 |
| Comfort | $3.50 | $1.80 | $0.30 |
| XL | $4.50 | $2.20 | $0.35 |
| Luxury | $6.00 | $3.00 | $0.50 |

---

## 🛠️ Tech Stack

**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Socket.IO Client, Lucide Icons

**Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO, JWT, bcryptjs

---

## 🔮 Future Improvements

- Google Maps real-time route visualization
- Stripe payment integration
- Push notifications (FCM)
- Admin dashboard
- Surge pricing
- Scheduled rides
- Driver earnings analytics
