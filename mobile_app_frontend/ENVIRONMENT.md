Environment variables

- Copy .env.example to .env and set values.
- Important variables:
  - REACT_APP_API_BASE: e.g., https://api.example.com
  - REACT_APP_BACKEND_URL: base URL used as fallback for API and WS
  - REACT_APP_WS_URL: e.g., wss://api.example.com
  - REACT_APP_PORT: default 3000
- The app reads process.env.REACT_APP_* only; values are injected at build time by CRA.
