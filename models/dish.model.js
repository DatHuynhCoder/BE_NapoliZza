import mongoose from "mongoose"

const DishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dishImgs: [
    {
      url: String,
      public_id: String
    }
  ],
  description: {type: String, required: true},
  reviewNum: {type: Number, required: true},
  available: {type: Number, required: true},
  category: {type: String},
  quantitySold: {type: Number,default: 0},
  price: {type: Number, required: true},
  discount: {type: Number, required: true}
},{
  timestamps: true
})

export const Dish = mongoose.model('Dish', DishSchema)