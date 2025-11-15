import mongoose from 'mongoose';

const { Schema, Types } = mongoose;

const GeoPointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      // [lng, lat]
      type: [Number],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 2 && arr.every((n) => Number.isFinite(n)),
        message: 'coordinates must be [lng, lat] numeric array'
      }
    }
  },
  { _id: false }
);

const DriverSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['offline', 'idle', 'enroute', 'on_trip'], default: 'offline', index: true },
    currentLocation: {
      type: GeoPointSchema,
      required: true
    },
    vehicle: {
      make: { type: String },
      model: { type: String },
      plate: { type: String }
    }
  },
  {
    timestamps: true
  }
);

// 2dsphere index for geospatial queries on currentLocation
DriverSchema.index({ currentLocation: '2dsphere' });

DriverSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

export default mongoose.models.Driver || mongoose.model('Driver', DriverSchema);
