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
  ingredients: {type: [String], default: []},
  ingredientImgs: [
    {
      url: String,
      public_id: String
    }
  ],
  judgeHeader: {type: String},
  judgeContent: {type: String},
  reviewNum: {type: Number, default: 0},
  available: {type: Number, required: true},
  category: {type: String},
  quantitySold: {type: Number,default: 0},
  price: {type: Number, required: true},
  discount: {type: Number, required: true},
  rating: {type: Number, default: 0}
},{
  timestamps: true
})

export const Dish = mongoose.model('Dish', DishSchema)