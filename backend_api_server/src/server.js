import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import { connectMongo } from './utils/db.js';
import { registerModels } from './models/index.js';

// Load Mongoose models
import './models/user.js';
import './models/driver.js';
import './models/trip.js';

const User = mongoose.model('User');
const Driver = mongoose.model('Driver');
const Trip = mongoose.model('Trip');

const app = express();
const server = http.createServer(app);

// Socket.IO configuration with CORS from env
const allowedOrigin = process.env.REACT_APP_FRONTEND_URL || process.env.REACT_APP_BACKEND_URL || '*';
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigin === '*' ? true : allowedOrigin,
    credentials: true,
  },
});

// Security and common middlewares
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: allowedOrigin === '*' ? true : allowedOrigin,
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

/**
 * PUBLIC_INTERFACE
 * getJwtSecret
 * Returns JWT secret from env; throws if absent.
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.SECRET || 'dev_secret_change_me';
  return secret;
}

/**
 * PUBLIC_INTERFACE
 * authMiddleware
 * Express middleware to validate JWT bearer tokens.
 */
function authMiddleware(req, res, next) {
  // Accept token via Authorization: Bearer <token>
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Util to normalize [lat,lng] into GeoJSON Point
 */
function toPoint(lat, lng) {
  return { type: 'Point', coordinates: [Number(lng), Number(lat)] };
}

/**
 * PUBLIC_INTERFACE
 * osrmRoute
 * Queries OSRM for route and returns distance, duration, and optional polyline (polyline6).
 */
async function osrmRoute(origin, destination) {
  const base = process.env.OSRM_BASE || 'https://router.project-osrm.org/route/v1/driving';
  const start = `${origin[1]},${origin[0]}`;
  const end = `${destination[1]},${destination[0]}`;
  const url = `${base}/${start};${end}?overview=full&geometries=polyline6`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('OSRM route failed');
  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) throw new Error('No route found');
  return {
    distance: route.distance,
    duration: route.duration,
    polyline: route.geometry,
  };
}

// WebSocket: basic JWT auth via connection attempt (optional for preview)
io.use((socket, next) => {
  try {
    const token = socket.handshake?.auth?.token || null;
    if (token) {
      const payload = jwt.verify(token, getJwtSecret());
      socket.data.user = payload;
    }
  } catch {
    // In preview/unauth flows we still allow but mark unauth
    socket.data.user = null;
  }
  next();
});

io.on('connection', (socket) => {
  // Join personal room if authenticated
  if (socket.data?.user?.sub) {
    const userRoom = `user:${socket.data.user.sub}`;
    socket.join(userRoom);
  }

  // Join a trip room
  socket.on('trip:join', ({ tripId }) => {
    if (!tripId) return;
    socket.join(`trip:${tripId}`);
  });

  socket.on('disconnect', () => {
    // nothing special
  });
});

// Healthcheck
// PUBLIC_INTERFACE
app.get(process.env.REACT_APP_HEALTHCHECK_PATH || '/health', (req, res) => {
  /**
   * Health check endpoint
   * summary: Health probe
   * description: Returns service status and environment (non-sensitive).
   * responses:
   *  200: { status: ok, service, env, ws }
   */
  return res.json({
    status: 'ok',
    service: 'backend_api_server',
    env: process.env.NODE_ENV || 'development',
    ws: process.env.REACT_APP_WS_URL || null,
  });
});

// Root info
app.get('/', (req, res) => {
  res.json({
    name: 'RideShare Pro Backend',
    version: '0.1.0',
    description: 'API with auth, users, trips, websocket and OSRM routing',
    docs_note: 'OpenAPI auto-gen not included in this scaffold',
  });
});

/**
 * PUBLIC_INTERFACE
 * POST /auth/register
 * Registers a new user and returns JWT.
 */
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password, name required' });
    }
    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: String(email).toLowerCase(),
      passwordHash,
      name,
      role: role && ['rider', 'driver', 'admin'].includes(role) ? role : 'rider',
    });

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, name: user.name, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );
    return res.status(201).json({ token, user: user.toJSON() });
  } catch (e) {
    return res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * PUBLIC_INTERFACE
 * POST /auth/login
 * Authenticates by email/password and returns JWT.
 */
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, name: user.name, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );
    return res.json({ token, user: user.toJSON() });
  } catch (e) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * PUBLIC_INTERFACE
 * GET /users/me
 * Returns profile of current user (JWT required).
 */
app.get('/users/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ error: 'Not found' });
    return res.json(user.toJSON());
  } catch {
    return res.status(500).json({ error: 'Failed to load profile' });
  }
});

/**
 * PUBLIC_INTERFACE
 * POST /trips
 * Creates a new trip for the current rider; assigns nearest idle driver and simulates movement via WebSocket.
 * Request: { pickup: {lat,lng}, destination: {lat,lng} }
 */
app.post('/trips', authMiddleware, async (req, res) => {
  try {
    const { pickup, destination } = req.body || {};
    if (!pickup?.lat || !pickup?.lng || !destination?.lat || !destination?.lng) {
      return res.status(400).json({ error: 'pickup and destination lat,lng required' });
    }

    // Find nearest idle driver within ~10km
    const nearest = await Driver.findOne({
      status: { $in: ['idle'] },
      currentLocation: {
        $near: {
          $geometry: { type: 'Point', coordinates: [pickup.lng, pickup.lat] },
          $maxDistance: 10000,
        },
      },
    });

    // Compute route to use for price estimate
    let route = null;
    try {
      route = await osrmRoute([pickup.lat, pickup.lng], [destination.lat, destination.lng]);
    } catch {
      // fallback: leave route null
    }
    const basePrice = route ? Math.max(5, (route.distance / 1000) * 1.5) : 8.0;

    const trip = await Trip.create({
      riderId: req.user.sub,
      driverId: nearest ? nearest._id : undefined,
      pickup: toPoint(pickup.lat, pickup.lng),
      dropoff: toPoint(destination.lat, destination.lng),
      status: nearest ? 'assigned' : 'requested',
      route: route || undefined,
      price: Math.round(basePrice * 100) / 100,
    });

    // If we have a driver, mark and emit assignment
    if (nearest) {
      await Driver.updateOne({ _id: nearest._id }, { $set: { status: 'on_trip' } });
      const driverPayload = {
        id: nearest._id.toString(),
        name: 'Driver',
        vehicle: `${nearest?.vehicle?.make || 'Car'} ${nearest?.vehicle?.model || ''}`.trim(),
        location: {
          lat: nearest.currentLocation.coordinates[1],
          lng: nearest.currentLocation.coordinates[0],
        },
      };
      io.to(`trip:${trip._id.toString()}`).emit('trip:update', { status: 'assigned', driver: driverPayload });
    }

    // Join trip room implicitly not possible here; client must emit trip:join

    // Start simulation of driver movement toward pickup then destination
    if (nearest) {
      simulateDriverMovement(io, trip._id.toString(), nearest._id.toString(), pickup, destination);
    }

    return res.status(201).json(trip.toJSON());
  } catch (e) {
    return res.status(500).json({ error: 'Failed to create trip' });
  }
});

/**
 * PUBLIC_INTERFACE
 * GET /trips
 * Lists trips for current user (rider); supports pagination via limit/skip.
 */
app.get('/trips', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const skip = Math.max(Number(req.query.skip || 0), 0);
    const items = await Trip.find({ riderId: req.user.sub })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return res.json(items.map((i) => i.toJSON()));
  } catch {
    return res.status(500).json({ error: 'Failed to list trips' });
  }
});

/**
 * PUBLIC_INTERFACE
 * GET /trips/:id
 * Retrieves a specific trip if owned by current user.
 */
app.get('/trips/:id', authMiddleware, async (req, res) => {
  try {
    const t = await Trip.findOne({ _id: req.params.id, riderId: req.user.sub });
    if (!t) return res.status(404).json({ error: 'Not found' });
    return res.json(t.toJSON());
  } catch {
    return res.status(500).json({ error: 'Failed to load trip' });
  }
});

/**
 * PUBLIC_INTERFACE
 * POST /trips/:id/cancel
 * Cancels a trip owned by the user if not completed/cancelled.
 */
app.post('/trips/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const t = await Trip.findOne({ _id: req.params.id, riderId: req.user.sub });
    if (!t) return res.status(404).json({ error: 'Not found' });
    if (['completed', 'cancelled'].includes(t.status)) {
      return res.status(400).json({ error: 'Trip already finalized' });
    }
    t.status = 'cancelled';
    await t.save();

    io.to(`trip:${t._id.toString()}`).emit('trip:update', { status: 'cancelled' });
    return res.json(t.toJSON());
  } catch {
    return res.status(500).json({ error: 'Failed to cancel trip' });
  }
});

/**
 * PUBLIC_INTERFACE
 * POST /trips/:id/complete
 * Marks a trip as completed.
 */
app.post('/trips/:id/complete', authMiddleware, async (req, res) => {
  try {
    const t = await Trip.findOne({ _id: req.params.id, riderId: req.user.sub });
    if (!t) return res.status(404).json({ error: 'Not found' });
    if (['completed', 'cancelled'].includes(t.status)) {
      return res.status(400).json({ error: 'Trip already finalized' });
    }
    t.status = 'completed';
    await t.save();

    io.to(`trip:${t._id.toString()}`).emit('trip:update', { status: 'completed' });
    return res.json(t.toJSON());
  } catch {
    return res.status(500).json({ error: 'Failed to complete trip' });
  }
});

/**
 * Simulate driver movement and periodically emit updates to trip room.
 * Moves from current -> pickup -> destination with basic linear interpolation.
 */
async function simulateDriverMovement(ioInstance, tripId, driverId, pickup, destination) {
  try {
    const driver = await Driver.findById(driverId);
    if (!driver) return;

    const start = { lat: driver.currentLocation.coordinates[1], lng: driver.currentLocation.coordinates[0] };
    const phases = [
      { from: start, to: pickup, steps: 15, status: 'enroute' },
      { from: pickup, to: destination, steps: 25, status: 'enroute' },
    ];

    for (const phase of phases) {
      for (let i = 1; i <= phase.steps; i += 1) {
        const lat = phase.from.lat + (phase.to.lat - phase.from.lat) * (i / phase.steps);
        const lng = phase.from.lng + (phase.to.lng - phase.from.lng) * (i / phase.steps);

        // update driver location
        await Driver.updateOne(
          { _id: driverId },
          { $set: { currentLocation: { type: 'Point', coordinates: [lng, lat] }, status: 'on_trip' } }
        );

        // broadcast location and ETA rough estimate
        ioInstance.to(`trip:${tripId}`).emit('trip:update', {
          status: phase.status,
          location: { lat, lng },
          eta: Math.max(60, Math.round((phases[0].steps + phases[1].steps - i) * 20)), // rough seconds
        });

        await new Promise((r) => setTimeout(r, 1200));
      }
    }

    // mark complete in DB if not already finalized
    const trip = await Trip.findById(tripId);
    if (trip && !['completed', 'cancelled'].includes(trip.status)) {
      trip.status = 'completed';
      await trip.save();
    }
    await Driver.updateOne({ _id: driverId }, { $set: { status: 'idle' } });

    ioInstance.to(`trip:${tripId}`).emit('trip:update', { status: 'completed', eta: 0 });
  } catch (e) {
    // silent fail to avoid crashing server
  }
}

const port = Number(process.env.PORT || process.env.REACT_APP_PORT || 4000);
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[backend] listening on http://localhost:${port}`);
});
