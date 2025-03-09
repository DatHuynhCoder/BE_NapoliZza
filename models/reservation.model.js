import mongoose, { Schema } from "mongoose";

const ReservationSchema = new mongoose.Schema({
  quantity: {type: Number, default: 0},
  time: {type, Date, default: Date.now},
  status: {
    type: String,
    enum: ['pending','in-progress','completed','canceled'],
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
  tableId: {
    type: Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  }
},{
  timestamps: true
});

export default Reservation = mongoose.model('Reservation', ReservationSchema)