import { Dish } from "../../models/dish.model.js";
import { DishReview } from "../../models/dishReview.model.js";

export const createComment = async (req, res) => {
  try {
    //get user id from request
    const userID = req.user.id;
    let { rating, reviewContent, dishId } = req.body;

    // check if rating is valid
    if (rating) {
      try {
        rating = parseInt(rating);
      } catch (error) {
        return res.status(400).json({ success: false, message: "Rating must be a number" });
      }
      if (rating < 0 || rating > 5) {
        return res.status(400).json({ success: false, message: "Rating must be in range 0-5" });
      }

      // update dish rating
      const dish = await Dish.findById(dishId);
      if (!dish) {
        return res.status(404).json({ success: false, message: "Dish not found" });
      }
      dish.rating = (dish.rating * dish.reviewNum + rating) / (dish.reviewNum + 1);
      dish.reviewNum += 1;

      //save dish
      await dish.save();
    }

    //create new comment
    const newComment = new DishReview({
      accountId: userID,
      reviewContent,
      dishId,
      rating
    });

    //save comment
    await newComment.save();
    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    console.error("Error in create comment: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const updateComment = async (req, res) => {
  try {
    const commentID = req.user.id;
    let { rating, reviewContent, dishId, accountId } = req.body;

    // Check if required fields are provided
    if (!commentID || !dishId || !accountId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Validate rating
    if (rating !== undefined && rating !== null) {
      try {
        rating = parseInt(rating); // Parse rating as an integer
      } catch (error) {
        return res.status(400).json({ success: false, message: "Rating must be a number" });
      }
      if (rating < 0 || rating > 5) {
        return res.status(400).json({ success: false, message: "Rating must be in range 0-5" });
      }
    }

    // Find the comment to update
    const comment = await DishReview.findOne({ _id: commentID, accountId: accountId, dishId: dishId });

    // If comment not found
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    // Update the comment
    const updateComment = await DishReview.findByIdAndUpdate(
      commentID,
      { rating: rating, reviewContent: reviewContent },
      { new: true }
    );

    // Recalculate the dish rating
    const allComments = await DishReview.find({ dishId: dishId });
    const totalRating = allComments.reduce((sum, comment) => sum + comment.rating, 0);
    const averageRating = totalRating / allComments.length;

    // Update the dish with the new average rating
    const dish = await Dish.findByIdAndUpdate(
      dishId,
      { rating: averageRating, reviewNum: allComments.length },
      { new: true }
    );

    // Success response
    res.status(200).json({
      success: true,
      message: "Update comment and dish rating successfully",
      comment: updateComment,
      dish: dish,
    });
  } catch (error) {
    console.error("Error in update comment: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const deleteComment = async (req, res) => {
  try {
    const commentID = req.user.id;
    const { dishId, accountId } = req.body;

    // Check if required fields are provided
    if (!commentID || !dishId || !accountId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Find the comment to delete
    const comment = await DishReview.findOne({ _id: commentID, accountId: accountId, dishId: dishId });

    // If comment not found
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    // Delete the comment
    await DishReview.findByIdAndDelete(commentID);

    // Recalculate the dish rating
    const allComments = await DishReview.find({ dishId: dishId });
    let averageRating = 0;

    if (allComments.length > 0) {
      const totalRating = allComments.reduce((sum, comment) => sum + comment.rating, 0);
      averageRating = totalRating / allComments.length;
    }

    // Update the dish with the new average rating and review count
    const dish = await Dish.findByIdAndUpdate(
      dishId,
      { rating: averageRating, reviewNum: allComments.length },
      { new: true }
    );

    // Success response
    res.status(200).json({
      success: true,
      message: "Delete comment and update dish rating successfully",
      dish: dish,
    });
  } catch (error) {
    console.error("Error in delete comment: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
