# RideShare Pro - Backend API Server

Minimal Node.js + Express server with MongoDB (Mongoose) for rideshare application.

## Features

- Mongoose connection helper
- Models
  - User (email, passwordHash, name, role)
  - Driver (userId, status, currentLocation: GeoJSON Point with 2dsphere index)
  - Trip (riderId, driverId, pickup/dropoff: GeoJSON Points with 2dsphere indexes, route, price, timestamps)
- Seed script to populate sample users and drivers for development
- Healthcheck endpoint: GET /health

## Setup

1) Copy environment template and update:
   cp .env.example .env
   # Set MONGODB_URI and optional PORT, REACT_APP_FRONTEND_URL

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

Frontend-related variables are included to align with the overall workspace wiring:
REACT_APP_API_BASE, REACT_APP_BACKEND_URL, REACT_APP_FRONTEND_URL, REACT_APP_WS_URL, REACT_APP_NODE_ENV,
REACT_APP_NEXT_TELEMETRY_DISABLED, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY,
REACT_APP_LOG_LEVEL, REACT_APP_HEALTHCHECK_PATH, REACT_APP_FEATURE_FLAGS, REACT_APP_EXPERIMENTS_ENABLED

## Notes

- This scaffold focuses on DB models and connectivity; routes and authentication are to be added in subsequent steps.
- Geo indexes are ensured at startup for Driver.currentLocation and Trip.pickup/dropoff.
