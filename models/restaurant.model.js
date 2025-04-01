import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    street: { type: String, required: true},
    city: {type: String, required: true},
    borough: {type: String, required: true},
    zip: {type: String}
  },
  profit: {
    type: Number,
    default: 0
  },
  quantitySold: {type: Number, default: 0},
  phone: {type: String, required: true},
  starQuality: {type: Number, required: true},
  status: {
    type: String,
    enum: ['pending','active','inactive','deny'],
    default: 'pending'
  },
  description: {type: String },
  resImgs: [
    {
      url : {type: String},
      public_id: {type: String}
    }
  ],
  numReview: {type: Number, default: 0},
  openingHours:[
    {
      day: {type: String, required: true},
      timeOpen: {type: String, required: true},
      timeClose: {type: String, required: true}
    }
  ]
},{
  timestamps: true
});

export const Restaurant = mongoose.model('Restaurant', RestaurantSchema);