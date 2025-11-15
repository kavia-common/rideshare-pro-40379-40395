import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { connectMongo } from './utils/db.js';
import { registerModels } from './models/index.js';

const app = express();

// Security and common middlewares
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.REACT_APP_FRONTEND_URL || '*',
  credentials: true,
}));
app.use(morgan(process.env.REACT_APP_LOG_LEVEL || process.env.LOG_LEVEL || 'dev'));

// Trust proxy if configured
if (String(process.env.TRUST_PROXY || process.env.REACT_APP_TRUST_PROXY || '') === '1') {
  app.set('trust proxy', 1);
}

// Register DB and models
await connectMongo(process.env.MONGODB_URI);
registerModels();

// PUBLIC_INTERFACE
app.get('/health', (req, res) => {
  /**
   * Health check endpoint
   * Returns 200 with basic service and environment information (non-sensitive).
   */
  return res.json({
    status: 'ok',
    service: 'backend_api_server',
    env: process.env.NODE_ENV || 'development',
    ws: process.env.REACT_APP_WS_URL || null,
  });
});

// Placeholder routes (can be extended later)
app.get('/', (req, res) => {
  res.json({
    name: 'RideShare Pro Backend',
    version: '0.1.0',
    description: 'Basic API scaffolding with MongoDB models and seed script',
    docs_note: 'OpenAPI docs not yet implemented',
  });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[backend] listening on http://localhost:${port}`);
});
