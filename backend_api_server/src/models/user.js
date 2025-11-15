import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * User roles: 'rider', 'driver', 'admin'
 */
const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['rider', 'driver', 'admin'], default: 'rider', index: true }
  },
  {
    timestamps: true
  }
);

// Basic toJSON cleanup
UserSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.passwordHash;
    return ret;
  }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
