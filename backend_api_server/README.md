# RideShare Pro - Backend API Server

Node.js + Express server with MongoDB (Mongoose), JWT authentication, Socket.IO for realtime updates, and OSRM routing utility.

## Features

- Security: helmet, CORS (origin from env), morgan
- JWT auth: Register/Login; middleware to protect routes
- Models
  - User (email, passwordHash, name, role)
  - Driver (userId, status, currentLocation: GeoJSON Point with 2dsphere index)
  - Trip (riderId, driverId, pickup/dropoff: GeoJSON Points with 2dsphere indexes, route, price, timestamps)
- Routes
  - GET /health
  - POST /auth/register
  - POST /auth/login
  - GET /users/me
  - POST /trips
  - GET /trips
  - GET /trips/:id
  - POST /trips/:id/cancel
  - POST /trips/:id/complete
- Socket.IO
  - Connection auth via JWT (optional in preview)
  - Rooms: user:{userId}, trip:{tripId}
  - Client event: trip:join { tripId }
  - Server event: trip:update { status, driver, location, eta }
- Driver simulation
  - Simulates movement along two phases (to pickup, to destination) broadcasting location and ETA

## Setup

1) Copy environment template and update:
   cp .env.example .env
   # Set MONGODB_URI and JWT_SECRET

2) Install dependencies:
   npm install

3) Run the server:
   npm run dev
   # Server listens on PORT (default 4000)

4) Seed development data:
   npm run seed

## Environment Variables

- MONGODB_URI (required): Mongo connection string
- PORT (default 4000)
- TRUST_PROXY=1 (optional)
- LOG_LEVEL (default "dev")
- JWT_SECRET (required in production)
- REACT_APP_FRONTEND_URL: CORS/browser origin
- REACT_APP_BACKEND_URL: Base URL for API/WS
- REACT_APP_WS_URL: WebSocket URL for clients
- REACT_APP_HEALTHCHECK_PATH: defaults to /health

Frontend-related variables are included to align with the overall workspace wiring:
REACT_APP_API_BASE, REACT_APP_BACKEND_URL, REACT_APP_FRONTEND_URL, REACT_APP_WS_URL, REACT_APP_NODE_ENV,
REACT_APP_NEXT_TELEMETRY_DISABLED, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY,
REACT_APP_LOG_LEVEL, REACT_APP_HEALTHCHECK_PATH, REACT_APP_FEATURE_FLAGS, REACT_APP_EXPERIMENTS_ENABLED

## WebSocket Usage

- Client connects to REACT_APP_WS_URL via socket.io-client with:
  io(WS_URL, { auth: { token: <JWT> } })
- After creating a trip, join its room:
  socket.emit('trip:join', { tripId: '<id>' })
- Listen for:
  socket.on('trip:update', (payload) => { ... })

## Notes

- Geo indexes are ensured at startup for Driver.currentLocation and Trip.pickup/dropoff.
- OSRM calls the public demo server by default; set OSRM_BASE to override.
