import { Dish } from "../../models/dish.model.js";
import { DishReview } from "../../models/dishReview.model.js";
import { search } from "../../utils/search.js";
import { pagination } from "../../utils/pagination.js";
import { normalizeString } from "../../utils/normalizeString.js";

export const getAllCategory = async (req, res) => {
  try {
    const categories = await Dish.distinct('category');

    //if cannot find any category
    if (!categories) {
      return res.status(404).json({ success: false, message: "Categories not found" });
    }
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error("Error get all categories", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getAllComments = async (req, res) => {
  try {
    const comments = await DishReview.find({});

    //if cannot find comment
    if (!comments) {
      return res.status(404).json({ success: false, message: "Comments not found" });
    }

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error("Error get comments", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getTopRatingDishes = async (req, res) => {
  try {
    const topDishes = await Dish.find({}).sort({ rating: -1 }).limit(20);

    res.status(200).json({
      success: true,
      data: topDishes
    });
  } catch (error) {
    console.error('Error get top 20 dishes by rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top 20 dishes by rating',
      error: error.message
    });
  }
}

export const getDishes = async (req, res) => {
  try {
    const {
      category,
      page = 1,
      limit = 20
    } = req.query;

    //build get dish query
    const query = {};

    //Handle category filter if provided
    if (category && normalizeString(category) !== 'all') {
      const searchOptionsCate = search(category);
      if (searchOptionsCate) {
        query.category = { $regex: searchOptionsCate.regex }
      }
    }
    //get dishes number
    const totalItems = await Dish.countDocuments(query);

    //Apply pagination
    const paginationInfo = pagination(
      {},
      totalItems,
      { page, limit }
    )

    //Execute the query with pagination
    const dishes = await Dish.find(query)
      .skip(paginationInfo.paginatedQuery.skip)
      .limit(paginationInfo.paginatedQuery.limit)

    //return the result	
    res.status(200).json({
      success: true,
      dishes,
      pagination: {
        currentPage: paginationInfo.currentPage,
        totalPages: paginationInfo.totalPages,
        hasNextPage: paginationInfo.hasNextPage,
        hasPreviousPage: paginationInfo.hasPreviousPage,
        nextPage: paginationInfo.nextPage,
        previousPage: paginationInfo.previousPage
      }
    });
  } catch (error) {
    console.error("Error in get all dishes: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getDishById = async (req, res) => {
  try {
    const dishID = req.params.id;
    const dish = await Dish.findById(dishID);

    //Check if dish exist
    if (!dish) {
      return res.status(404).json({ success: false, message: `Dish with id: ${dishID} not found` });
    }

    res.status(200).json({ success: true, data: dish })
  } catch (error) {
    console.error("Error in get dishe: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getCommentsByDishId = async (req, res) => {
  try {
    const dishID = req.params.id;
    const comments = await DishReview.find({ dishId: dishID }).populate('accountId','username email avatar');

    //if cannot find comment
    if (!comments) {
      return res.status(404).json({ success: false, message: "Comments not found" });
    }

    res.status(200).json({ success: true, data: comments })
  } catch (error) {
    console.error("Error in get dishe: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}