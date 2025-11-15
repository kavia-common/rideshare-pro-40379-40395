import mongoose from 'mongoose';

const { Schema, Types } = mongoose;

const GeoPointSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 2 && arr.every((n) => Number.isFinite(n)),
        message: 'coordinates must be [lng, lat]'
      }
    }
  },
  { _id: false }
);

const TripSchema = new Schema(
  {
    riderId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    driverId: { type: Types.ObjectId, ref: 'Driver', index: true },
    pickup: { type: GeoPointSchema, required: true },
    dropoff: { type: GeoPointSchema, required: true },
    status: {
      type: String,
      enum: ['requested', 'assigned', 'enroute', 'completed', 'cancelled'],
      default: 'requested',
      index: true
    },
    route: {
      distance: { type: Number },   // meters
      duration: { type: Number },   // seconds
      polyline: { type: String }    // encoded polyline (optional)
    },
    price: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

// 2dsphere indexes for geospatial queries
TripSchema.index({ pickup: '2dsphere' });
TripSchema.index({ dropoff: '2dsphere' });

TripSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

export default mongoose.models.Trip || mongoose.model('Trip', TripSchema);
