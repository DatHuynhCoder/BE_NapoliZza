import mongoose, { Schema } from "mongoose";

const PaymentSchema = new mongoose.Schema({
  reservationId: {
    type: Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true
  },
  amount: {type: Number, default: 0},
  method: {type: String, required: true},
  status: {type: Boolean, required: false}
},{
  timestamps: true
});

export const Payment = mongoose.model('Payment', PaymentSchema);