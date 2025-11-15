# RideShare Pro - Backend API Server

Node.js + Express server with MongoDB (Mongoose), JWT authentication, Socket.IO for realtime trip updates, and an OSRM routing utility.

## Features

- Security: helmet, CORS (origin via env), morgan logger
- Env-driven config: PORT, TRUST_PROXY, JWT_SECRET, REACT_APP_* URLs, OSRM_BASE
- JWT auth: Register/Login; bearer middleware protects user/trip routes
- Models
  - User (email, passwordHash, name, role)
  - Driver (userId, status, currentLocation: GeoJSON Point with 2dsphere index)
  - Trip (riderId, driverId, pickup/dropoff: GeoJSON Points with 2dsphere indexes, route, price, timestamps)
- REST Routes
  - GET  /health
  - GET  /docs
  - POST /auth/register
  - POST /auth/login
  - GET  /users/me
  - POST /trips
  - GET  /trips
  - GET  /trips/:id
  - POST /trips/:id/cancel
  - POST /trips/:id/complete
- Socket.IO
  - Optional connection auth via JWT
  - Rooms: user:{userId}, trip:{tripId}
  - Client event: trip:join { tripId }
  - Server event: trip:update { status, driver, location, eta }
- Driver simulation
  - Linear movement: current -> pickup -> destination, broadcasting location and ETA

## Setup

1) Copy environment template and update:
   cp .env.example .env
   # Set at least: MONGODB_URI and JWT_SECRET

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
- TRUST_PROXY=1 (optional, if behind reverse proxy)
- LOG_LEVEL (default "dev")
- JWT_SECRET (required in production)
- REACT_APP_FRONTEND_URL: CORS/browser origin
- REACT_APP_BACKEND_URL: Base URL for API/WS
- REACT_APP_WS_URL: WebSocket URL for clients
- REACT_APP_HEALTHCHECK_PATH: defaults to /health
- OSRM_BASE (optional): override OSRM routing base

Frontend-aligned variables are included for workspace cohesion:
REACT_APP_API_BASE, REACT_APP_BACKEND_URL, REACT_APP_FRONTEND_URL, REACT_APP_WS_URL, REACT_APP_NODE_ENV,
REACT_APP_NEXT_TELEMETRY_DISABLED, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY,
REACT_APP_LOG_LEVEL, REACT_APP_HEALTHCHECK_PATH, REACT_APP_FEATURE_FLAGS, REACT_APP_EXPERIMENTS_ENABLED

## REST Endpoints

- GET /health
  - Returns { status, service, env, ws }
- GET /docs
  - Minimal metadata for API + websocket URL; not a full OpenAPI
- POST /auth/register
  - Body: { email, password, name, role? } → { token, user }
- POST /auth/login
  - Body: { email, password } → { token, user }
- GET /users/me (Auth required)
  - Returns current user profile
- POST /trips (Auth required)
  - Body: { pickup: {lat,lng}, destination: {lat,lng} } → Trip JSON
- GET /trips (Auth required)
  - Query: limit, skip → Trip[] (most recent first)
- GET /trips/:id (Auth required)
  - Returns trip if owned by user
- POST /trips/:id/cancel (Auth required)
  - Cancels non-finalized trip
- POST /trips/:id/complete (Auth required)
  - Marks trip as completed

## WebSocket Usage

- Connect to REACT_APP_WS_URL via socket.io-client:
  io(WS_URL, { auth: { token: <JWT> } })
- After creating a trip, join its room:
  socket.emit('trip:join', { tripId: '<id>' })
- Listen for updates:
  socket.on('trip:update', (payload) => {
    // { status, driver, location, eta }
  })

## Notes

- Geo indexes are ensured at startup (Driver.currentLocation; Trip.pickup/dropoff).
- OSRM uses the public demo server by default; set OSRM_BASE to override.
- CORS/helmet are applied; CORS origin is derived from REACT_APP_FRONTEND_URL or REACT_APP_BACKEND_URL.
