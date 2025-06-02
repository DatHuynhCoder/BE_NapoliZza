import mongoose from "mongoose"

const DishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unsignName: { type: String, index: true },
  dishImg:
  {
    url: String,
    public_id: String
  },
  description: { type: String},
  ingredients: { type: [String]},
  ingredientImgs: [
    {
      url: String,
      public_id: String
    }
  ],
  judgeContent: [
    {
      title: String,
      desc: String
    }
  ],
  reviewNum: { type: Number, default: 0 },
  available: { type: Number, default: 0 },
  category: { type: String },
  quantitySold: { type: Number, default: 0 },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0},
  rating: { type: Number, default: 0 }
}, {
  timestamps: true
})

export const Dish = mongoose.model('Dish', DishSchema)