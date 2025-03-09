import mongoose from "mongoose";

const RestaurantReviewSchema = new mongoose.Schema({
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  reviewContent: {type: String, required: true},
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  rating: {
    food: Number,
    service: Number,
    ambience: Number
  }
},{
  timestamps: true
});

export const RestaurantReview = mongoose.model('RestaurantReview', RestaurantReviewSchema);