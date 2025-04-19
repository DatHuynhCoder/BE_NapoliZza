import cloudinary from "../../config/cloudinary.js";
import { Dish } from "../../models/dish.model.js";
import { deleteTempFiles } from "../../utils/deleteTempFiles.js";
import { search } from "../../utils/search.js";
import { pagination } from "../../utils/pagination.js";

export const createDish = async (req, res) => {
	try {
		const name = req.body.name;

		// Check if dish already exists
		const compareDish = await Dish.findOne({ name: name });
		if (compareDish) {
			return res.status(400).json({ success: false, message: "Dish name already exists" });
		}

		// Parse ingredients if it's sent as a JSON string
		let ingredients = [];
		if (req.body.ingredients) {
			try {
				ingredients = typeof req.body.ingredients === "string" ? JSON.parse(req.body.ingredients) : req.body.ingredients;
			} catch (error) {
				return res.status(400).json({ success: false, message: "Invalid ingredients format. Must be an array or JSON string." });
			}
		}

		// Parse judgeContent if it's sent as a JSON string
		let judgeContent = [];
		if (req.body.judgeContent) {
			try {
				judgeContent = typeof req.body.judgeContent === "string" ? JSON.parse(req.body.judgeContent) : req.body.judgeContent;

				// Ensure it's an array (important check)
				if (!Array.isArray(judgeContent)) {
					return res.status(400).json({ success: false, message: "Invalid judgeContent format. Must be an array." });
				}
			} catch (error) {
				return res.status(400).json({ success: false, message: "Invalid judgeContent JSON format." });
			}
		}


		// Upload dish images to Cloudinary
		const dishFile = req.files.dishImg ? req.files.dishImg[0] : null;
		let dishImg = null;
		if (dishFile) {
			const uploadedDishImg = await cloudinary.uploader.upload(dishFile.path, {
				folder: "NapoliZza/DishImages",
				transformation: [
					{ width: 800, height: 800, crop: "limit" },
					{ quality: "auto" },
					{ fetch_format: "auto" }
				]
			});
			dishImg = { url: uploadedDishImg.secure_url, public_id: uploadedDishImg.public_id };
		}

		// Upload ingredient images to Cloudinary
		const ingredientFiles = req.files.ingredientImgs || [];
		const ingredientImgs = [];
		for (const file of ingredientFiles) {
			const ingredientImg = await cloudinary.uploader.upload(file.path, {
				folder: "NapoliZza/IngredientImages",
				transformation: [
					{ width: 800, height: 800, crop: "limit" },
					{ quality: "auto" },
					{ fetch_format: "auto" }
				]
			});
			ingredientImgs.push({ url: ingredientImg.secure_url, public_id: ingredientImg.public_id });
		}

		// Delete temp uploaded files
		deleteTempFiles([dishFile])
		deleteTempFiles(ingredientFiles);

		// Create new dish
		const newDish = await Dish.create({
			name: req.body.name,
			reviewNum: 0,
			dishImg: dishImg,
			ingredientImgs: ingredientImgs,
			available: req.body.available,
			description: req.body.description,
			ingredients: ingredients, // Use parsed ingredients
			judgeContent: judgeContent,
			category: req.body.category,
			quantitySold: 0,
			price: req.body.price,
			discount: req.body.discount,
			rating: 0
		});

		res.status(201).json({ success: true, data: newDish });
	} catch (error) {
		console.error("Error in create dish: ", error.message);
		return res.status(500).json({ success: false, message: "Server error" });
	}
}

export const deleteDish = async (req, res) => {
	try {
		const dishID = req.params.id;
		const dish = await Dish.findById(dishID);

		//check if dish exists
		if (!dish) {
			return res.status(404).json({ success: false, message: "Dish not found" });
		}

		// Delete the cloudinary dish image
		if (dish.dishImg && dish.dishImg.public_id) {
			await cloudinary.uploader.destroy(dish.dishImg.public_id);
		}

		//Delete all cloudinary ingredient images
		if (dish.ingredientImgs && dish.ingredientImgs.length > 0) {
			for (const img of dish.ingredientImgs) {
				await cloudinary.uploader.destroy(img.public_id);
			}
		}

		await Dish.findByIdAndDelete(dishID);
		res.status(200).json({ success: true, message: "Delete dish successfully" });
	} catch (error) {
		console.error("Error in delete dish: ", error.message);
		return res.status(500).json({ success: false, message: "Server error" });
	}

}

export const updateDish = async (req, res) => {
	try {
		const dishID = req.params.id;

		// Find the dish to update
		const dish = await Dish.findById(dishID);
		if (!dish) {
			return res.status(404).json({ success: false, message: "Dish not found" });
		}

		// Parse ingredients if it's sent as a JSON string
		let ingredients = dish.ingredients; // Default to existing ingredients
		if (req.body.ingredients) {
			try {
				ingredients = typeof req.body.ingredients === "string" ? JSON.parse(req.body.ingredients) : req.body.ingredients;
			} catch (error) {
				return res.status(400).json({ success: false, message: "Invalid ingredients format. Must be an array or JSON string." });
			}
		}

		//Parse judgeContent if it's a JSON string
		let judgeContent = dish.judgeContent;
		if (req.body.judgeContent) {
			try {
				judgeContent = typeof req.body.judgeContent === "string" ? JSON.parse(req.body.judgeContent) : req.body.judgeContent;

				// Ensure it's an array
				if (!Array.isArray(judgeContent)) {
					return res.status(400).json({ success: false, message: "Invalid judgeContent format. Must be an array." });
				}
			} catch (error) {
				return res.status(400).json({ success: false, message: "Invalid judgeContent JSON format." });
			}
		}

		// Update dish details
		const updateData = {
			name: req.body.name || dish.name,
			description: req.body.description || dish.description,
			ingredients: ingredients, // Use parsed ingredients
			judgeContent: judgeContent,
			available: req.body.available || dish.available,
			category: req.body.category || dish.category,
			price: req.body.price || dish.price,
			discount: req.body.discount || dish.discount,
		};

		// Handle dish image (only one image)
		const dishFile = req.files.dishImg ? req.files.dishImg[0] : null;
		if (dishFile) {
			// Delete the old dish image from Cloudinary if it exists
			if (dish.dishImg && dish.dishImg.public_id) {
				await cloudinary.uploader.destroy(dish.dishImg.public_id);
			}

			// Upload the new dish image to Cloudinary
			const uploadedDishImg = await cloudinary.uploader.upload(dishFile.path, {
				folder: "NapoliZza/DishImages",
				transformation: [
					{ width: 800, height: 800, crop: "limit" },
					{ quality: "auto" },
					{ fetch_format: "auto" }
				]
			});

			// Update the dishImg field with the new image URL and public_id
			updateData.dishImg = { url: uploadedDishImg.secure_url, public_id: uploadedDishImg.public_id };
		}

		// Handle ingredient images
		const ingredientFiles = req.files.ingredientImages || [];
		if (ingredientFiles.length > 0) {
			// Delete old ingredient images from Cloudinary
			for (const img of dish.ingredientImgs) {
				await cloudinary.uploader.destroy(img.public_id);
			}

			// Upload new ingredient images to Cloudinary
			const ingredientImgs = [];
			for (const file of ingredientFiles) {
				const ingredientImg = await cloudinary.uploader.upload(file.path, {
					folder: "NapoliZza/IngredientImages",
					transformation: [
						{ width: 800, height: 800, crop: "limit" },
						{ quality: "auto" },
						{ fetch_format: "auto" }
					]
				});
				ingredientImgs.push({ url: ingredientImg.secure_url, public_id: ingredientImg.public_id });
			}
			updateData.ingredientImgs = ingredientImgs;
		}

		// Delete temp uploaded files
		deleteTempFiles([dishFile])
		deleteTempFiles(ingredientFiles);

		// Update the dish in the database
		const updatedDish = await Dish.findByIdAndUpdate(dishID, updateData, { new: true });

		res.status(200).json({ success: true, message: "Dish updated successfully", data: updatedDish });
	} catch (error) {
		console.error("Error in update dish: ", error.message);
		return res.status(500).json({ success: false, message: "Server error" });
	}
}

export const getAllDishes = async (req, res) => {
	try {
		const dishes = await Dish.find({});
		res.status(200).json({ success: true, data: dishes });
	} catch (error) {
		console.error("Error in get all dishes: ", error.message);
		return res.status(500).json({ success: false, message: "Server error" });
	}
}

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
				query.name = { $regex: searchOptions.regex };
			}
		}

		// Handle category filter if provided
		if (category) {
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

export const getTopRatingDishes = async (req, res) => {
	try {
		const topDishes = await Dish.find({}).sort({rating: -1}).limit(20);

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