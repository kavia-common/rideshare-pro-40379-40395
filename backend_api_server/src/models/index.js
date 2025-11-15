import mongoose from 'mongoose';
import './user.js';
import './driver.js';
import './trip.js';

/**
 * PUBLIC_INTERFACE
 * registerModels
 * Ensures models are registered and indexes are created on startup.
 */
export function registerModels() {
  const models = ['User', 'Driver', 'Trip'];
  // Accessing models ensures registration
  models.forEach((name) => mongoose.model(name));
  // Create indexes proactively
  Promise.all(models.map((name) => mongoose.model(name).createIndexes()))
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('[mongo] indexes ensured for models:', models.join(', '));
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.warn('[mongo] index ensure warning:', e?.message || e);
    });
}
