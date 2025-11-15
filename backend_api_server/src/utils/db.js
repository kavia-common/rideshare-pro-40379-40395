import mongoose from 'mongoose';

/**
 * PUBLIC_INTERFACE
 * connectMongo
 * Establishes a Mongoose connection using the provided URI. Enables strictQuery and index creation.
 */
export async function connectMongo(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is required. Please set it in the environment.');
  }
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      // modern mongoose 8 uses defaults; kept for clarity
      autoIndex: true
    });
    // eslint-disable-next-line no-console
    console.log('[mongo] connected');

    mongoose.connection.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('[mongo] connection error', err?.message || err);
    });
    mongoose.connection.on('disconnected', () => {
      // eslint-disable-next-line no-console
      console.warn('[mongo] disconnected');
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[mongo] failed to connect:', err?.message || err);
    throw err;
  }
}
