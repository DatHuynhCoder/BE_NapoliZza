import { Dish } from "../../models/dish.model.js";
import { search } from "../../utils/search.js";
import { pagination } from "../../utils/pagination.js";
import { normalizeString } from "../../utils/normalizeString.js";

export const searchDishes = async (req, res) => {
  try {
    const {
      name,
      category,
      sort = 'quantitySold', // Default sort by quantitySold
      page = 1,
      limit = 10
    } = req.query;

    // Build search query
    const query = {};

    // Handle name search if provided
    if (name) {
      const searchOptions = search(name);
      if (searchOptions) {
        query.unsignName = { $regex: searchOptions.regex };
      }
    }

    // Handle category filter if provided ( if cate = all we skip)
    if (category && normalizeString(category) !== 'all') {
      const searchOptionsCate = search(category);
      if (searchOptionsCate) {
        query.category = { $regex: searchOptionsCate.regex };
      }
    }

    // Handle sorting
    let sortCriteria = {};

    // Parse sort parameter (can be comma-separated for multiple sort criteria)
    const sortFields = sort.split(',');

    // Build sort object
    sortFields.forEach(field => {
      const [fieldName, order] = field.split(':');

      // Only allow valid fields
      if (['quantitySold', 'price', 'rating', 'discount'].includes(fieldName)) {
        sortCriteria[fieldName] = order === 'asc' ? 1 : -1; // Default to desc if not specified
      }
    });

    // If no valid sort criteria were provided, default to quantitySold descending
    if (Object.keys(sortCriteria).length === 0) {
      sortCriteria = { quantitySold: -1 };
    }

    // Apply pagination
    const totalItems = await Dish.countDocuments(query);
    const paginationInfo = pagination(
      { sort: sortCriteria },
      totalItems,
      { page, limit }
    );

    // Execute the query with pagination
    const dishes = await Dish.find(query)
      .sort(paginationInfo.paginatedQuery.sort)
      .skip(paginationInfo.paginatedQuery.skip)
      .limit(paginationInfo.paginatedQuery.limit);

    // Return the results
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
    console.error('Error searching dishes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search dishes',
      error: error.message
    });
  }
}