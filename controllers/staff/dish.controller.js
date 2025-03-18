import cloudinary from "../../config/cloudinary.js";
import { Dish } from "../../models/dish.model.js";
import { deleteTempFiles } from "../../utils/deleteTempFiles.js";

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

    // Upload dish images to Cloudinary
    const dishFiles = req.files.images || [];
    const dishImgs = [];
    for (const file of dishFiles) {
      const foodImg = await cloudinary.uploader.upload(file.path, {
        folder: "NapoliZza/DishImages",
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" }
        ]
      });
      dishImgs.push({ url: foodImg.secure_url, public_id: foodImg.public_id });
    }

    // Upload ingredient images to Cloudinary
    const ingredientFiles = req.files.ingredientImages || [];
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
    deleteTempFiles([...dishFiles, ...ingredientFiles]);

    // Create new dish
    const newDish = await Dish.create({
      name: req.body.name,
      reviewNum: 0,
      dishImgs: dishImgs,
      ingredientImgs: ingredientImgs,
      available: req.body.available,
      description: req.body.description,
      ingredients: ingredients, // Use parsed ingredients
      judgeHeader: req.body.judgeHeader,
      judgeContent: req.body.judgeContent,
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
  
    //Delete all cloudinary dish images
    if (dish.dishImgs && dish.dishImgs.length > 0) {
      for (const img of dish.dishImgs) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    //Delete all cloudinary ingredient images
    if(dish.ingredientImgs && dish.ingredientImgs.length > 0){
      for(const img of dish.ingredientImgs){
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

    // Update dish details
    const updateData = {
      name: req.body.name || dish.name,
      description: req.body.description || dish.description,
      ingredients: ingredients, // Use parsed ingredients
      judgeHeader: req.body.judgeHeader || dish.judgeHeader,
      judgeContent: req.body.judgeContent || dish.judgeContent,
      available: req.body.available || dish.available,
      category: req.body.category || dish.category,
      price: req.body.price || dish.price,
      discount: req.body.discount || dish.discount,
    };

    // Handle dish images
    const dishFiles = req.files.images || [];
    if (dishFiles.length > 0) {
      // Delete old dish images from Cloudinary
      for (const img of dish.dishImgs) {
        await cloudinary.uploader.destroy(img.public_id);
      }

      // Upload new dish images to Cloudinary
      const dishImgs = [];
      for (const file of dishFiles) {
        const foodImg = await cloudinary.uploader.upload(file.path, {
          folder: "NapoliZza/DishImages",
          transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" }
          ]
        });
        dishImgs.push({ url: foodImg.secure_url, public_id: foodImg.public_id });
      }
      updateData.dishImgs = dishImgs;
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
    deleteTempFiles([...dishFiles, ...ingredientFiles]);

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