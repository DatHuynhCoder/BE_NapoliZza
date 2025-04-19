import mongoose, { Schema } from "mongoose";

const ReservationSchema = new mongoose.Schema({
  quantity: {type: Number, default: 0},
  time: {type: Date, default: Date.now},
  status: {
    type: String,
    enum: ['pending','confirmed','rejected','canceled'],
    default: 'pending'
  },
  totalPrice: {type: Number, required: true},
  listDishes:[
    {
      dishId: {
        type: Schema.Types.ObjectId,
        ref: 'Dish',
        required: true
      },
      quantity: {type: Number, required: true}
    }
  ],
  note: {type: String},
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  numGuests: Number,
  paymentMethod: {
    type: String,
    enum: ['cash', 'online',],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
},{
  timestamps: true
});

export const Reservation = mongoose.model('Reservation', ReservationSchema)