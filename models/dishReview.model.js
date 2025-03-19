import mongoose, { Schema } from "mongoose";

const DishReviewSchema = new mongoose.Schema({
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  reviewContent: {type: String, required: true},
  dishId: {
    type: Schema.Types.ObjectId,
    ref: 'Dish',
    required: true,
  },
  rating: {type: Number, default: 0},
},{
  timestamps: true
});

export const DishReview = mongoose.model('DishReview', DishReviewSchema);