# rideshare-pro-40379-40395

This workspace contains:
- backend_api_server: Node.js + Express + MongoDB backend with JWT auth, Socket.IO realtime, OSRM routing
- mobile_app_frontend: React app for ride booking and live tracking

## Environment setup

Backend
- cd backend_api_server
- cp .env.example .env
- Edit .env at least for:
  - MONGODB_URI (e.g., mongodb://localhost:27017/rideshare)
  - JWT_SECRET (set a strong secret in production)
  - REACT_APP_FRONTEND_URL (e.g., http://localhost:3000)
  - REACT_APP_BACKEND_URL, REACT_APP_WS_URL (e.g., http://localhost:4000)
- npm install
- npm run dev
- Optional seed: npm run seed

Frontend
- cd mobile_app_frontend
- cp .env.example .env
- Ensure:
  - REACT_APP_API_BASE=http://localhost:4000
  - REACT_APP_WS_URL=http://localhost:4000
  - REACT_APP_BACKEND_URL=http://localhost:4000
  - REACT_APP_PORT=3000 (optional for local dev)
- npm install
- npm start

## OSRM routing notes

- The app uses the public OSRM demo server by default:
  https://router.project-osrm.org/route/v1/driving
- This endpoint has fair-use limits and may throttle under load. For production or reliable testing, deploy your own OSRM or set OSRM_BASE in backend_api_server/.env to your instance (same API path format).

## End-to-end smoke check

1) Start backend:
   - cd backend_api_server && npm run dev
   - Verify http://localhost:4000/health returns JSON with status=ok.
   - Verify /docs at http://localhost:4000/docs shows URLs including websocket url.

2) Start frontend:
   - cd mobile_app_frontend && npm start
   - Verify app loads at http://localhost:3000.

3) App smoke path:
   - Register a user or login (Register: email/password).
   - On Home map, optionally enter Destination as "37.7840,-122.4090" and click "Preview Route".
   - Click "Request Ride" to create a trip (requires backend running and Mongo connected).
   - You should see status updates (assigned → enroute → completed) and driver marker moving.
   - History shows recent trips.

If the backend is not reachable, the frontend will still allow a minimal preview experience with stubbed auth and a mocked websocket, but trip creation/history will not persist.

## Useful URLs
- Backend API: http://localhost:4000
- Healthcheck: http://localhost:4000/health
- API Docs Meta: http://localhost:4000/docs
- Frontend: http://localhost:3000