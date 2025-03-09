import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 2 * 60 * 1000), // expires in 2 minutes
    index: { expires: 0 },
  }
},{
  timestamps: true
});

export const OTP = mongoose.model('OTP', OTPSchema);