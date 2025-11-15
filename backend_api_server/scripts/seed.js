import 'dotenv/config';
import mongoose from 'mongoose';
import { connectMongo } from '../src/utils/db.js';
import '../src/models/index.js';

const User = mongoose.model('User');
const Driver = mongoose.model('Driver');

/**
 * PUBLIC_INTERFACE
 * Seed script
 * Creates sample users and drivers for development.
 */
async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // eslint-disable-next-line no-console
    console.error('MONGODB_URI is required in environment');
    process.exit(1);
  }

  await connectMongo(uri);

  // Basic wipe for dev seeding of duplicates (safe in dev only)
  const wipe = String(process.env.WIPE || '1') === '1';
  if (wipe) {
    await Promise.all([User.deleteMany({}), Driver.deleteMany({})]);
  }

  // Sample users
  const users = await User.insertMany([
    { email: 'alice@example.com', passwordHash: 'devhash', name: 'Alice Rider', role: 'rider' },
    { email: 'bob@example.com', passwordHash: 'devhash', name: 'Bob Rider', role: 'rider' },
    { email: 'carol.driver@example.com', passwordHash: 'devhash', name: 'Carol Driver', role: 'driver' },
    { email: 'dave.driver@example.com', passwordHash: 'devhash', name: 'Dave Driver', role: 'driver' }
  ]);

  const driverUsers = users.filter(u => u.role === 'driver');

  // San Francisco-ish coordinates
  const centers = [
    [-122.4194, 37.7749], // SF center
    [-122.4090, 37.7840],
    [-122.4313, 37.7739],
    [-122.4058, 37.7900]
  ];

  const drivers = await Driver.insertMany(
    driverUsers.map((u, idx) => ({
      userId: u._id,
      status: 'idle',
      currentLocation: { type: 'Point', coordinates: centers[idx % centers.length] },
      vehicle: { make: 'Toyota', model: 'Prius', plate: `DEV-${100 + idx}` }
    }))
  );

  // eslint-disable-next-line no-console
  console.log(`Seeded users: ${users.length}, drivers: ${drivers.length}`);
  await mongoose.disconnect();
}

// Execute
main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', e);
  process.exit(1);
});
