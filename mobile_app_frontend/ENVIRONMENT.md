Environment variables

- Copy .env.example to .env and set values.
- Important variables:
  - REACT_APP_API_BASE: e.g., http://localhost:4000 (frontend calls `${REACT_APP_API_BASE}/...`)
  - REACT_APP_BACKEND_URL: fallback base URL (also surfaced in diagnostics)
  - REACT_APP_WS_URL: Socket.IO endpoint, e.g., http://localhost:4000
  - REACT_APP_FRONTEND_URL: your frontend origin (used by backend for CORS)
  - REACT_APP_NODE_ENV: development | production (optional; CRA also provides NODE_ENV)
  - REACT_APP_PORT: default 3000 for local dev
  - REACT_APP_TRUST_PROXY, REACT_APP_LOG_LEVEL, REACT_APP_HEALTHCHECK_PATH: optional tuning
  - REACT_APP_FEATURE_FLAGS, REACT_APP_EXPERIMENTS_ENABLED: optional feature toggles
- The app reads process.env.REACT_APP_* only; values are injected at build time by CRA.
- WebSocket
  - The client (src/utils/ws.js) connects to process.env.REACT_APP_WS_URL (or falls back to REACT_APP_BACKEND_URL).
  - Ensure the backend Socket.IO server accepts your frontend origin via CORS.
