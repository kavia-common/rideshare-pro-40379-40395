# rideshare-pro-40379-40395

This workspace contains:
- backend_api_server: Node.js + Express + MongoDB backend with JWT auth, Socket.IO realtime, OSRM routing
- mobile_app_frontend: React app for ride booking and live tracking

Quick start:
1) Backend
   - cd backend_api_server
   - cp .env.example .env
   - edit .env: set MONGODB_URI and JWT_SECRET, origins
   - npm install
   - npm run dev
   - Optional seed: npm run seed

2) Frontend
   - cd mobile_app_frontend
   - copy .env.example if available or export REACT_APP_API_BASE, REACT_APP_WS_URL to point to backend
   - npm install
   - npm start

Useful URLs:
- Backend API: http://localhost:4000
- Healthcheck: http://localhost:4000/health
- API Docs Meta: http://localhost:4000/docs
- Frontend: http://localhost:3000